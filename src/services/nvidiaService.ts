import axios, { AxiosError } from "axios";

export type NvidiaResponse<T = unknown> = {
  ok: boolean;
  payload?: T;
  error?: string;
};

export interface NvidiaInferencePayload {
  text: string;
}

// Nvidia API Keys from environment
const NVIDIA_API_KEYS = [
  process.env.NVIDIA_API_KEY_1,
  process.env.NVIDIA_API_KEY_2,
  process.env.NVIDIA_API_KEY_3,
  process.env.NVIDIA_API_KEY_4,
].filter(Boolean) as string[];

// Models can be provided as a comma-separated env var. If a list is provided and matches the number of keys,
// each key will be used with the model at the corresponding index. Otherwise, a single default model is used for all keys.
const NVIDIA_MODELS_ENV = process.env.NVIDIA_MODELS || "";
const NVIDIA_MODELS = NVIDIA_MODELS_ENV.split(",").map((s) => s.trim()).filter(Boolean);
const DEFAULT_INFERENCE_MODEL = process.env.NVIDIA_INFERENCE_MODEL || "meta/llama-2-70b-chat";

const NVIDIA_API_BASE = "https://integrate.api.nvidia.com/v1";

interface NvidiaKeyRotation {
  currentIndex: number;
  lastError?: string | null;
}

const keyRotation: NvidiaKeyRotation = {
  currentIndex: 0,
  lastError: null,
};

function getCurrentKey(): string | null {
  if (NVIDIA_API_KEYS.length === 0) return null;
  return NVIDIA_API_KEYS[keyRotation.currentIndex];
}

function getModelForCurrentKey(): string {
  if (NVIDIA_MODELS.length === 0) return DEFAULT_INFERENCE_MODEL;
  // If models array length matches keys, map by index; otherwise use first model for all keys
  if (NVIDIA_MODELS.length === NVIDIA_API_KEYS.length) {
    return NVIDIA_MODELS[keyRotation.currentIndex] || DEFAULT_INFERENCE_MODEL;
  }
  return NVIDIA_MODELS[0] || DEFAULT_INFERENCE_MODEL;
}

function rotateToNextKey(): string | null {
  if (NVIDIA_API_KEYS.length === 0) return null;
  keyRotation.currentIndex = (keyRotation.currentIndex + 1) % NVIDIA_API_KEYS.length;
  return NVIDIA_API_KEYS[keyRotation.currentIndex];
}

function isModelNotFoundError(err: any): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /model not found|does not exist|404/.test(msg.toLowerCase());
}

async function inferenceWithRetry(
  prompt: string
): Promise<NvidiaResponse<NvidiaInferencePayload>> {
  if (NVIDIA_API_KEYS.length === 0) {
    return { ok: false, error: "Nvidia API keys not configured" };
  }

  let lastError: string | null = null;
  const maxAttempts = NVIDIA_API_KEYS.length;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const key = getCurrentKey();
    if (!key) {
      return {
        ok: false,
        error: "No valid Nvidia API keys available",
      };
    }

    const model = getModelForCurrentKey();

    try {
      const response = await axios.post(
        `${NVIDIA_API_BASE}/chat/completions`,
        {
          model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          top_p: 0.7,
          max_tokens: 1024,
        },
        {
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      const text = response.data?.choices?.[0]?.message?.content || "No response from Nvidia";

      return {
        ok: true,
        payload: {
          text,
        },
      };
    } catch (error) {
      lastError =
        error instanceof AxiosError
          ? (error.response?.data?.error?.message as string) || error.message || "Unknown error"
          : error instanceof Error
          ? error.message
          : String(error);

      keyRotation.lastError = lastError;

      // If the error indicates the model doesn't exist or access denied for this model, rotate to next key/model and continue
      if (isModelNotFoundError(error) && attempt < maxAttempts - 1) {
        rotateToNextKey();
        continue;
      }

      // For other transient errors, also rotate keys and retry until maxAttempts
      if (attempt < maxAttempts - 1) {
        rotateToNextKey();
        continue;
      }

      // Exhausted attempts or unrecoverable error
      return {
        ok: false,
        error: `Nvidia API error: ${lastError}`,
      };
    }
  }

  return {
    ok: false,
    error: `Nvidia API error after retries: ${lastError}`,
  };
}

export const NvidiaService = {
  async inference(
    prompt: string
  ): Promise<NvidiaResponse<NvidiaInferencePayload>> {
    return inferenceWithRetry(prompt);
  },

  getKeyRotationStatus() {
    return {
      currentKeyIndex: keyRotation.currentIndex,
      totalKeys: NVIDIA_API_KEYS.length,
      lastError: keyRotation.lastError,
      models: NVIDIA_MODELS.length > 0 ? NVIDIA_MODELS : [DEFAULT_INFERENCE_MODEL],
    };
  },
};
