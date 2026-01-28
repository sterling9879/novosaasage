const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const claude = require('../services/claude');

const router = express.Router();

// Start a study session
router.post('/sessions', authMiddleware, (req, res) => {
  try {
    const { topicId, subjectId, mode = 'practice' } = req.body;

    const sessionId = uuidv4();
    db.prepare(`
      INSERT INTO study_sessions (id, userId, topicId, subjectId, mode, startedAt)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run(sessionId, req.user.id, topicId || null, subjectId || null, mode);

    const session = db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(sessionId);
    res.status(201).json({ session });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ error: 'Erro ao iniciar sessão de estudo' });
  }
});

// End a study session
router.put('/sessions/:id/end', authMiddleware, (req, res) => {
  try {
    db.prepare(`
      UPDATE study_sessions
      SET endedAt = datetime('now')
      WHERE id = ? AND userId = ?
    `).run(req.params.id, req.user.id);

    const session = db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(req.params.id);
    res.json({ session });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ error: 'Erro ao finalizar sessão' });
  }
});

// Get a question for a topic
router.post('/questions/generate', authMiddleware, async (req, res) => {
  try {
    const { topicId, difficulty = 'medium' } = req.body;

    const topic = db.prepare('SELECT * FROM topics WHERE id = ?').get(topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Tópico não encontrado' });
    }

    // Get recent history for this topic
    const history = db.prepare(`
      SELECT question, userAnswer, isCorrect, difficulty
      FROM question_history
      WHERE userId = ? AND topicId = ?
      ORDER BY createdAt DESC
      LIMIT 5
    `).all(req.user.id, topicId);

    const question = await claude.generateQuestion(topic, difficulty, history);

    res.json({ question, topicId });
  } catch (error) {
    console.error('Generate question error:', error);
    res.status(500).json({ error: 'Erro ao gerar questão' });
  }
});

// Submit an answer
router.post('/questions/answer', authMiddleware, async (req, res) => {
  try {
    const {
      topicId,
      sessionId,
      question,
      userAnswer,
      correctAnswer,
      isCorrect,
      difficulty = 'medium',
      responseTimeMs
    } = req.body;

    // Save to question history
    const questionId = uuidv4();
    db.prepare(`
      INSERT INTO question_history (id, userId, topicId, question, userAnswer, correctAnswer, isCorrect, difficulty, responseTimeMs, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(questionId, req.user.id, topicId, question, userAnswer, correctAnswer, isCorrect ? 1 : 0, difficulty, responseTimeMs || null);

    // Update user progress
    const existingProgress = db.prepare(
      'SELECT * FROM user_progress WHERE userId = ? AND topicId = ?'
    ).get(req.user.id, topicId);

    if (existingProgress) {
      const newCorrect = existingProgress.correctAnswers + (isCorrect ? 1 : 0);
      const newTotal = existingProgress.questionsAnswered + 1;
      const newMastery = Math.min(1, newCorrect / Math.max(newTotal, 1));

      db.prepare(`
        UPDATE user_progress
        SET questionsAnswered = ?, correctAnswers = ?, masteryLevel = ?, lastStudiedAt = datetime('now'), updatedAt = datetime('now')
        WHERE userId = ? AND topicId = ?
      `).run(newTotal, newCorrect, newMastery, req.user.id, topicId);
    } else {
      const progressId = uuidv4();
      db.prepare(`
        INSERT INTO user_progress (id, userId, topicId, questionsAnswered, correctAnswers, masteryLevel, lastStudiedAt, createdAt, updatedAt)
        VALUES (?, ?, ?, 1, ?, ?, datetime('now'), datetime('now'), datetime('now'))
      `).run(progressId, req.user.id, topicId, isCorrect ? 1 : 0, isCorrect ? 1 : 0);
    }

    // Update session stats
    if (sessionId) {
      db.prepare(`
        UPDATE study_sessions
        SET questionsAnswered = questionsAnswered + 1, correctAnswers = correctAnswers + ?
        WHERE id = ?
      `).run(isCorrect ? 1 : 0, sessionId);
    }

    // Get updated progress
    const progress = db.prepare(
      'SELECT * FROM user_progress WHERE userId = ? AND topicId = ?'
    ).get(req.user.id, topicId);

    res.json({
      saved: true,
      progress: {
        masteryLevel: progress.masteryLevel,
        questionsAnswered: progress.questionsAnswered,
        correctAnswers: progress.correctAnswers
      }
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ error: 'Erro ao salvar resposta' });
  }
});

// Get explanation for a question
router.post('/explain', authMiddleware, async (req, res) => {
  try {
    const { topicId, question, userAnswer, correctAnswer } = req.body;

    const topic = db.prepare('SELECT * FROM topics WHERE id = ?').get(topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Tópico não encontrado' });
    }

    const explanation = await claude.explain(question, userAnswer, correctAnswer, topic);
    res.json({ explanation });
  } catch (error) {
    console.error('Explain error:', error);
    res.status(500).json({ error: 'Erro ao gerar explicação' });
  }
});

// Evaluate mastery for a topic
router.get('/mastery/:topicId', authMiddleware, async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = db.prepare('SELECT * FROM topics WHERE id = ?').get(topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Tópico não encontrado' });
    }

    const history = db.prepare(`
      SELECT question, userAnswer, isCorrect, difficulty
      FROM question_history
      WHERE userId = ? AND topicId = ?
      ORDER BY createdAt DESC
      LIMIT 20
    `).all(req.user.id, topicId);

    const evaluation = await claude.evaluateMastery(topic, history);
    res.json({ evaluation });
  } catch (error) {
    console.error('Evaluate mastery error:', error);
    res.status(500).json({ error: 'Erro ao avaliar domínio' });
  }
});

// Get user stats
router.get('/stats', authMiddleware, (req, res) => {
  try {
    const overallStats = db.prepare(`
      SELECT
        COUNT(*) as totalQuestions,
        SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END) as correctAnswers,
        COUNT(DISTINCT topicId) as topicsStudied
      FROM question_history
      WHERE userId = ?
    `).get(req.user.id);

    const recentActivity = db.prepare(`
      SELECT
        DATE(createdAt) as date,
        COUNT(*) as questions,
        SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END) as correct
      FROM question_history
      WHERE userId = ? AND createdAt >= date('now', '-7 days')
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
    `).all(req.user.id);

    const topTopics = db.prepare(`
      SELECT t.name, up.masteryLevel, up.questionsAnswered
      FROM user_progress up
      JOIN topics t ON up.topicId = t.id
      WHERE up.userId = ?
      ORDER BY up.masteryLevel DESC
      LIMIT 5
    `).all(req.user.id);

    res.json({
      overall: {
        totalQuestions: overallStats.totalQuestions || 0,
        correctAnswers: overallStats.correctAnswers || 0,
        accuracy: overallStats.totalQuestions > 0
          ? (overallStats.correctAnswers / overallStats.totalQuestions * 100).toFixed(1)
          : 0,
        topicsStudied: overallStats.topicsStudied || 0
      },
      recentActivity,
      topTopics
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

module.exports = router;
