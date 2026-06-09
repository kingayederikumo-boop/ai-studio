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

export const OpenAIService = {
  async generateText(
    prompt: string
  ): Promise<OpenAIResponse<OpenAIGenerateTextPayload>> {
    if (!API_KEY) {
      return { ok: false, error: "OpenAI API key not configured" };
    }

    try {
      const client = getClient();
      const message = await client.messages.create({
        model: "gpt-4-turbo",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const textContent = message.content[0];
      if (textContent.type !== "text") {
        return { ok: false, error: "Unexpected response type from OpenAI" };
      }

      return {
        ok: true,
        payload: {
          text: textContent.text,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return { ok: false, error: `OpenAI API error: ${errorMessage}` };
    }
  },
};
