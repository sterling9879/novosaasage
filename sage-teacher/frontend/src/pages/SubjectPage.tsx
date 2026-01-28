import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { subjectsApi } from '../services/api';
import { ArrowLeft, Play, MessageCircle, ChevronDown, ChevronRight } from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  description?: string;
  masteryLevel: number;
  questionsAnswered: number;
  subtopics?: Topic[];
}

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export default function SubjectPage() {
  const { id } = useParams<{ id: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) loadSubject(id);
  }, [id]);

  const loadSubject = async (subjectId: string) => {
    try {
      const response = await subjectsApi.getById(subjectId);
      setSubject(response.data.subject);
      setTopics(response.data.topics);
    } catch (error) {
      console.error('Error loading subject:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-gray-500">Matéria não encontrada</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${subject.color}15` }}
        >
          {subject.icon}
        </div>
        <div>
          <h1 className="text-xl font-bold text-sage-900">{subject.name}</h1>
          <p className="text-sm text-gray-500">{subject.description}</p>
        </div>
      </div>

      {/* Chat with subject context */}
      <Link
        to={`/chat?subject=${subject.id}`}
        className="flex items-center gap-3 bg-sage-50 border border-sage-200 rounded-xl p-4 hover:bg-sage-100 transition-colors"
      >
        <MessageCircle className="w-5 h-5 text-sage-600" />
        <span className="text-sage-700 font-medium">Tirar dúvidas sobre {subject.name}</span>
      </Link>

      {/* Topics List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-sage-900">Tópicos</h2>

        {topics.map((topic) => (
          <div key={topic.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div
              className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => topic.subtopics && topic.subtopics.length > 0 && toggleTopic(topic.id)}
            >
              {topic.subtopics && topic.subtopics.length > 0 ? (
                expandedTopics.has(topic.id) ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )
              ) : (
                <div className="w-5" />
              )}

              <div className="flex-1">
                <h3 className="font-medium text-sage-900">{topic.name}</h3>
                {topic.description && (
                  <p className="text-sm text-gray-500">{topic.description}</p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-32">
                    <div
                      className="h-full rounded-full bg-sage-500 transition-all"
                      style={{ width: `${(topic.masteryLevel || 0) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.round((topic.masteryLevel || 0) * 100)}%
                  </span>
                </div>
              </div>

              <Link
                to={`/study/${topic.id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-lg bg-sage-500 text-white hover:bg-sage-600 transition-colors"
              >
                <Play className="w-5 h-5" />
              </Link>
            </div>

            {/* Subtopics */}
            {topic.subtopics && topic.subtopics.length > 0 && expandedTopics.has(topic.id) && (
              <div className="border-t border-gray-100 bg-gray-50">
                {topic.subtopics.map((subtopic) => (
                  <div
                    key={subtopic.id}
                    className="p-4 pl-12 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sage-800">{subtopic.name}</h4>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden max-w-24">
                          <div
                            className="h-full rounded-full bg-sage-400 transition-all"
                            style={{ width: `${(subtopic.masteryLevel || 0) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round((subtopic.masteryLevel || 0) * 100)}%
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/study/${subtopic.id}`}
                      className="p-2 rounded-lg bg-sage-100 text-sage-600 hover:bg-sage-200 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
