'use client';

import { useChatStore } from '@/store/chatStore';
import ModelSelector from './ModelSelector';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import BotsGrid from './BotsGrid';
import { getBotById } from '@/lib/bots';

interface ChatAreaProps {
  onSendMessage: (message: string) => void;
}

export default function ChatArea({ onSendMessage }: ChatAreaProps) {
  const { currentConversationId, activeTab, selectedBotId, messages } = useChatStore();

  const selectedBot = selectedBotId ? getBotById(selectedBotId) : null;

  // Se estiver na aba de bots e não tiver bot selecionado, mostrar grid
  if (activeTab === 'bots' && !selectedBotId) {
    return <BotsGrid />;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[rgb(249,250,251)]">
      {/* Header */}
      <header className="border-b border-[rgba(79,89,102,0.08)] px-6 py-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          {selectedBot && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: `${selectedBot.color}20` }}
            >
              {selectedBot.icon}
            </div>
          )}
          <div>
            <h1 className="text-lg font-semibold text-[rgb(38,38,38)]">
              {selectedBot ? selectedBot.name : (currentConversationId ? 'Conversa' : 'Como posso ajudar você?')}
            </h1>
            {selectedBot && (
              <p className="text-sm text-[rgb(134,134,146)]">{selectedBot.description}</p>
            )}
          </div>
        </div>
        <ModelSelector />
      </header>

      {/* Messages or Welcome */}
      {messages.length === 0 && !selectedBot ? (
        <WelcomeScreen />
      ) : (
        <MessageList />
      )}

      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
}

function WelcomeScreen() {
  const { setSelectedBotId, setActiveTab } = useChatStore();

  const quickTools = [
    { id: 'translator', icon: '🌐', name: 'Traduzir' },
    { id: 'summarizer', icon: '📋', name: 'Resumir' },
    { id: 'writer', icon: '✍️', name: 'Escrever' },
    { id: 'grammar', icon: '📝', name: 'Gramática' },
    { id: 'email', icon: '📧', name: 'E-mail' },
    { id: 'mindmap', icon: '🗺️', name: 'Mapa Mental' },
  ];

  const handleSelectTool = (toolId: string) => {
    setSelectedBotId(toolId);
    setActiveTab('bots');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <h2 className="text-2xl font-semibold text-[rgb(38,38,38)] mb-2">
        Como posso ajudar você?
      </h2>
      <p className="text-[rgb(134,134,146)] mb-8">
        Escolha uma ferramenta ou comece uma conversa
      </p>

      {/* Quick Tools */}
      <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
        {quickTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleSelectTool(tool.id)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[rgba(79,89,102,0.08)] rounded-xl hover:border-[#6841ea] hover:shadow-sm transition-all"
          >
            <span className="text-lg">{tool.icon}</span>
            <span className="text-sm font-medium text-[rgb(38,38,38)]">{tool.name}</span>
          </button>
        ))}
      </div>

      {/* View All Tools */}
      <button
        onClick={() => setActiveTab('bots')}
        className="mt-6 text-sm font-medium text-[#6841ea] hover:underline"
      >
        Ver todas as ferramentas →
      </button>
    </div>
  );
}
