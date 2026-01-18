export interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  model?: string;
  createdAt: Date | string;
}

export interface Conversation {
  id: string;
  title: string | null;
  model: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  messages?: Message[];
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  messagesUsed: number;
  messagesLimit: number;
  createdAt: Date | string;
}
