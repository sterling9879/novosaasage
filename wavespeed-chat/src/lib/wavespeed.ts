import { prisma } from './prisma';

export async function getApiKey(): Promise<string | null> {
  const setting = await prisma.settings.findUnique({
    where: { key: 'wavespeed_api_key' },
  });
  return setting?.value || null;
}

export async function setApiKey(apiKey: string): Promise<void> {
  await prisma.settings.upsert({
    where: { key: 'wavespeed_api_key' },
    update: { value: apiKey },
    create: { key: 'wavespeed_api_key', value: apiKey },
  });
}

export async function chatWithAI(prompt: string, model: string): Promise<string> {
  const apiKey = await getApiKey();

  if (!apiKey) {
    throw new Error('API Key não configurada. Configure no painel admin.');
  }

  const response = await fetch('https://api.wavespeed.ai/api/v3/wavespeed-ai/any-llm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt,
      model,
      enable_sync_mode: true,
      priority: 'latency',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro na API WaveSpeed' }));
    throw new Error(error.message || 'Erro na API WaveSpeed');
  }

  const data = await response.json();
  console.log('WaveSpeed API response:', JSON.stringify(data));

  // A API retorna outputs como array
  if (data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
    return data.outputs[0];
  }

  // Fallback para outros formatos
  if (data.output) {
    return data.output;
  }

  // Se tiver data.data.outputs (resposta aninhada)
  if (data.data?.outputs?.[0]) {
    return data.data.outputs[0];
  }

  console.error('WaveSpeed: Formato de resposta inesperado:', data);
  throw new Error('Resposta vazia da API');
}

export function buildPromptWithHistory(
  messages: Array<{ role: string; content: string }>,
  newMessage: string
): string {
  let prompt = '';

  const recentMessages = messages.slice(-10);

  for (const msg of recentMessages) {
    const role = msg.role === 'USER' ? 'Usuário' : 'Assistente';
    prompt += `${role}: ${msg.content}\n\n`;
  }

  prompt += `Usuário: ${newMessage}\n\nAssistente:`;
  return prompt;
}
