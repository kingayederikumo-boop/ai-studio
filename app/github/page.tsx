"use client";

import React, { useEffect, useState } from "react";
import { GitHubService } from "@/src/services/githubService";
import { RepositoryCard } from "@/src/components/github/repository-card";

export default function GitHubPage() {
  const [loading, setLoading] = useState(true);
  const [repos, setRepos] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const list = await GitHubService.listRepositories();
      if (mounted) setRepos(list);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="p-6">Loading repositories...</div>;

  if (repos.length === 0)
    return <div className="p-6 text-zinc-400">No repositories found (placeholder).</div>;

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
