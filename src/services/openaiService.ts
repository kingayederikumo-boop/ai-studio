export const OpenAIService = {
  async generatePlaceholder(prompt: string) {
    return Promise.resolve({ text: `(OpenAI placeholder) ${prompt}` });
  },
};
