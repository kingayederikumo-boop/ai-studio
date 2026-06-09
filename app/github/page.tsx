"use client";

import React, { useEffect, useState } from "react";
import { RepositoryCard } from "@/src/components/github/repository-card";
import type { GitHubRepository } from "@/src/types/index";

export default function GitHubPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/github/list");
        const data = await res.json();
        if (!mounted) return;
        if (!data.ok) {
          setError(data.error || "Failed to fetch");
          setRepos([]);
        } else {
          setRepos(data.repos || []);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : String(err));
        setRepos([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="p-6">Loading repositories...</div>;

  if (error)
    return <div className="p-6 text-red-400">Error: {error}</div>;

  if (repos.length === 0)
    return <div className="p-6 text-zinc-400">No repositories found.</div>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h2 className="text-2xl font-semibold mb-4">GitHub</h2>
      <div className="grid gap-4">
        {repos.map((r) => (
          <RepositoryCard key={r.id} repo={r} />
        ))}
      </div>
    </div>
  );
}
