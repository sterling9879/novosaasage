import axios from 'axios';

// Use relative URL in production (nginx proxies to backend), localhost for development
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4001/api' : '/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sage-teacher-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sage-teacher-token');
      localStorage.removeItem('sage-teacher-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Subjects
export const subjectsApi = {
  getAll: () => api.get('/subjects'),
  getById: (id: string) => api.get(`/subjects/${id}`),
};

// Study
export const studyApi = {
  startSession: (data: { topicId?: string; subjectId?: string; mode?: string }) =>
    api.post('/study/sessions', data),
  endSession: (sessionId: string) =>
    api.put(`/study/sessions/${sessionId}/end`),
  generateQuestion: (data: { topicId: string; difficulty?: string }) =>
    api.post('/study/questions/generate', data),
  submitAnswer: (data: {
    topicId: string;
    sessionId?: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    difficulty?: string;
    responseTimeMs?: number;
  }) => api.post('/study/questions/answer', data),
  getExplanation: (data: {
    topicId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
  }) => api.post('/study/explain', data),
  getMastery: (topicId: string) => api.get(`/study/mastery/${topicId}`),
  getStats: () => api.get('/study/stats'),
};

// Chat
export const chatApi = {
  send: (data: {
    message: string;
    sessionId?: string;
    topicId?: string;
    subjectId?: string;
  }) => api.post('/chat', data),
  getHistory: (sessionId?: string, limit?: number) =>
    api.get('/chat/history', { params: { sessionId, limit } }),
  clearHistory: (sessionId?: string) =>
    api.delete('/chat/history', { params: { sessionId } }),
};

export default api;
