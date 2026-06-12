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
        <img src="/logo.png" alt="AI Studio" className="w-40 h-40 object-contain rounded-lg shadow-lg" />
        <div className="text-2xl font-semibold text-white">AI Studio</div>
      </div>
    </div>
  );
}
