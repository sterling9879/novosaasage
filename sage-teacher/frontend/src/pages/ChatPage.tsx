import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { chatApi } from '../services/api';
import { ArrowLeft, Send, Trash2, CheckSquare } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
}

interface QuizAnswer {
  questionNumber: number;
  selectedLetter: string;
}

export default function ChatPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get('subject');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const response = await chatApi.getHistory(undefined, 50);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message immediately
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'USER',
      content: userMessage
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await chatApi.send({
        message: userMessage,
        topicId: topicId || undefined,
        subjectId: subjectId || undefined
      });

      // Replace temp message and add AI response
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        response.data.userMessage,
        response.data.assistantMessage
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearHistory = async () => {
    if (!confirm('Limpar todo o histórico de conversas?')) return;

    try {
      await chatApi.clearHistory();
      setMessages([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuizAnswer = (questionNumber: number, selectedLetter: string) => {
    setQuizAnswers((prev) => {
      // Remove existing answer for this question and add new one
      const filtered = prev.filter((a) => a.questionNumber !== questionNumber);
      return [...filtered, { questionNumber, selectedLetter }].sort(
        (a, b) => a.questionNumber - b.questionNumber
      );
    });
  };

  const sendQuizAnswers = async () => {
    if (quizAnswers.length === 0 || isLoading) return;

    // Format answers as "1-A, 2-B, 3-C"
    const answersText = quizAnswers
      .map((a) => `${a.questionNumber}-${a.selectedLetter.toUpperCase()}`)
      .join(', ');

    const userMessage = `Minhas respostas são: ${answersText}. Por favor, corrija e explique cada uma.`;

    setInput('');
    setIsLoading(true);

    // Add user message immediately
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'USER',
      content: userMessage
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await chatApi.send({
        message: userMessage,
        topicId: topicId || undefined,
        subjectId: subjectId || undefined
      });

      // Replace temp message and add AI response
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        response.data.userMessage,
        response.data.assistantMessage
      ]);

      // Clear quiz answers after sending
      setQuizAnswers([]);
    } catch (error) {
      console.error('Error sending answers:', error);
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-semibold text-sage-900">Chat com Tutor</h1>
            <p className="text-xs text-gray-500">
              {topicId ? 'Tirando dúvidas sobre o tópico' : 'Tire suas dúvidas'}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Limpar histórico"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="text-4xl mb-4">🎓</div>
              <h2 className="text-lg font-semibold text-sage-900 mb-2">
                Olá! Sou seu tutor IA
              </h2>
              <p className="text-gray-500 text-sm">
                Estou aqui para ajudar você a aprender. Faça qualquer pergunta sobre o conteúdo que está estudando!
              </p>
              <div className="mt-6 space-y-2">
                <p className="text-xs text-gray-400">Sugestões:</p>
                {[
                  'Explique o que é concordância verbal',
                  'Como funciona o teorema de Pitágoras?',
                  'Me dê dicas para escrever uma boa redação'
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="block w-full text-left px-4 py-2 rounded-lg bg-sage-50 text-sage-700 text-sm hover:bg-sage-100 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            content={message.content}
            role={message.role}
            onQuizAnswer={handleQuizAnswer}
          />
        ))}

        {/* Send Quiz Answers Button */}
        {quizAnswers.length > 0 && !isLoading && (
          <div className="flex justify-center">
            <button
              onClick={sendQuizAnswers}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sage-500 to-sage-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-sage-600 hover:to-sage-700 transition-all transform hover:scale-105"
            >
              <CheckSquare className="w-5 h-5" />
              Enviar {quizAnswers.length} resposta{quizAnswers.length > 1 ? 's' : ''} para correção
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-sage-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-sage-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-sage-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 p-4">
        <div className="flex items-end gap-3 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua pergunta..."
              rows={1}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none transition-all resize-none text-sage-900"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl bg-sage-500 text-white hover:bg-sage-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
