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
  // Try to handle various SDK response shapes
  try {
    const choice = response?.choices?.[0];
    if (!choice) return null;
    // Newer SDK: choice.message.content may be string or array
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
    // Older fallback
    if (typeof choice.text === "string") return choice.text;
  } catch (e) {
    // ignore
  }
  return null;
}

export const OpenAIService = {
  async generateText(
    prompt: string
  ): Promise<OpenAIResponse<OpenAIGenerateTextPayload>> {
    if (!API_KEY) {
      return { ok: false, error: "OpenAI API key not configured" };
    }

    try {
      const client = getClient();

      // Use the official SDK chat completions API
      const response = await client.chat.completions.create({
        model: "gpt-4-turbo",
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
        return { ok: false, error: "Unable to parse OpenAI response" };
      }

      return { ok: true, payload: { text } };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { ok: false, error: `OpenAI API error: ${errorMessage}` };
    }
  },
};
