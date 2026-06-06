"use client";

import React, { useEffect, useState } from "react";
import { SettingsService } from "@/src/services/settingsService";
import { useSettings } from "@/src/state/settings-context";

export default function SettingsPage() {
  const { settings, setSettings } = useSettings();
  const [local, setLocal] = useState(settings);

  useEffect(() => setLocal(settings), [settings]);

  function onSave() {
    setSettings(local);
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h2 className="text-2xl font-semibold mb-4">Settings</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Architecture Provider</label>
          <select
            value={local.architectureProvider}
            onChange={(e) => setLocal({ ...local, architectureProvider: e.target.value as any })}
            className="w-full rounded-md bg-zinc-900 border border-zinc-800 p-2"
          >
            <option value="OpenAI">OpenAI</option>
            <option value="Nvidia">Nvidia</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Coding Provider</label>
          <select
            value={local.codingProvider}
            onChange={(e) => setLocal({ ...local, codingProvider: e.target.value as any })}
            className="w-full rounded-md bg-zinc-900 border border-zinc-800 p-2"
          >
            <option value="Nvidia">Nvidia</option>
            <option value="OpenAI">OpenAI</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button onClick={onSave} className="rounded bg-white px-4 py-2 text-black">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
