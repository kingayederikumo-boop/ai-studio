export const SettingsService = {
  key: "ai-studio:settings",
  save(settings: any) {
    try {
      localStorage.setItem(this.key, JSON.stringify(settings));
    } catch (e) {
      // noop
    }
  },
  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },
};

export type Settings = {
  architectureProvider: "OpenAI" | "Nvidia";
  codingProvider: "OpenAI" | "Nvidia";
};
