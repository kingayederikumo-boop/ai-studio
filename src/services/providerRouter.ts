import type { Settings } from "@/src/types/index";
import { OpenAIService } from "./openaiService";
import { NvidiaService } from "./nvidiaService";

export type ProviderType = "openai" | "nvidia";

export interface ProviderResponse {
  ok: boolean;
  text?: string;
  error?: string;
}

export const ProviderRouter = {
  selectArchitecture(settings: Settings): ProviderType {
    if (settings.architectureProvider === "Nvidia") return "nvidia";
    return "openai";
  },

  selectCoding(settings: Settings): ProviderType {
    if (settings.codingProvider === "Nvidia") return "nvidia";
    return "openai";
  },

  async generateText(
    prompt: string,
    provider: ProviderType
  ): Promise<ProviderResponse> {
    try {
      if (provider === "nvidia") {
        const result = await NvidiaService.inference(prompt);
        if (!result.ok) {
          return { ok: false, error: result.error };
        }
        return {
          ok: true,
          text: result.payload?.text,
        };
      } else {
        const result = await OpenAIService.generateText(prompt);
        if (!result.ok) {
          return { ok: false, error: result.error };
        }
        return {
          ok: true,
          text: result.payload?.text,
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return { ok: false, error: `Provider error: ${errorMessage}` };
    }
  },
};
