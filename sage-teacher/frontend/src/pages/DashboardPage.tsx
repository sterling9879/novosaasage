import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { subjectsApi, studyApi } from '../services/api';
import { BookOpen, Target, TrendingUp, ChevronRight } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  topicCount: number;
  progress: {
    masteryLevel: number;
    questionsAnswered: number;
    correctAnswers: number;
  };
}

interface Stats {
  overall: {
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    topicsStudied: number;
  };
  recentActivity: Array<{ date: string; questions: number; correct: number }>;
  topTopics: Array<{ name: string; masteryLevel: number; questionsAnswered: number }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [subjectsRes, statsRes] = await Promise.all([
        subjectsApi.getAll(),
        studyApi.getStats()
      ]);
      setSubjects(subjectsRes.data.subjects);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-sage-500 to-sage-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">
          Olá, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-sage-100">Pronto para aprender hoje?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Target className="w-4 h-4" />
            <span className="text-xs">Questões</span>
          </div>
          <p className="text-2xl font-bold text-sage-900">
            {stats?.overall.totalQuestions || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Acertos</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {stats?.overall.accuracy || 0}%
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs">Tópicos</span>
          </div>
          <p className="text-2xl font-bold text-sage-900">
            {stats?.overall.topicsStudied || 0}
          </p>
        </div>
      </div>

      {/* Subjects Grid */}
      <div>
        <h2 className="text-lg font-semibold text-sage-900 mb-4">Matérias</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              to={`/subject/${subject.id}`}
              className="bg-white rounded-xl p-4 shadow-sm card-hover flex items-start gap-4"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: `${subject.color}15` }}
              >
                {subject.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sage-900">{subject.name}</h3>
                <p className="text-sm text-gray-500 truncate">{subject.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all animate-progress"
                      style={{
                        width: `${(subject.progress.masteryLevel || 0) * 100}%`,
                        backgroundColor: subject.color
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.round((subject.progress.masteryLevel || 0) * 100)}%
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Chat CTA */}
      <Link
        to="/chat"
        className="block bg-gradient-to-r from-sage-50 to-sage-100 border border-sage-200 rounded-xl p-6 text-center hover:shadow-md transition-all"
      >
        <div className="text-3xl mb-2">💬</div>
        <h3 className="font-semibold text-sage-900 mb-1">Chat com Tutor IA</h3>
        <p className="text-sm text-gray-600">Tire dúvidas ou peça explicações sobre qualquer assunto</p>
      </Link>
    </div>
  );
}
