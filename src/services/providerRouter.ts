import { NvidiaService } from "./nvidiaService";

export type ProviderType = "nvidia";

export interface ProviderResponse {
  ok: boolean;
  text?: string;
  error?: string;
  provider?: ProviderType;
}

export const ProviderRouter = {
  async generateText(prompt: string): Promise<ProviderResponse> {
    const result = await NvidiaService.inference(prompt);
    if (!result.ok) {
      return { ok: false, error: result.error, provider: "nvidia" };
    }
    return {
      ok: true,
      text: result.payload?.text,
      provider: "nvidia",
    };
  },
};