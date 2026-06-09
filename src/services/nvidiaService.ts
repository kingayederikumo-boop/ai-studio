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

const NVIDIA_API_BASE = "https://integrate.api.nvidia.com/v1";
const INFERENCE_MODEL = "meta/llama-2-70b-chat";

interface NvidiaKeyRotation {
  currentIndex: number;
  lastError?: string;
}

const keyRotation: NvidiaKeyRotation = {
  currentIndex: 0,
};

function getCurrentKey(): string | null {
  if (NVIDIA_API_KEYS.length === 0) return null;
  return NVIDIA_API_KEYS[keyRotation.currentIndex];
}

function rotateToNextKey(): string | null {
  if (NVIDIA_API_KEYS.length === 0) return null;
  keyRotation.currentIndex =
    (keyRotation.currentIndex + 1) % NVIDIA_API_KEYS.length;
  return NVIDIA_API_KEYS[keyRotation.currentIndex];
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

    try {
      const response = await axios.post(
        `${NVIDIA_API_BASE}/chat/completions`,
        {
          model: INFERENCE_MODEL,
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

      const text =
        response.data?.choices?.[0]?.message?.content ||
        "No response from Nvidia";

      return {
        ok: true,
        payload: {
          text,
        },
      };
    } catch (error) {
      lastError =
        error instanceof AxiosError
          ? error.response?.data?.error?.message ||
            error.message ||
            "Unknown error"
          : error instanceof Error
            ? error.message
            : String(error);

      keyRotation.lastError = lastError;

      if (attempt < maxAttempts - 1) {
        rotateToNextKey();
      }
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
    };
  },
};
