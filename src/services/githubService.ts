import type { GitHubRepository, GitHubFile, GitHubCommit } from "@/src/types";

export type GitHubResponse<T = unknown> = { ok: boolean; payload?: T; error?: string };

// GitHub API Keys from environment
const GITHUB_TOKEN_CLASSIC = process.env.GITHUB_TOKEN_CLASSIC;
const GITHUB_TOKEN_FINE_GRAINED = process.env.GITHUB_TOKEN_FINE_GRAINED;

export const GitHubService = {
  async listRepositories(): Promise<GitHubResponse<GitHubRepository[]>> {
    if (!GITHUB_TOKEN_CLASSIC && !GITHUB_TOKEN_FINE_GRAINED) {
      return { ok: false, error: "GitHub API token not configured", payload: [] };
    }
    // Placeholder — replace with actual API call
    return Promise.resolve({ ok: true, payload: [] });
  },

  async getRepositoryDetails(id: string): Promise<GitHubResponse<GitHubRepository | null>> {
    if (!GITHUB_TOKEN_CLASSIC && !GITHUB_TOKEN_FINE_GRAINED) {
      return { ok: false, error: "GitHub API token not configured", payload: null };
    }
    return Promise.resolve({ ok: true, payload: null });
  },

  async listFiles(repoId: string, path = "/"): Promise<GitHubResponse<GitHubFile[]>> {
    if (!GITHUB_TOKEN_CLASSIC && !GITHUB_TOKEN_FINE_GRAINED) {
      return { ok: false, error: "GitHub API token not configured", payload: [] };
    }
    return Promise.resolve({ ok: true, payload: [] });
  },

  async listCommits(repoId: string): Promise<GitHubResponse<GitHubCommit[]>> {
    if (!GITHUB_TOKEN_CLASSIC && !GITHUB_TOKEN_FINE_GRAINED) {
      return { ok: false, error: "GitHub API token not configured", payload: [] };
    }
    return Promise.resolve({ ok: true, payload: [] });
  },
};
