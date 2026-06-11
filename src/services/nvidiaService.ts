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

// Models can be provided as a comma-separated env var mapped to keys, or left blank.
const NVIDIA_MODELS_ENV = process.env.NVIDIA_MODELS || "";
const NVIDIA_MODELS = NVIDIA_MODELS_ENV.split(",").map((s) => s.trim()).filter(Boolean);
const DEFAULT_INFERENCE_MODEL = process.env.NVIDIA_INFERENCE_MODEL || "meta/llama-2-70b-chat";

// Default candidate models to try when no explicit mapping is provided
const DEFAULT_MODEL_CANDIDATES = [
  "meta/llama-2-70b-chat",
  "meta/llama-2-13b-chat",
  "meta/llama-2-7b-chat",
  "meta/llama-2-3b-chat",
];

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

export function setCurrentKeyIndex(index: number) {
  if (NVIDIA_API_KEYS.length === 0) return null;
  if (index < 0 || index >= NVIDIA_API_KEYS.length) return null;
  keyRotation.currentIndex = index;
  return keyRotation.currentIndex;
}

function getModelCandidatesForKey(index: number): string[] {
  // If NVIDIA_MODELS has the same length as keys, each key has its own mapped model (single)
  if (NVIDIA_MODELS.length === NVIDIA_API_KEYS.length) {
    const model = NVIDIA_MODELS[index] || DEFAULT_INFERENCE_MODEL;
    return [model];
  }
  // If a list of models provided but does not match keys, try that list first
  if (NVIDIA_MODELS.length > 0) return NVIDIA_MODELS;
  // Default candidate list
  return DEFAULT_MODEL_CANDIDATES;
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

async function tryModelWithKey(prompt: string, key: string, model: string): Promise<{ ok: boolean; text?: string; error?: string; status?: number }> {
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

    const text = response.data?.choices?.[0]?.message?.content || "";
    return { ok: true, text };
  } catch (error) {
    const lastError =
      error instanceof AxiosError
        ? (error.response?.data?.error?.message as string) || error.message || "Unknown error"
        : error instanceof Error
        ? error.message
        : String(error);
    const status = error instanceof AxiosError ? error.response?.status : undefined;
    return { ok: false, error: lastError, status };
  }
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

    const modelCandidates = getModelCandidatesForKey(keyRotation.currentIndex);

    for (const model of modelCandidates) {
      const res = await tryModelWithKey(prompt, key, model);
      if (res.ok) {
        // success
        return { ok: true, payload: { text: res.text || "" } };
      }

      // record last error
      lastError = res.error || lastError;

      // If model not found for this model, try next model candidate with the same key
      if (res.status === 404 || isModelNotFoundError(res.error)) {
        continue;
      }

      // For other errors, try next model candidate first; if exhausted, rotate to next key
      // continue to next candidate
    }

    // After trying all candidates for this key, rotate to the next key and try again
    keyRotation.lastError = lastError;
    if (attempt < maxAttempts - 1) {
      rotateToNextKey();
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
      models: NVIDIA_MODELS.length > 0 ? NVIDIA_MODELS : DEFAULT_MODEL_CANDIDATES,
    };
  },

  setCurrentKeyIndex,
};
