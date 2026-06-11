import type { Settings } from "@/src/types/index";
import { OpenAIService } from "./openaiService";
import { NvidiaService } from "./nvidiaService";

export type ProviderType = "openai" | "nvidia";

export interface ProviderResponse {
  ok: boolean;
  text?: string;
  error?: string;
  provider?: ProviderType;
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
          return { ok: false, error: result.error, provider: "nvidia" };
        }
        return {
          ok: true,
          text: result.payload?.text,
          provider: "nvidia",
        };
      } else {
        const result = await OpenAIService.generateText(prompt);
        if (!result.ok) {
          // If OpenAI returns a quota error (429) or a message indicating quota, try Nvidia fallback
          const err = result.error || "";
          if (err.toLowerCase().includes("quota") || err.includes("429")) {
            const n = await NvidiaService.inference(prompt);
            if (n.ok) return { ok: true, text: n.payload?.text, provider: "nvidia" };
            return { ok: false, error: `OpenAI quota exceeded and Nvidia fallback failed: ${n.error}`, provider: "nvidia" };
          }

          return { ok: false, error: result.error, provider: "openai" };
        }
        return {
          ok: true,
          text: result.payload?.text,
          provider: "openai",
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return { ok: false, error: `Provider error: ${errorMessage}` };
    }
  },
};
