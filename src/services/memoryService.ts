import { ConversationSummaryBufferMemory } from "langchain/memory";
import { ChatOpenAI } from "@langchain/openai";

// In-memory storage for sessions
// In production, this would be a database (Redis, PostgreSQL, etc.)
const sessionMemories = new Map<string, ConversationSummaryBufferMemory>();

const llmForSummary = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo",
  temperature: 0,
});

export const MemoryService = {
  /**
   * Get or create memory for a session
   * Uses ConversationSummaryBufferMemory which:
   * - Keeps last 10k tokens in buffer
   * - Summarizes older messages
   * - Max 20 messages before summary kicks in
   */
  async getSessionMemory(sessionId: string): Promise<ConversationSummaryBufferMemory> {
    if (sessionMemories.has(sessionId)) {
      return sessionMemories.get(sessionId)!;
    }

    const memory = new ConversationSummaryBufferMemory({
      llm: llmForSummary,
      maxTokenLimit: 10000, // Keep last 10k tokens
      returnMessages: true,
      humanPrefix: "User",
      aiPrefix: "Assistant",
    });

    sessionMemories.set(sessionId, memory);
    return memory;
  },

  /**
   * Add a message to session memory
   */
  async addMessage(
    sessionId: string,
    input: string,
    output: string
  ): Promise<void> {
    const memory = await this.getSessionMemory(sessionId);
    await memory.saveContext({ input }, { output });
  },

  /**
   * Get conversation history for a session
   */
  async getHistory(sessionId: string): Promise<any> {
    const memory = await this.getSessionMemory(sessionId);
    const variables = await memory.loadMemoryVariables({});
    return variables;
  },

  /**
   * Get chat history as formatted string
   */
  async getChatHistory(sessionId: string): Promise<string> {
    const memory = await this.getSessionMemory(sessionId);
    const variables = await memory.loadMemoryVariables({});
    return variables.history || "";
  },

  /**
   * Clear session memory
   */
  async clearSession(sessionId: string): Promise<void> {
    sessionMemories.delete(sessionId);
  },

  /**
   * Get all active sessions (for debugging/monitoring)
   */
  getActiveSessions(): string[] {
    return Array.from(sessionMemories.keys());
  },

  /**
   * Get session metadata
   */
  async getSessionMetadata(sessionId: string): Promise<{
    exists: boolean;
    messageCount: number;
    summary?: string;
  }> {
    const exists = sessionMemories.has(sessionId);
    if (!exists) {
      return { exists: false, messageCount: 0 };
    }

    const memory = await this.getSessionMemory(sessionId);
    const variables = await memory.loadMemoryVariables({});
    
    return {
      exists: true,
      messageCount: (variables.history?.split("\n").filter((l: string) => l.trim()).length || 0) / 2,
      summary: variables.summary,
    };
  },
};
