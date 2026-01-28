import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { studyApi } from '../services/api';
import { ArrowLeft, CheckCircle, XCircle, Lightbulb, RotateCcw, MessageCircle } from 'lucide-react';

interface Question {
  question: string;
  type: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
  difficulty: string;
}

export default function StudyPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [difficulty, setDifficulty] = useState('medium');
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (topicId) {
      startSession();
    }
  }, [topicId]);

  const startSession = async () => {
    try {
      const response = await studyApi.startSession({ topicId, mode: 'practice' });
      setSessionId(response.data.session.id);
      loadQuestion();
    } catch (error) {
      console.error('Error starting session:', error);
      loadQuestion();
    }
  };

  const loadQuestion = async () => {
    if (!topicId) return;

    setIsLoading(true);
    setQuestion(null);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(false);
    setShowExplanation(false);

    try {
      const response = await studyApi.generateQuestion({ topicId, difficulty });
      setQuestion(response.data.question);
      startTimeRef.current = Date.now();
    } catch (error) {
      console.error('Error loading question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (showResult || !question) return;

    setSelectedAnswer(answer);
    const correct = answer === question.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    setStats((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));

    // Save answer
    try {
      await studyApi.submitAnswer({
        topicId: topicId!,
        sessionId: sessionId || undefined,
        question: question.question,
        userAnswer: answer,
        correctAnswer: question.correctAnswer,
        isCorrect: correct,
        difficulty: question.difficulty,
        responseTimeMs: Date.now() - startTimeRef.current
      });

      // Adjust difficulty based on performance
      if (correct && difficulty !== 'hard') {
        setDifficulty((d) => d === 'easy' ? 'medium' : 'hard');
      } else if (!correct && difficulty !== 'easy') {
        setDifficulty((d) => d === 'hard' ? 'medium' : 'easy');
      }
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const getOptionLetter = (index: number) => String.fromCharCode(65 + index);

  if (isLoading && !question) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-sage-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Gerando questão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <p className="text-sm text-gray-500">Questão {stats.total + 1}</p>
          <p className="text-xs text-sage-600">
            {stats.correct}/{stats.total} corretas ({stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%)
          </p>
        </div>
        <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Médio' : 'Difícil'}
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {question && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Question */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-lg text-sage-900 leading-relaxed whitespace-pre-wrap">
                {question.question}
              </p>
            </div>

            {/* Options */}
            {question.options && (
              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const letter = getOptionLetter(index);
                  const isSelected = selectedAnswer === letter;
                  const isCorrectOption = letter === question.correctAnswer;

                  let bgColor = 'bg-white hover:bg-gray-50';
                  let borderColor = 'border-gray-200';

                  if (showResult) {
                    if (isCorrectOption) {
                      bgColor = 'bg-green-50';
                      borderColor = 'border-green-500';
                    } else if (isSelected && !isCorrect) {
                      bgColor = 'bg-red-50';
                      borderColor = 'border-red-500';
                    }
                  } else if (isSelected) {
                    bgColor = 'bg-sage-50';
                    borderColor = 'border-sage-500';
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(letter)}
                      disabled={showResult}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${bgColor} ${borderColor} ${
                        showResult ? 'cursor-default' : 'cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`font-semibold ${showResult && isCorrectOption ? 'text-green-600' : 'text-sage-600'}`}>
                          {letter})
                        </span>
                        <span className="text-sage-900">{option.replace(/^[A-D]\)\s*/, '')}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Hint Button */}
            {!showResult && question.hint && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm"
              >
                <Lightbulb className="w-4 h-4" />
                {showHint ? 'Esconder dica' : 'Ver dica'}
              </button>
            )}

            {/* Hint */}
            {showHint && question.hint && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-amber-800 text-sm">{question.hint}</p>
              </div>
            )}

            {/* Result */}
            {showResult && (
              <div className={`rounded-xl p-4 flex items-start gap-3 ${
                isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
                <div>
                  <p className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {isCorrect ? 'Parabéns! Resposta correta!' : 'Não foi dessa vez...'}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-red-600 mt-1">
                      A resposta correta é: <strong>{question.correctAnswer}</strong>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Explanation */}
            {showResult && (
              <div>
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="text-sage-600 hover:text-sage-700 text-sm font-medium"
                >
                  {showExplanation ? 'Esconder explicação' : 'Ver explicação'}
                </button>

                {showExplanation && (
                  <div className="mt-3 bg-sage-50 border border-sage-200 rounded-xl p-4">
                    <p className="text-sage-800 whitespace-pre-wrap">{question.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      {showResult && (
        <div className="bg-white border-t border-gray-100 p-4 flex gap-3">
          <Link
            to={`/chat/${topicId}`}
            className="flex-1 py-3 px-4 rounded-xl border border-sage-300 text-sage-700 font-medium text-center hover:bg-sage-50 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Tirar dúvidas
          </Link>
          <button
            onClick={loadQuestion}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RotateCcw className="w-5 h-5" />
            Próxima questão
          </button>
        </div>
      )}
    </div>
  );
}
