/**
 * Chat and session types
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sessionId: string;
}

export interface ChatSession {
  id: string;
  sessionId: string;
  title: string;
  summary?: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  provider: 'openai' | 'nvidia';
}

export interface ChatContextFile {
  path: string;
  repo: string;
  owner: string;
  language?: string;
  content?: string;
}

export interface ChatContextRepo {
  owner: string;
  repo: string;
  description?: string;
  url: string;
}

export interface ChatContext {
  files: ChatContextFile[];
  repos: ChatContextRepo[];
  mentions: string[];
}
