const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/sage-teacher.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');

// Initialize database schema
function initializeDatabase() {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      lastLoginAt TEXT
    );

    -- Subjects table (e.g., Português, Matemática, etc.)
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      color TEXT DEFAULT '#4A7C59',
      orderIndex INTEGER DEFAULT 0
    );

    -- Topics table (e.g., Gramática > Concordância Verbal)
    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      subjectId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      parentTopicId TEXT,
      orderIndex INTEGER DEFAULT 0,
      FOREIGN KEY (subjectId) REFERENCES subjects(id),
      FOREIGN KEY (parentTopicId) REFERENCES topics(id)
    );

    -- User progress per topic
    CREATE TABLE IF NOT EXISTS user_progress (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      topicId TEXT NOT NULL,
      masteryLevel REAL DEFAULT 0,
      questionsAnswered INTEGER DEFAULT 0,
      correctAnswers INTEGER DEFAULT 0,
      lastStudiedAt TEXT,
      nextReviewAt TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (topicId) REFERENCES topics(id),
      UNIQUE(userId, topicId)
    );

    -- Questions answered history
    CREATE TABLE IF NOT EXISTS question_history (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      topicId TEXT NOT NULL,
      question TEXT NOT NULL,
      userAnswer TEXT,
      correctAnswer TEXT,
      isCorrect INTEGER,
      explanation TEXT,
      difficulty TEXT DEFAULT 'medium',
      responseTimeMs INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (topicId) REFERENCES topics(id)
    );

    -- Study sessions
    CREATE TABLE IF NOT EXISTS study_sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      topicId TEXT,
      subjectId TEXT,
      startedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      endedAt TEXT,
      questionsAnswered INTEGER DEFAULT 0,
      correctAnswers INTEGER DEFAULT 0,
      mode TEXT DEFAULT 'practice',
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (topicId) REFERENCES topics(id),
      FOREIGN KEY (subjectId) REFERENCES subjects(id)
    );

    -- Chat messages for tutoring conversations
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      sessionId TEXT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      topicId TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (sessionId) REFERENCES study_sessions(id),
      FOREIGN KEY (topicId) REFERENCES topics(id)
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(userId);
    CREATE INDEX IF NOT EXISTS idx_user_progress_topic ON user_progress(topicId);
    CREATE INDEX IF NOT EXISTS idx_question_history_user ON question_history(userId);
    CREATE INDEX IF NOT EXISTS idx_question_history_topic ON question_history(topicId);
    CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON study_sessions(userId);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(sessionId);
  `);

  // Seed initial subjects if empty
  const subjectCount = db.prepare('SELECT COUNT(*) as count FROM subjects').get();
  if (subjectCount.count === 0) {
    seedSubjects();
  }
}

function seedSubjects() {
  const subjects = [
    { id: 'portugues', name: 'Português', description: 'Gramática, interpretação e redação', icon: '📚', color: '#4A7C59' },
    { id: 'matematica', name: 'Matemática', description: 'Álgebra, geometria e estatística', icon: '📐', color: '#2563EB' },
    { id: 'historia', name: 'História', description: 'História do Brasil e do mundo', icon: '🏛️', color: '#DC2626' },
    { id: 'geografia', name: 'Geografia', description: 'Geografia física e humana', icon: '🌍', color: '#059669' },
    { id: 'biologia', name: 'Biologia', description: 'Citologia, genética e ecologia', icon: '🧬', color: '#7C3AED' },
    { id: 'fisica', name: 'Física', description: 'Mecânica, termodinâmica e eletricidade', icon: '⚡', color: '#F59E0B' },
    { id: 'quimica', name: 'Química', description: 'Química geral, orgânica e inorgânica', icon: '🧪', color: '#EC4899' },
    { id: 'filosofia', name: 'Filosofia', description: 'Pensadores e correntes filosóficas', icon: '🤔', color: '#6366F1' },
    { id: 'sociologia', name: 'Sociologia', description: 'Sociedade, cultura e política', icon: '👥', color: '#14B8A6' },
  ];

  const insertSubject = db.prepare(`
    INSERT INTO subjects (id, name, description, icon, color, orderIndex)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  subjects.forEach((subject, index) => {
    insertSubject.run(subject.id, subject.name, subject.description, subject.icon, subject.color, index);
  });

  // Seed topics for Português as example
  seedPortuguesTopics();
}

function seedPortuguesTopics() {
  const topics = [
    { id: 'gramatica', name: 'Gramática', description: 'Regras e estrutura da língua portuguesa' },
    { id: 'interpretacao', name: 'Interpretação de Texto', description: 'Compreensão e análise textual' },
    { id: 'redacao', name: 'Redação', description: 'Técnicas de escrita e argumentação' },
    { id: 'literatura', name: 'Literatura', description: 'Obras e movimentos literários brasileiros' },
  ];

  const insertTopic = db.prepare(`
    INSERT INTO topics (id, subjectId, name, description, orderIndex)
    VALUES (?, 'portugues', ?, ?, ?)
  `);

  topics.forEach((topic, index) => {
    insertTopic.run(topic.id, topic.name, topic.description, index);
  });

  // Sub-topics for Gramática
  const grammarSubtopics = [
    { id: 'concordancia', name: 'Concordância Verbal e Nominal', parentId: 'gramatica' },
    { id: 'regencia', name: 'Regência Verbal e Nominal', parentId: 'gramatica' },
    { id: 'crase', name: 'Crase', parentId: 'gramatica' },
    { id: 'pontuacao', name: 'Pontuação', parentId: 'gramatica' },
    { id: 'acentuacao', name: 'Acentuação', parentId: 'gramatica' },
  ];

  const insertSubtopic = db.prepare(`
    INSERT INTO topics (id, subjectId, name, parentTopicId, orderIndex)
    VALUES (?, 'portugues', ?, ?, ?)
  `);

  grammarSubtopics.forEach((topic, index) => {
    insertSubtopic.run(topic.id, topic.name, topic.parentId, index);
  });
}

// Initialize on module load
initializeDatabase();

module.exports = db;
