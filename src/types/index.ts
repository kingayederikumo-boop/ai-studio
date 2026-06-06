export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};

export type ProviderName = "OpenAI" | "Nvidia";

export type Settings = {
  architectureProvider: ProviderName;
  codingProvider: ProviderName;
};

export type GitHubRepository = {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  private: boolean;
};

export type GitHubFile = {
  path: string;
  name: string;
  type: "file" | "dir";
  size?: number;
};

export type GitHubCommit = {
  sha: string;
  message: string;
  author?: string;
  date: string;
};
