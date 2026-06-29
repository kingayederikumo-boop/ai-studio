export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Settings {
  architectureProvider: 'Nvidia' | 'OpenAI';
  // add more as needed
}