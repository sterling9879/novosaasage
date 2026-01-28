const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all subjects with user progress
router.get('/', authMiddleware, (req, res) => {
  try {
    const subjects = db.prepare(`
      SELECT s.*,
        (SELECT COUNT(*) FROM topics WHERE subjectId = s.id AND parentTopicId IS NULL) as topicCount
      FROM subjects s
      ORDER BY s.orderIndex
    `).all();

    // Get user progress for each subject
    const subjectsWithProgress = subjects.map(subject => {
      const progress = db.prepare(`
        SELECT
          AVG(up.masteryLevel) as avgMastery,
          SUM(up.questionsAnswered) as totalQuestions,
          SUM(up.correctAnswers) as totalCorrect
        FROM user_progress up
        JOIN topics t ON up.topicId = t.id
        WHERE up.userId = ? AND t.subjectId = ?
      `).get(req.user.id, subject.id);

      return {
        ...subject,
        progress: {
          masteryLevel: progress?.avgMastery || 0,
          questionsAnswered: progress?.totalQuestions || 0,
          correctAnswers: progress?.totalCorrect || 0
        }
      };
    });

    res.json({ subjects: subjectsWithProgress });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Erro ao buscar matérias' });
  }
});

// Get single subject with topics
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const subject = db.prepare('SELECT * FROM subjects WHERE id = ?').get(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: 'Matéria não encontrada' });
    }

    // Get topics for this subject
    const topics = db.prepare(`
      SELECT t.*,
        (SELECT masteryLevel FROM user_progress WHERE userId = ? AND topicId = t.id) as masteryLevel,
        (SELECT questionsAnswered FROM user_progress WHERE userId = ? AND topicId = t.id) as questionsAnswered
      FROM topics t
      WHERE t.subjectId = ?
      ORDER BY t.orderIndex
    `).all(req.user.id, req.user.id, subject.id);

    // Organize into parent/child structure
    const parentTopics = topics.filter(t => !t.parentTopicId);
    const topicsWithChildren = parentTopics.map(parent => ({
      ...parent,
      masteryLevel: parent.masteryLevel || 0,
      questionsAnswered: parent.questionsAnswered || 0,
      subtopics: topics
        .filter(t => t.parentTopicId === parent.id)
        .map(sub => ({
          ...sub,
          masteryLevel: sub.masteryLevel || 0,
          questionsAnswered: sub.questionsAnswered || 0
        }))
    }));

    res.json({ subject, topics: topicsWithChildren });
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ error: 'Erro ao buscar matéria' });
  }
});

module.exports = router;
