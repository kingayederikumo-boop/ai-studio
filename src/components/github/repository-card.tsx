"use client";

import React from "react";
import type { GitHubRepository } from "@/src/types/index";

export function RepositoryCard({ repo }: { repo: GitHubRepository }) {
  return (
    <div className="border border-zinc-800 rounded-md p-4 bg-zinc-900">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{repo.name}</div>
          <div className="text-sm text-zinc-400">{repo.description}</div>
        </div>
        <div className="text-sm text-zinc-500">{repo.private ? "Private" : "Public"}</div>
      </div>
    </div>
  );
}