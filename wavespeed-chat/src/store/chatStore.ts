import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, Conversation } from '@/types';

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Message[];
  selectedModel: string;
  selectedBotId: string | null;
  isLoading: boolean;
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  activeTab: 'chat' | 'bots';

  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversationId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setSelectedModel: (model: string) => void;
  setSelectedBotId: (botId: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveTab: (tab: 'chat' | 'bots') => void;
  addConversation: (conversation: Conversation) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      conversations: [],
      currentConversationId: null,
      messages: [],
      selectedModel: 'google/gemini-2.5-flash',
      selectedBotId: null,
      isLoading: false,
      isSidebarOpen: true,
      isSidebarCollapsed: false,
      activeTab: 'chat',

      setConversations: (conversations) => set({ conversations }),
      setCurrentConversationId: (id) => set({ currentConversationId: id }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setSelectedBotId: (botId) => set({ selectedBotId: botId }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      toggleSidebarCollapsed: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      addConversation: (conversation) =>
        set((state) => ({ conversations: [conversation, ...state.conversations] })),
      reset: () =>
        set({
          currentConversationId: null,
          messages: [],
          selectedBotId: null,
        }),
    }),
    {
      name: 'sage-ia-chat-store',
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        selectedModel: state.selectedModel,
      }),
    }
  )
);
