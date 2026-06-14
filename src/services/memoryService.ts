import { ConversationSummaryBufferMemory } from 'langchain/memory';
import { ChatOpenAI } from '@langchain/openai';
import { supabase } from '@/src/lib/supabase';

const SESSION_EXPIRY_HOURS = 24;

interface SessionMessage {
  id?: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface SessionRecord {
  id?: string;
  session_id: string;
  summary?: string;
  last_activity: string;
  created_at?: string;
}

// In-memory cache for active sessions (with TTL)
const sessionMemoriesCache = new Map<string, { memory: ConversationSummaryBufferMemory; expiresAt: number }>();

const llmForSummary = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  temperature: 0,
});

function isSessionExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

function getSessionExpiry(): number {
  return Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000;
}

export const MemoryService = {
  /**
   * Initialize or retrieve session in Supabase
   */
  async initializeSession(sessionId: string): Promise<SessionRecord> {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    // Check if session exists
    const { data: existing, error: fetchError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows found (expected)
      throw fetchError;
    }

    if (existing) {
      return existing as SessionRecord;
    }

    // Create new session
    const { data: newSession, error: insertError } = await supabase
      .from('chat_sessions')
      .insert([{ session_id: sessionId, last_activity: new Date().toISOString() }])
      .select()
      .single();

    if (insertError) throw insertError;
    return newSession as SessionRecord;
  },

  /**
   * Get or create memory for a session
   */
  async getSessionMemory(sessionId: string): Promise<ConversationSummaryBufferMemory> {
    // Check cache first
    const cached = sessionMemoriesCache.get(sessionId);
    if (cached && !isSessionExpired(cached.expiresAt)) {
      return cached.memory;
    }

    const memory = new ConversationSummaryBufferMemory({
      llm: llmForSummary,
      maxTokenLimit: 10000,
      returnMessages: true,
      humanPrefix: 'User',
      aiPrefix: 'Assistant',
    });

    // Load conversation history from Supabase
    if (supabase) {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading session history:', error);
      } else if (messages && messages.length > 0) {
        for (const msg of messages) {
          const message = msg as SessionMessage;
          if (message.role === 'user') {
            await memory.saveContext({ input: message.content }, { output: '' });
          } else {
            await memory.saveContext({ input: '' }, { output: message.content });
          }
        }
      }
    }

    // Cache the memory with expiry
    sessionMemoriesCache.set(sessionId, {
      memory,
      expiresAt: getSessionExpiry(),
    });

    return memory;
  },

  /**
   * Add a message to session memory and persist to Supabase
   */
  async addToSession(sessionId: string, content: string, role: 'user' | 'assistant'): Promise<void> {
    try {
      // Initialize session if needed
      await this.initializeSession(sessionId);

      // Save to Supabase
      if (supabase) {
        const { error } = await supabase.from('chat_messages').insert([
          {
            session_id: sessionId,
            role,
            content,
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) {
          console.error('Error saving message to Supabase:', error);
        }

        // Update last activity
        await supabase
          .from('chat_sessions')
          .update({ last_activity: new Date().toISOString() })
          .eq('session_id', sessionId);
      }

      // Also update in-memory cache
      const memory = await this.getSessionMemory(sessionId);
      if (role === 'user') {
        await memory.saveContext({ input: content }, { output: '' });
      } else {
        await memory.saveContext({ input: '' }, { output: content });
      }
    } catch (error) {
      console.error('Error adding message to session:', error);
      throw error;
    }
  },

  /**
   * Get session status and metadata
   */
  async getSessionStatus(
    sessionId: string
  ): Promise<{
    exists: boolean;
    messageCount: number;
    summary?: string;
    lastActivity?: string;
  }> {
    try {
      await this.initializeSession(sessionId);

      if (!supabase) {
        return { exists: false, messageCount: 0 };
      }

      const { data: messages } = await supabase
        .from('chat_messages')
        .select('id')
        .eq('session_id', sessionId);

      const { data: session } = await supabase
        .from('chat_sessions')
        .select('summary, last_activity')
        .eq('session_id', sessionId)
        .single();

      return {
        exists: true,
        messageCount: messages?.length || 0,
        summary: (session as any)?.summary,
        lastActivity: (session as any)?.last_activity,
      };
    } catch (error) {
      console.error('Error getting session status:', error);
      return { exists: false, messageCount: 0 };
    }
  },

  /**
   * Add a message to session memory (legacy method for compatibility)
   */
  async addMessage(sessionId: string, input: string, output: string): Promise<void> {
    await this.addToSession(sessionId, input, 'user');
    await this.addToSession(sessionId, output, 'assistant');
  },

  /**
   * Get conversation history for a session
   */
  async getHistory(sessionId: string): Promise<any> {
    const memory = await this.getSessionMemory(sessionId);
    return memory.loadMemoryVariables({});
  },

  /**
   * Get chat history as formatted string
   */
  async getChatHistory(sessionId: string): Promise<string> {
    const memory = await this.getSessionMemory(sessionId);
    const variables = await memory.loadMemoryVariables({});
    return variables.history || '';
  },

  /**
   * Clear session memory and Supabase data
   */
  async clearSession(sessionId: string): Promise<void> {
    sessionMemoriesCache.delete(sessionId);

    if (supabase) {
      await supabase.from('chat_messages').delete().eq('session_id', sessionId);
      await supabase.from('chat_sessions').delete().eq('session_id', sessionId);
    }
  },

  /**
   * Get all active sessions (for monitoring)
   */
  getActiveSessions(): string[] {
    return Array.from(sessionMemoriesCache.keys()).filter((sessionId) => {
      const cached = sessionMemoriesCache.get(sessionId);
      return cached && !isSessionExpired(cached.expiresAt);
    });
  },

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    const now = Date.now();
    for (const [sessionId, data] of sessionMemoriesCache.entries()) {
      if (isSessionExpired(data.expiresAt)) {
        sessionMemoriesCache.delete(sessionId);
      }
    }
  },
};
