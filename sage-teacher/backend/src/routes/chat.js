const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const claude = require('../services/claude');

const router = express.Router();

// Chat with tutor
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message, sessionId, topicId, subjectId } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Mensagem vazia' });
    }

    // Get topic context if available
    let topicContext = null;
    if (topicId) {
      const topic = db.prepare(`
        SELECT t.*, s.name as subjectName
        FROM topics t
        JOIN subjects s ON t.subjectId = s.id
        WHERE t.id = ?
      `).get(topicId);

      if (topic) {
        const progress = db.prepare(
          'SELECT masteryLevel FROM user_progress WHERE userId = ? AND topicId = ?'
        ).get(req.user.id, topicId);

        topicContext = {
          subject: topic.subjectName,
          topic: topic.name,
          masteryLevel: progress?.masteryLevel || 0
        };
      }
    } else if (subjectId) {
      const subject = db.prepare('SELECT * FROM subjects WHERE id = ?').get(subjectId);
      if (subject) {
        topicContext = { subject: subject.name, topic: null, masteryLevel: null };
      }
    }

    // Get recent chat history for context (last 10 messages)
    const recentMessages = db.prepare(`
      SELECT role, content
      FROM teacher_chat_messages
      WHERE userId = ? AND (sessionId = ? OR sessionId IS NULL)
      ORDER BY createdAt DESC
      LIMIT 10
    `).all(req.user.id, sessionId || null).reverse();

    // Add user message
    const userMsgId = uuidv4();
    db.prepare(`
      INSERT INTO teacher_chat_messages (id, userId, sessionId, role, content, topicId, createdAt)
      VALUES (?, ?, ?, 'USER', ?, ?, datetime('now'))
    `).run(userMsgId, req.user.id, sessionId || null, message, topicId || null);

    // Build messages array for Claude
    const messages = [
      ...recentMessages,
      { role: 'USER', content: message }
    ];

    // Get AI response
    const aiResponse = await claude.chat(messages, topicContext);

    // Save AI response
    const aiMsgId = uuidv4();
    db.prepare(`
      INSERT INTO teacher_chat_messages (id, userId, sessionId, role, content, topicId, createdAt)
      VALUES (?, ?, ?, 'ASSISTANT', ?, ?, datetime('now'))
    `).run(aiMsgId, req.user.id, sessionId || null, aiResponse, topicId || null);

    res.json({
      userMessage: {
        id: userMsgId,
        role: 'USER',
        content: message
      },
      assistantMessage: {
        id: aiMsgId,
        role: 'ASSISTANT',
        content: aiResponse
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

// Get chat history
router.get('/history', authMiddleware, (req, res) => {
  try {
    const { sessionId, limit = 50 } = req.query;

    const messages = db.prepare(`
      SELECT id, role, content, topicId, createdAt
      FROM teacher_chat_messages
      WHERE userId = ? ${sessionId ? 'AND sessionId = ?' : ''}
      ORDER BY createdAt ASC
      LIMIT ?
    `).all(req.user.id, ...(sessionId ? [sessionId, limit] : [limit]));

    res.json({ messages });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

// Clear chat history
router.delete('/history', authMiddleware, (req, res) => {
  try {
    const { sessionId } = req.query;

    if (sessionId) {
      db.prepare('DELETE FROM teacher_chat_messages WHERE userId = ? AND sessionId = ?')
        .run(req.user.id, sessionId);
    } else {
      db.prepare('DELETE FROM teacher_chat_messages WHERE userId = ?').run(req.user.id);
    }

    res.json({ cleared: true });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ error: 'Erro ao limpar histórico' });
  }
});

module.exports = router;
