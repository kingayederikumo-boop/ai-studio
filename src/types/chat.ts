export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  session_id: string;
  title: string;
  provider: string;
  created_at: string;
  updated_at: string;
}