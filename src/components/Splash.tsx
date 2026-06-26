"use client";

import React, { useEffect, useState } from "react";

export default function Splash({ duration = 1600 }: { duration?: number }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="flex flex-col items-center gap-4">
        <img src="/logo.svg" alt="AI Studio" className="w-40 h-40 object-contain rounded-lg shadow-2xl" />
        <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">AI STUDIO</div>
      </div>
    </div>
  );
}
