import { useMemo } from 'react';
import QuizCard, { parseQuizFromMarkdown } from './QuizCard';

interface ChatMessageProps {
  content: string;
  role: 'USER' | 'ASSISTANT';
  onQuizAnswer?: (questionNumber: number, selectedLetter: string, isCorrect: boolean) => void;
}

// Simple markdown renderer for code blocks and basic formatting
function renderMarkdown(text: string): JSX.Element[] {
  const elements: JSX.Element[] = [];
  const lines = text.split('\n');
  let inCodeBlock = false;
  let codeContent = '';
  let codeLanguage = '';
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block start
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
        codeContent = '';
      } else {
        // Code block end
        elements.push(
          <pre key={key++} className="bg-gray-900 text-gray-100 rounded-lg p-3 my-2 text-sm overflow-x-auto">
            <code>{codeContent.trim()}</code>
          </pre>
        );
        inCodeBlock = false;
        codeContent = '';
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      continue;
    }

    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="font-semibold text-lg mt-3 mb-2">{line.slice(4)}</h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="font-bold text-xl mt-3 mb-2">{line.slice(3)}</h2>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} className="font-bold text-2xl mt-3 mb-2">{line.slice(2)}</h1>
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<br key={key++} />);
      continue;
    }

    // Regular text with inline formatting
    let formattedLine = line;

    // Inline code
    formattedLine = formattedLine.replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-rose-600">$1</code>'
    );

    // Bold
    formattedLine = formattedLine.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic
    formattedLine = formattedLine.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    elements.push(
      <p
        key={key++}
        className="leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formattedLine }}
      />
    );
  }

  return elements;
}

export default function ChatMessage({ content, role, onQuizAnswer }: ChatMessageProps) {
  const { questions, remainingText } = useMemo(
    () => (role === 'ASSISTANT' ? parseQuizFromMarkdown(content) : { questions: [], remainingText: content }),
    [content, role]
  );

  const hasQuiz = questions.length > 0;

  if (role === 'USER') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 bg-gradient-to-br from-sage-500 to-sage-700 text-white rounded-br-md">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{content}</p>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex justify-start">
      <div className={`max-w-[90%] sm:max-w-[85%] ${hasQuiz ? '' : 'bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm'}`}>
        {hasQuiz ? (
          <div className="space-y-2">
            {/* Render intro text if any */}
            {remainingText && (
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm text-sage-900">
                <div className="text-[15px]">{renderMarkdown(remainingText)}</div>
              </div>
            )}

            {/* Render quiz questions */}
            {questions.map((question) => (
              <QuizCard
                key={question.questionNumber}
                question={question}
                onAnswer={onQuizAnswer}
              />
            ))}

            {/* Instruction to check answers */}
            <div className="bg-sage-50 border border-sage-200 rounded-lg px-4 py-3 text-sm text-sage-700">
              💡 <strong>Clique nas opções</strong> para selecionar suas respostas. Depois, me diga "Minhas respostas são: 1-A, 2-B..." para eu corrigir!
            </div>
          </div>
        ) : (
          <div className="text-sage-900 text-[15px]">{renderMarkdown(content)}</div>
        )}
      </div>
    </div>
  );
}
