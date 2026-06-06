import type { Settings as SettingsType } from "@/src/types";

const STORAGE_KEY = "ai-studio:settings";

export const SettingsService = {
  save(settings: SettingsType): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // noop
    }
  },

  load(): SettingsType | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        (parsed.architectureProvider === "OpenAI" || parsed.architectureProvider === "Nvidia") &&
        (parsed.codingProvider === "OpenAI" || parsed.codingProvider === "Nvidia")
      ) {
        return parsed as SettingsType;
      }
      return null;
    } catch {
      return null;
    }
  },

  clear(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // noop
    }
  },
};
