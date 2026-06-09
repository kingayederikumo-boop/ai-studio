import OpenAI from "openai";

export type OpenAIResponse<T = unknown> = {
  ok: boolean;
  payload?: T;
  error?: string;
};

export interface OpenAIGenerateTextPayload {
  text: string;
}

const API_KEY = process.env.OPENAI_API_KEY;
// Model can be provided via env. If not provided, we'll try a prioritized list.
const ENV_MODEL = process.env.OPENAI_MODEL;
const DEFAULT_MODEL_CANDIDATES = ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"];

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openaiClient) {
    if (!API_KEY) {
      throw new Error("OpenAI API key not configured");
    }
    openaiClient = new OpenAI({ apiKey: API_KEY });
  }
  return openaiClient;
}

function extractTextFromChatResponse(response: any): string | null {
  try {
    const choice = response?.choices?.[0];
    if (!choice) return null;
    const msg = choice.message;
    if (typeof msg === "string") return msg;
    if (msg) {
      const content = msg.content;
      if (typeof content === "string") return content;
      if (Array.isArray(content) && content.length > 0) {
        const part = content.find((p: any) => typeof p?.text === "string") || content[0];
        return part?.text ?? null;
      }
    }
    if (typeof choice.text === "string") return choice.text;
  } catch (e) {
    // ignore
  }
  return null;
}

function isModelNotFoundError(err: any): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /does not exist|model not found|404/.test(msg.toLowerCase());
}

export const OpenAIService = {
  async generateText(
    prompt: string
  ): Promise<OpenAIResponse<OpenAIGenerateTextPayload>> {
    if (!API_KEY) {
      return { ok: false, error: "OpenAI API key not configured" };
    }

    const client = getClient();
    const modelsToTry = ENV_MODEL ? [ENV_MODEL, ...DEFAULT_MODEL_CANDIDATES] : DEFAULT_MODEL_CANDIDATES;

    let lastError: string | null = null;

    for (const model of modelsToTry) {
      try {
        const response = await (client as any).chat.completions.create({
          model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 1024,
          temperature: 0.7,
        });

        const text = extractTextFromChatResponse(response as any);
        if (!text) {
          lastError = "Unable to parse OpenAI response";
          continue;
        }

        return { ok: true, payload: { text } };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        lastError = message;
        // If model-specific error (not found / no access), try the next model
        if (isModelNotFoundError(err)) {
          continue;
        }
        // For other errors return immediately
        return { ok: false, error: `OpenAI API error: ${message}` };
      }
    }

    return { ok: false, error: `OpenAI API error after trying models: ${lastError}` };
  },
};
