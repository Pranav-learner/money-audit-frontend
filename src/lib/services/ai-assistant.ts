import api from '@/lib/api';

export interface ChatResponse {
  assistantMessage: string;
  toolsUsed: string[];
  referencedModules: string[];
  intent: string;
  confidence: number;
  suggestedFollowUps: string[];
  processingTimeMs: number;
  timestamp: string;
}

export interface ConversationTurn {
  role: 'USER' | 'ASSISTANT';
  message: string;
  timestamp: string;
}

export interface ConversationHistory {
  turns: ConversationTurn[];
}

export const sendChat = async (message: string): Promise<ChatResponse> => {
  const res = await api.post('/api/ai/chat', { message });
  return res.data;
};

export const getChatHistory = async (): Promise<ConversationHistory> => {
  const res = await api.get('/api/ai/history');
  return res.data;
};

export const clearChatHistory = async (): Promise<void> => {
  await api.delete('/api/ai/history');
};
