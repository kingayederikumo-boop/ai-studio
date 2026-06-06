export const GitHubService = {
  async listRepositories() {
    // Placeholder — return empty list
    return Promise.resolve([] as any[]);
  },
  async getRepositoryDetails(id: string) {
    return Promise.resolve(null);
  },
  async listFiles(repoId: string, path = "/") {
    return Promise.resolve([] as any[]);
  },
  async listCommits(repoId: string) {
    return Promise.resolve([] as any[]);
  },
};
