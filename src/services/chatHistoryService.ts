/**
 * Service for managing chat history and sessions
 */

import { supabase } from '@/src/lib/supabase';
import type { ChatSession, ChatMessage } from '@/src/types/chat';

const SESSION_TITLE_MAX_LENGTH = 50;

export const ChatHistoryService = {
  /**
   * Generate a title from the first message
   */
  async generateSessionTitle(sessionId: string, firstMessage: string): Promise<string> {
    let title = firstMessage.substring(0, SESSION_TITLE_MAX_LENGTH).trim();
    if (firstMessage.length > SESSION_TITLE_MAX_LENGTH) {
      title += '...';
    }
    return title;
  },

  /**
   * Create a new chat session
   */
  async createSession(
    sessionId: string,
    firstMessage: string,
    provider: 'openai' | 'nvidia' = 'openai'
  ): Promise<ChatSession | null> {
    if (!supabase) return null;

    try {
      const title = await this.generateSessionTitle(sessionId, firstMessage);
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{
          session_id: sessionId,
          title,
          provider,
          created_at: now,
          updated_at: now,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as ChatSession;
    } catch (err) {
      console.error('[ChatHistory] Error creating session:', err);
      return null;
    }
  },

  /**
   * Get all sessions for the user
   */
  async getAllSessions(): Promise<ChatSession[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ChatSession[];
    } catch (err) {
      console.error('[ChatHistory] Error fetching sessions:', err);
      return [];
    }
  },

  /**
   * Get a specific session
   */
  async getSession(sessionId: string): Promise<ChatSession | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as ChatSession) || null;
    } catch (err) {
      console.error('[ChatHistory] Error fetching session:', err);
      return null;
    }
  },

  /**
   * Update session title and timestamp
   */
  async updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[ChatHistory] Error updating session:', err);
      return false;
    }
  },

  /**
   * Get all messages in a session
   */
  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return (data || []) as ChatMessage[];
    } catch (err) {
      console.error('[ChatHistory] Error fetching messages:', err);
      return [];
    }
  },

  /**
   * Add a message to a session
   */
  async addMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<ChatMessage | null> {
    if (!supabase) return null;

    try {
      const id = `${sessionId}-${Date.now()}`;
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
          id,
          session_id: sessionId,
          role,
          content,
          timestamp: now,
        }])
        .select()
        .single();

      if (error) throw error;
      return (data as ChatMessage) || null;
    } catch (err) {
      console.error('[ChatHistory] Error adding message:', err);
      return null;
    }
  },

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    if (!supabase) return false;

    try {
      // Delete messages first
      await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionId);

      // Delete session
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('session_id', sessionId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[ChatHistory] Error deleting session:', err);
      return false;
    }
  },

  /**
   * Search sessions by title or content
   */
  async searchSessions(query: string): Promise<ChatSession[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .ilike('title', `%${query}%`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ChatSession[];
    } catch (err) {
      console.error('[ChatHistory] Error searching sessions:', err);
      return [];
    }
  },
};
