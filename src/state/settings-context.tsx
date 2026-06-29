"use client";
import React, { createContext, useContext, useState } from "react";

export interface Settings {
  architectureProvider: 'Nvidia' | 'OpenAI';
}

const defaultSettings: Settings = { architectureProvider: 'Nvidia' };

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings] = useState(defaultSettings);
  return <SettingsContext.Provider value={{ settings }}>{children}</SettingsContext.Provider>;
}

const SettingsContext = createContext({ settings: defaultSettings });
export const useSettings = () => useContext(SettingsContext);