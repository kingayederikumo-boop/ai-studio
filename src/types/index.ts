export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Settings {
  architectureProvider: string;
  codingProvider: string;
}

export interface GitHubRepository {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  private: boolean;
}

export interface GitHubFile {
  path: string;
  name: string;
  type: "file" | "dir";
  size?: number;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author?: string;
  date: string;
}
