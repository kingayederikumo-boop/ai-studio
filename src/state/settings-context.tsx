"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Settings } from "@/src/types";
import { SettingsService } from "@/src/services/settingsService";

type SettingsContextType = {
  settings: Settings;
  setSettings: (s: Settings) => void;
};

const defaultSettings: Settings = {
  architectureProvider: "OpenAI",
  codingProvider: "Nvidia",
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(defaultSettings);

  useEffect(() => {
    const loaded = SettingsService.load();
    if (loaded) setSettingsState(loaded);
  }, []);

  useEffect(() => {
    SettingsService.save(settings);
  }, [settings]);

  function setSettings(s: Settings) {
    setSettingsState(s);
  }

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
