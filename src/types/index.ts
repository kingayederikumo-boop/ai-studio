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
