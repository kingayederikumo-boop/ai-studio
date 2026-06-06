export const ProviderRouter = {
  selectArchitecture(settings: { architectureProvider: string }) {
    if (settings.architectureProvider === "Nvidia") return "nvidia";
    return "openai";
  },
  selectCoding(settings: { codingProvider: string }) {
    if (settings.codingProvider === "Nvidia") return "nvidia";
    return "openai";
  },
};
