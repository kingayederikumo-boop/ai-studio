import type { Settings as SettingsType } from "@/src/types";

export const SettingsService = {
  key: "ai-studio:settings",
  save(settings: SettingsType): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.key, JSON.stringify(settings));
    } catch {
      // noop
    }
  },

  load(): SettingsType | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      return JSON.parse(raw) as SettingsType;
    } catch {
      return null;
    }
  },
};
