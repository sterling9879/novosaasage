import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizOption {
  letter: string;
  text: string;
}

interface QuizQuestion {
  questionNumber: number;
  questionText: string;
  codeBlock?: string;
  options: QuizOption[];
  correctAnswer?: string;
}

interface QuizCardProps {
  question: QuizQuestion;
  onAnswer?: (questionNumber: number, selectedLetter: string, isCorrect: boolean) => void;
}

export default function QuizCard({ question, onAnswer }: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const hasCorrectAnswer = question.correctAnswer !== undefined;

  const handleSelect = (letter: string) => {
    if (selectedAnswer && hasCorrectAnswer) return; // Lock after selection if we know the answer

    setSelectedAnswer(letter);

    const isCorrect = hasCorrectAnswer
      ? letter.toLowerCase() === question.correctAnswer!.toLowerCase()
      : false;

    onAnswer?.(question.questionNumber, letter, isCorrect);
  };

  const getOptionStyle = (letter: string) => {
    const isSelected = selectedAnswer === letter;

    // If no correct answer is known, just show selection
    if (!hasCorrectAnswer) {
      return isSelected
        ? 'border-sage-500 bg-sage-50'
        : 'border-gray-200 hover:border-sage-300 hover:bg-gray-50';
    }

    // If correct answer is known and user has selected
    if (selectedAnswer) {
      const isCorrectOption = question.correctAnswer!.toLowerCase() === letter.toLowerCase();

      if (isCorrectOption) {
        return 'border-green-500 bg-green-50';
      }
      if (isSelected && !isCorrectOption) {
        return 'border-red-500 bg-red-50';
      }
      return 'border-gray-200 opacity-60';
    }

    // Default state
    return isSelected
      ? 'border-sage-500 bg-sage-50'
      : 'border-gray-200 hover:border-sage-300 hover:bg-gray-50';
  };

  const getLetterStyle = (letter: string) => {
    const isSelected = selectedAnswer === letter;

    if (!hasCorrectAnswer) {
      return isSelected ? 'bg-sage-500 text-white' : 'bg-gray-100 text-gray-600';
    }

    if (selectedAnswer) {
      const isCorrectOption = question.correctAnswer!.toLowerCase() === letter.toLowerCase();
      if (isCorrectOption) return 'bg-green-500 text-white';
      if (isSelected) return 'bg-red-500 text-white';
    }

    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 my-3">
      <div className="mb-3">
        <span className="text-xs font-medium text-sage-600 bg-sage-100 px-2 py-1 rounded-full">
          Pergunta {question.questionNumber}
        </span>
      </div>

      <p className="text-sage-900 mb-3 leading-relaxed">{question.questionText}</p>

      {question.codeBlock && (
        <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 mb-3 text-sm overflow-x-auto">
          <code>{question.codeBlock}</code>
        </pre>
      )}

      <div className="space-y-2">
        {question.options.map((option) => (
          <button
            key={option.letter}
            onClick={() => handleSelect(option.letter)}
            disabled={selectedAnswer !== null && hasCorrectAnswer}
            className={`w-full p-3 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${getOptionStyle(option.letter)} ${
              selectedAnswer && hasCorrectAnswer ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <span className={`font-semibold w-6 h-6 rounded-full flex items-center justify-center text-sm ${getLetterStyle(option.letter)}`}>
              {option.letter.toUpperCase()}
            </span>
            <span className="flex-1 text-sage-800">{option.text}</span>
            {selectedAnswer && hasCorrectAnswer && question.correctAnswer!.toLowerCase() === option.letter.toLowerCase() && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            {selectedAnswer && hasCorrectAnswer && selectedAnswer === option.letter && question.correctAnswer!.toLowerCase() !== option.letter.toLowerCase() && (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </button>
        ))}
      </div>

      {/* Show result when correct answer is known */}
      {selectedAnswer && hasCorrectAnswer && (
        <div className={`mt-3 p-3 rounded-lg ${
          question.correctAnswer!.toLowerCase() === selectedAnswer.toLowerCase()
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm font-medium ${
            question.correctAnswer!.toLowerCase() === selectedAnswer.toLowerCase()
              ? 'text-green-700'
              : 'text-red-700'
          }`}>
            {question.correctAnswer!.toLowerCase() === selectedAnswer.toLowerCase()
              ? '✓ Correto! Muito bem!'
              : `✗ A resposta correta é: ${question.correctAnswer!.toUpperCase()}`
            }
          </p>
        </div>
      )}

      {/* Show selection confirmation when answer is NOT known */}
      {selectedAnswer && !hasCorrectAnswer && (
        <div className="mt-3 p-3 rounded-lg bg-sage-50 border border-sage-200">
          <p className="text-sm text-sage-700">
            ✓ Você escolheu: <strong>{selectedAnswer.toUpperCase()}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

// Parser function to extract quiz questions from markdown
export function parseQuizFromMarkdown(content: string): { questions: QuizQuestion[], remainingText: string } {
  const questions: QuizQuestion[] = [];
  let remainingText = content;

  // Pattern to match quiz questions
  // Matches: ### Pergunta N: or **Pergunta N:** followed by question and options
  const questionPattern = /(?:#{1,3}\s*)?(?:\*\*)?Pergunta\s*(\d+)(?:\*\*)?:?\s*\n([\s\S]*?)(?=(?:#{1,3}\s*)?(?:\*\*)?Pergunta\s*\d+|$)/gi;

  let match;
  while ((match = questionPattern.exec(content)) !== null) {
    const questionNumber = parseInt(match[1]);
    const questionBlock = match[2].trim();

    // Extract code block if present
    const codeMatch = questionBlock.match(/```[\w]*\n([\s\S]*?)```/);
    const codeBlock = codeMatch ? codeMatch[1].trim() : undefined;

    // Remove code block from question text
    let textWithoutCode = questionBlock;
    if (codeMatch) {
      textWithoutCode = questionBlock.replace(/```[\w]*\n[\s\S]*?```/, '').trim();
    }

    // Extract question text (before options)
    const questionTextMatch = textWithoutCode.match(/^([\s\S]*?)(?=\n\s*[a-d]\))/i);
    const questionText = questionTextMatch ? questionTextMatch[1].trim() : textWithoutCode.split('\n')[0];

    // Extract options (a), b), c), d))
    const options: QuizOption[] = [];
    const optionPattern = /([a-d])\)\s*([^\n]+)/gi;
    let optionMatch;
    while ((optionMatch = optionPattern.exec(textWithoutCode)) !== null) {
      options.push({
        letter: optionMatch[1].toLowerCase(),
        text: optionMatch[2].trim()
      });
    }

    if (options.length >= 2) {
      questions.push({
        questionNumber,
        questionText,
        codeBlock,
        options,
        // We don't know the correct answer from the markdown alone
        // The user will need to ask for feedback
        correctAnswer: undefined
      });

      // Remove this question from remaining text
      remainingText = remainingText.replace(match[0], '');
    }
  }

  return { questions, remainingText: remainingText.trim() };
}
