// Minimal stub for OpenAI fallback
export const OpenAIService = {
  async generateText(prompt: string) {
    // TODO: Implement or use openai pkg
    return { ok: false, error: 'OpenAI not fully configured' };
  }
};