const Anthropic = require('@anthropic-ai/sdk');
const {
  TUTOR_SYSTEM_PROMPT,
  QUESTION_GENERATOR_PROMPT,
  EXPLANATION_PROMPT,
  MASTERY_EVALUATOR_PROMPT
} = require('../prompts/tutor');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const MODEL = 'claude-sonnet-4-20250514';

/**
 * Chat with the tutor AI
 */
async function chat(messages, topicContext = null) {
  let systemPrompt = TUTOR_SYSTEM_PROMPT;

  if (topicContext) {
    systemPrompt += `\n\nCONTEXTO ATUAL:\n- Matéria: ${topicContext.subject}\n- Tópico: ${topicContext.topic}\n- Nível do aluno: ${topicContext.masteryLevel || 'desconhecido'}`;
  }

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role === 'USER' ? 'user' : 'assistant',
      content: m.content
    }))
  });

  return response.content[0].text;
}

/**
 * Generate a question based on topic and difficulty
 */
async function generateQuestion(topic, difficulty = 'medium', history = []) {
  const historyContext = history.length > 0
    ? `\n\nHISTÓRICO RECENTE DO ALUNO:\n${history.map(h => `- ${h.isCorrect ? '✓' : '✗'} ${h.question.substring(0, 50)}...`).join('\n')}`
    : '';

  const prompt = `Gere uma questão de nível ${difficulty} sobre: ${topic.name}
${topic.description ? `Descrição: ${topic.description}` : ''}
${historyContext}

Responda APENAS com o JSON válido, sem texto adicional.`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: QUESTION_GENERATOR_PROMPT,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = response.content[0].text;

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format from AI');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Explain a concept or answer
 */
async function explain(question, userAnswer, correctAnswer, topic) {
  const prompt = `O aluno respondeu uma questão sobre ${topic.name}.

QUESTÃO: ${question}
RESPOSTA DO ALUNO: ${userAnswer}
RESPOSTA CORRETA: ${correctAnswer}

Explique por que a resposta correta é essa e ajude o aluno a entender o conceito.`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: EXPLANATION_PROMPT,
    messages: [{ role: 'user', content: prompt }]
  });

  return response.content[0].text;
}

/**
 * Evaluate student mastery based on history
 */
async function evaluateMastery(topic, history) {
  if (history.length < 3) {
    return {
      masteryLevel: 0.3,
      strengths: [],
      weaknesses: ['Precisa de mais prática'],
      recommendation: 'Continue praticando para ter uma avaliação mais precisa.',
      readyForAdvance: false,
      suggestedDifficulty: 'easy'
    };
  }

  const historyText = history.map(h =>
    `- Questão: ${h.question.substring(0, 100)}...\n  Resposta: ${h.userAnswer}\n  Correto: ${h.isCorrect ? 'Sim' : 'Não'}\n  Dificuldade: ${h.difficulty}`
  ).join('\n\n');

  const prompt = `Avalie o domínio do aluno em: ${topic.name}

HISTÓRICO DE RESPOSTAS:
${historyText}

Responda APENAS com o JSON válido, sem texto adicional.`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: MASTERY_EVALUATOR_PROMPT,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format from AI');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Get a study tip based on performance
 */
async function getStudyTip(topic, masteryLevel) {
  const prompt = `Dê uma dica de estudo curta e prática para um aluno com nível ${masteryLevel * 100}% de domínio em ${topic.name}. Máximo 2 frases.`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 256,
    system: TUTOR_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }]
  });

  return response.content[0].text;
}

module.exports = {
  chat,
  generateQuestion,
  explain,
  evaluateMastery,
  getStudyTip
};
