import axios from 'axios';

export interface LangChainMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LangChainResponse {
  ok: boolean;
  content?: string;
  reasoning?: string;
  error?: string;
  model?: string;
  provider?: string;
}

interface ModelConfig {
  name: string;
  apiKey: string | undefined;
  provider: string;
  apiBase?: string;
}

// LangChain API Keys from environment
const LANGCHAIN_MODELS: ModelConfig[] = [
  {
    name: 'nvidia/nemotron-3-ultra-550b-a55b',
    apiKey: process.env.LANGCHAIN_NVIDIA_API_KEY,
    provider: 'nvidia',
  },
  {
    name: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
    apiKey: process.env.LANGCHAIN_NVIDIA_API_KEY,
    provider: 'nvidia',
  },
  {
    name: 'qwen/qwen2.5-coder-32b-instruct',
    apiKey: process.env.LANGCHAIN_QWEN_API_KEY,
    provider: 'qwen',
  },
  {
    name: 'deepseek-ai/deepseek-v4-pro',
    apiKey: process.env.LANGCHAIN_DEEPSEEK_API_KEY,
    provider: 'deepseek',
  },
  {
    name: 'moonshotai/kimi-k2.b',
    apiKey: process.env.LANGCHAIN_KIMI_API_KEY,
    provider: 'kimi',
  },
];

// Filter out models without API keys
const AVAILABLE_MODELS = LANGCHAIN_MODELS.filter((m) => m.apiKey);

interface ModelRotation {
  currentIndex: number;
  lastError?: string | null;
}

const modelRotation: ModelRotation = {
  currentIndex: 0,
  lastError: null,
};

function getCurrentModel(): ModelConfig | null {
  if (AVAILABLE_MODELS.length === 0) return null;
  return AVAILABLE_MODELS[modelRotation.currentIndex];
}

function rotateToNextModel(): ModelConfig | null {
  if (AVAILABLE_MODELS.length === 0) return null;
  modelRotation.currentIndex = (modelRotation.currentIndex + 1) % AVAILABLE_MODELS.length;
  return AVAILABLE_MODELS[modelRotation.currentIndex];
}

async function invokeModel(
  messages: LangChainMessage[],
  model: ModelConfig,
  maxRetries: number = 3
): Promise<LangChainResponse> {
  if (!model.apiKey) {
    return {
      ok: false,
      error: `API key not configured for ${model.name}`,
    };
  }

  try {
    // Using the NVIDIA API endpoint (supports multiple models including Kimi, DeepSeek, etc)
    const response = await axios.post(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        model: model.name,
        messages: messages,
        temperature: 1,
        top_p: 1,
        max_tokens: 16384,
      },
      {
        headers: {
          Authorization: `Bearer ${model.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

    const choice = response.data?.choices?.[0];
    const content = choice?.message?.content || '';
    const reasoning = choice?.message?.additional_kwargs?.reasoning_content || '';

    return {
      ok: true,
      content,
      reasoning,
      model: model.name,
      provider: model.provider,
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : String(error);
    const status = error && typeof error === 'object' && 'response' in error
      ? (error as any).response?.status
      : undefined;

    // If 404 or model not found, try next model
    if (status === 404) {
      return {
        ok: false,
        error: `Model not found: ${model.name}. ${errorMsg}`,
        model: model.name,
      };
    }

    return {
      ok: false,
      error: errorMsg,
      model: model.name,
    };
  }
}

async function inferenceWithRetry(
  messages: LangChainMessage[],
  specificModel?: string
): Promise<LangChainResponse> {
  if (AVAILABLE_MODELS.length === 0) {
    return {
      ok: false,
      error: 'No LangChain API keys configured',
    };
  }

  let lastError: string | null = null;
  const maxAttempts = AVAILABLE_MODELS.length;
  let allAttemptsWere404 = true;

  // If specific model requested, try it first
  if (specificModel) {
    const specificModelConfig = AVAILABLE_MODELS.find((m) => m.name === specificModel);
    if (specificModelConfig) {
      const result = await invokeModel(messages, specificModelConfig);
      if (result.ok) {
        return result;
      }
      lastError = result.error || lastError;
      if (!result.error?.includes('not found')) {
        allAttemptsWere404 = false;
      }
    }
  }

  // Try models in rotation
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const model = getCurrentModel();
    if (!model) {
      return {
        ok: false,
        error: 'No valid LangChain models available',
      };
    }

    // Skip if this is the specific model we already tried
    if (specificModel && model.name === specificModel) {
      rotateToNextModel();
      continue;
    }

    const result = await invokeModel(messages, model);

    if (result.ok) {
      return result;
    }

    lastError = result.error || lastError;

    // Track if this is a 404
    if (!result.error?.includes('not found') && !result.error?.includes('404')) {
      allAttemptsWere404 = false;
    }

    modelRotation.lastError = lastError;
    rotateToNextModel();
  }

  if (allAttemptsWere404) {
    return {
      ok: false,
      error: `All LangChain models returned 404. Check model names, API keys, and endpoint availability. Last error: ${lastError}`,
    };
  }

  return {
    ok: false,
    error: `LangChain inference failed after retries: ${lastError}`,
  };
}

export const LangChainService = {
  /**
   * Invoke LangChain model with message(s)
   * @param messages Array of messages with role and content
   * @param specificModel Optional: specific model to use (e.g., "moonshotai/kimi-k2.b")
   */
  async invoke(
    messages: LangChainMessage[],
    specificModel?: string
  ): Promise<LangChainResponse> {
    return inferenceWithRetry(messages, specificModel);
  },

  /**
   * Invoke with text prompt (convenience method)
   */
  async invokeText(prompt: string, specificModel?: string): Promise<LangChainResponse> {
    return this.invoke([{ role: 'user', content: prompt }], specificModel);
  },

  /**
   * Get current model rotation status
   */
  getModelRotationStatus() {
    return {
      currentModelIndex: modelRotation.currentIndex,
      currentModel: getCurrentModel()?.name || 'None',
      totalAvailableModels: AVAILABLE_MODELS.length,
      lastError: modelRotation.lastError,
      availableModels: AVAILABLE_MODELS.map((m) => ({
        name: m.name,
        provider: m.provider,
        hasApiKey: !!m.apiKey,
      })),
    };
  },

  /**
   * Set current model by index
   */
  setCurrentModelIndex(index: number): boolean {
    if (index < 0 || index >= AVAILABLE_MODELS.length) return false;
    modelRotation.currentIndex = index;
    return true;
  },

  /**
   * Get list of available models
   */
  getAvailableModels() {
    return AVAILABLE_MODELS.map((m) => m.name);
  },
};
