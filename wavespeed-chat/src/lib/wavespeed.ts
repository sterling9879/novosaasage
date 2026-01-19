import { prisma } from './prisma';

export async function getApiKey(): Promise<string | null> {
  // Try to get from database first
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: 'wavespeed_api_key' },
    });
    if (setting?.value) {
      return setting.value;
    }
  } catch (error) {
    console.error('Error fetching API key from database:', error);
  }

  // Fallback to environment variable
  return process.env.WAVESPEED_API_KEY || null;
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
  newMessage: string,
  systemPrompt?: string | null
): string {
  let prompt = '';

  // Add system prompt if provided
  if (systemPrompt) {
    prompt += `Sistema: ${systemPrompt}\n\n---\n\n`;
  }

  const recentMessages = messages.slice(-10);

  for (const msg of recentMessages) {
    const role = msg.role === 'USER' ? 'Usuário' : 'Assistente';
    prompt += `${role}: ${msg.content}\n\n`;
  }

  prompt += `Usuário: ${newMessage}\n\nAssistente:`;
  return prompt;
}

// Get image description using sync mode (simpler, no polling needed)
export async function getImageDescription(imageUrl: string): Promise<string> {
  const apiKey = await getApiKey();

  if (!apiKey) {
    throw new Error('API Key não configurada. Configure no painel admin.');
  }

  console.log('Submitting image for captioning (sync mode):', imageUrl);

  const response = await fetch(
    'https://api.wavespeed.ai/api/v3/wavespeed-ai/molmo2/image-captioner',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        detail_level: 'high',
        enable_sync_mode: true,
        image: imageUrl,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Image caption error:', response.status, errorText);
    throw new Error(`Erro ao processar imagem: ${response.status}`);
  }

  const data = await response.json();
  console.log('Image caption response:', JSON.stringify(data));

  // Handle response format
  if (data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
    console.log('Image description received:', data.outputs[0].substring(0, 100) + '...');
    return data.outputs[0];
  }

  if (data.output) {
    return data.output;
  }

  if (data.data?.outputs?.[0]) {
    return data.data.outputs[0];
  }

  console.error('Unexpected image caption response format:', data);
  throw new Error('Resposta vazia do image-captioner');
}

// Build prompt with image description
export function buildPromptWithImage(
  messages: Array<{ role: string; content: string }>,
  newMessage: string,
  imageDescription: string | null,
  systemPrompt?: string | null
): string {
  let prompt = '';

  // Add system prompt if provided
  if (systemPrompt) {
    prompt += `Sistema: ${systemPrompt}\n\n---\n\n`;
  }

  const recentMessages = messages.slice(-10);

  for (const msg of recentMessages) {
    const role = msg.role === 'USER' ? 'Usuário' : 'Assistente';
    prompt += `${role}: ${msg.content}\n\n`;
  }

  // Include image description in the message if provided
  if (imageDescription) {
    prompt += `Usuário: [Imagem anexada: ${imageDescription}]\n${newMessage}\n\nAssistente:`;
  } else {
    prompt += `Usuário: ${newMessage}\n\nAssistente:`;
  }

  return prompt;
}
