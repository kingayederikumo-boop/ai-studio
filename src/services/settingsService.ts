import type { Settings } from "@/src/types";

const STORAGE_KEY = "ai-studio-settings";

export class SettingsService {
  static load(): Settings | null {
    try {
      if (typeof window === "undefined") return null;
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Failed to load settings:", e);
      return null;
    }
  }

  static save(settings: Settings): void {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }

  static clear(): void {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear settings:", e);
    }
  }
}
