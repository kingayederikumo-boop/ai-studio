import type { GitHubRepository, GitHubFile, GitHubCommit } from "@/src/types";

export const GitHubService = {
  async listRepositories(): Promise<GitHubRepository[]> {
    // Placeholder — return empty list
    return Promise.resolve([]);
  },

  async getRepositoryDetails(id: string): Promise<GitHubRepository | null> {
    return Promise.resolve(null);
  },

  async listFiles(repoId: string, path = "/"): Promise<GitHubFile[]> {
    return Promise.resolve([]);
  },

  async listCommits(repoId: string): Promise<GitHubCommit[]> {
    return Promise.resolve([]);
  },
};
