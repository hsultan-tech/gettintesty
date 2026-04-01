export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageBase64?: string;
  agentUsed?: string;
  titleTag?: string;
  flowtiaViewId?: string;
  completionTimeMs?: number;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatResponse {
  reply: string;
  image_base64?: string;
  agent_used?: string;
  error?: string;
}

export interface ChatRequest {
  message: string;
  history?: { role: string; content: string }[];
}
