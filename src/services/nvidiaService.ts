import axios, { AxiosError } from "axios";

export type NvidiaResponse<T = unknown> = {
  ok: boolean;
  payload?: T;
  error?: string;
};

export interface NvidiaInferencePayload {
  text: string;
}

const NVIDIA_API_KEYS = [process.env.NVIDIA_API_KEY, process.env.NVIDIA_API_KEY_1].filter(Boolean) as string[];

const NVIDIA_API_BASE = "https://integrate.api.nvidia.com/v1";
const DEFAULT_MODEL = process.env.NVIDIA_INFERENCE_MODEL || "nvidia/nemotron-3-ultra-550b-a55b";

async function inferenceWithRetry(prompt: string): Promise<NvidiaResponse<NvidiaInferencePayload>> {
  if (NVIDIA_API_KEYS.length === 0) {
    return { ok: false, error: "NVIDIA_API_KEY not configured. Check Vercel environment variables." };
  }

  // Try keys in rotation
  for (const key of NVIDIA_API_KEYS) {
    try {
      const response = await axios.post(
        `${NVIDIA_API_BASE}/chat/completions`,
        {
          model: DEFAULT_MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1024,
        },
        {
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          timeout: 45000,
        }
      );

      const text = response.data?.choices?.[0]?.message?.content || "";
      return { ok: true, payload: { text } };
    } catch (error) {
      const msg = error instanceof AxiosError ? (error.response?.data?.error?.message || error.message) : String(error);
      console.error(`[NVIDIA Key Error]`, msg);
      // Continue to next key
    }
  }
  return { ok: false, error: "All NVIDIA keys failed. Verify keys in Vercel and model access." };
}

export const NvidiaService = {
  async inference(prompt: string): Promise<NvidiaResponse<NvidiaInferencePayload>> {
    return inferenceWithRetry(prompt);
  },
};