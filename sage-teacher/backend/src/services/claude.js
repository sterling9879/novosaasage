const {
  TUTOR_SYSTEM_PROMPT,
  QUESTION_GENERATOR_PROMPT,
  EXPLANATION_PROMPT,
  MASTERY_EVALUATOR_PROMPT
} = require('../prompts/tutor');

const WAVESPEED_API_URL = 'https://api.wavespeed.ai/api/v3/wavespeed-ai/any-llm';
const MODEL = 'anthropic/claude-3.7-sonnet';

/**
 * Call WaveSpeed API
 */
async function callWaveSpeed(prompt, maxLength = 9500) {
  const apiKey = process.env.WAVESPEED_API_KEY;

  if (!apiKey) {
    throw new Error('WAVESPEED_API_KEY não configurada');
  }

  // Truncate prompt if needed
  const truncatedPrompt = prompt.length > maxLength
    ? prompt.substring(prompt.length - maxLength)
    : prompt;

  const response = await fetch(WAVESPEED_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt: truncatedPrompt,
      model: MODEL,
      enable_sync_mode: true,
      priority: 'latency',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro na API WaveSpeed' }));
    throw new Error(error.message || 'Erro na API WaveSpeed');
  }

  const data = await response.json();

  // Handle response format
  if (data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
    return data.outputs[0];
  }

  if (data.output) {
    return data.output;
  }

  if (data.data?.outputs?.[0]) {
    return data.data.outputs[0];
  }

  console.error('WaveSpeed: Unexpected response format:', data);
  throw new Error('Resposta vazia da API');
}

/**
 * Chat with the tutor AI
 */
async function chat(messages, topicContext = null) {
  let systemPrompt = TUTOR_SYSTEM_PROMPT;

  if (topicContext) {
    systemPrompt += `\n\nCONTEXTO ATUAL:\n- Matéria: ${topicContext.subject}\n- Tópico: ${topicContext.topic}\n- Nível do aluno: ${topicContext.masteryLevel || 'desconhecido'}`;
  }

  // Build conversation prompt
  let prompt = `Sistema: ${systemPrompt}\n\n---\n\n`;

  // Add message history
  for (const msg of messages) {
    const role = msg.role === 'USER' ? 'Usuário' : 'Assistente';
    prompt += `${role}: ${msg.content}\n\n`;
  }

  prompt += 'Assistente:';

  return callWaveSpeed(prompt);
}

/**
 * Generate a question based on topic and difficulty
 */
async function generateQuestion(topic, difficulty = 'medium', history = []) {
  const historyContext = history.length > 0
    ? `\n\nHISTÓRICO RECENTE DO ALUNO:\n${history.map(h => `- ${h.isCorrect ? '✓' : '✗'} ${h.question.substring(0, 50)}...`).join('\n')}`
    : '';

  const userPrompt = `Gere uma questão de nível ${difficulty} sobre: ${topic.name}
${topic.description ? `Descrição: ${topic.description}` : ''}
${historyContext}

Responda APENAS com o JSON válido, sem texto adicional.`;

  const prompt = `Sistema: ${QUESTION_GENERATOR_PROMPT}\n\n---\n\nUsuário: ${userPrompt}\n\nAssistente:`;

  const response = await callWaveSpeed(prompt);

  // Extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format from AI');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Explain a concept or answer
 */
async function explain(question, userAnswer, correctAnswer, topic) {
  const userPrompt = `O aluno respondeu uma questão sobre ${topic.name}.

QUESTÃO: ${question}
RESPOSTA DO ALUNO: ${userAnswer}
RESPOSTA CORRETA: ${correctAnswer}

Explique por que a resposta correta é essa e ajude o aluno a entender o conceito.`;

  const prompt = `Sistema: ${EXPLANATION_PROMPT}\n\n---\n\nUsuário: ${userPrompt}\n\nAssistente:`;

  return callWaveSpeed(prompt);
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

  const userPrompt = `Avalie o domínio do aluno em: ${topic.name}

HISTÓRICO DE RESPOSTAS:
${historyText}

Responda APENAS com o JSON válido, sem texto adicional.`;

  const prompt = `Sistema: ${MASTERY_EVALUATOR_PROMPT}\n\n---\n\nUsuário: ${userPrompt}\n\nAssistente:`;

  const response = await callWaveSpeed(prompt);

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format from AI');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Get a study tip based on performance
 */
async function getStudyTip(topic, masteryLevel) {
  const userPrompt = `Dê uma dica de estudo curta e prática para um aluno com nível ${masteryLevel * 100}% de domínio em ${topic.name}. Máximo 2 frases.`;

  const prompt = `Sistema: ${TUTOR_SYSTEM_PROMPT}\n\n---\n\nUsuário: ${userPrompt}\n\nAssistente:`;

  return callWaveSpeed(prompt);
}

module.exports = {
  chat,
  generateQuestion,
  explain,
  evaluateMastery,
  getStudyTip
};
