import { NvidiaService } from "./nvidiaService";

export const ProviderRouter = {
  async generateText(prompt: string) {
    const result = await NvidiaService.inference(prompt);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    return {
      ok: true,
      text: result.payload?.text,
    };
  },
};