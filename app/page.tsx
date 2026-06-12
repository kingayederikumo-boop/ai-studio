"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show splash screen for 2 seconds, then redirect to chat
    const timer = setTimeout(() => {
      router.push("/chat");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex flex-col items-center justify-center gap-8 animate-fade-in">
        {/* Logo */}
        <div className="w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
          <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="gradientA" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#00E5FF", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "#2E5FFF", stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="gradientB" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#2E5FFF", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "#A84EFF", stopOpacity: 1 }} />
              </linearGradient>
            </defs>

            {/* Letter A */}
            <g>
              <polygon
                points="240,750 470,280 550,280 780,750 680,750 630,630 390,630 340,750"
                fill="url(#gradientA)"
                stroke="none"
              />
            </g>

            {/* Letter S/5 shape */}
            <g>
              <path
                d="M 820 350 Q 950 350 950 420 Q 950 480 850 500 L 750 520"
                fill="none"
                stroke="url(#gradientB)"
                strokeWidth="120"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 750 520 Q 850 540 950 580 Q 950 640 820 660"
                fill="none"
                stroke="url(#gradientB)"
                strokeWidth="120"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 820 660 Q 700 660 700 730 Q 700 780 800 800 Q 900 820 950 800"
                fill="none"
                stroke="url(#gradientB)"
                strokeWidth="120"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
            AI Studio
          </h1>
          <p className="text-lg text-zinc-400 mt-4">Powered by Advanced Intelligence</p>
        </div>

        {/* Loading indicator */}
        <div className="flex gap-2 mt-8">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
