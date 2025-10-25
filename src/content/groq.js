import Groq from 'groq-sdk';

export async function getGroqChatCompletion(apiKey, context) {
  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  return groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: context,
      },
    ],
    model: 'llama-3.3-70b-versatile',
  });
}

// { [{ 'id': 'meta-llama/llama-prompt-guard-2-22m', 'object': 'model', 'created': 1748632101, 'owned_by': 'Meta', 'active': True, 'context_window': 512, 'public_apps': None, 'max_completion_tokens': 512 }, { 'id': 'whisper-large-v3-turbo', 'object': 'model', 'created': 1728413088, 'owned_by': 'OpenAI', 'active': True, 'context_window': 448, 'public_apps': None, 'max_completion_tokens': 448 }, { 'id': 'openai/gpt-oss-20b', 'object': 'model', 'created': 1754407957, 'owned_by': 'OpenAI', 'active': True, 'context_window': 131072, 'public_apps': None, 'max_completion_tokens': 65536 }, { 'id': 'meta-llama/llama-4-maverick-17b-128e-instruct', 'object': 'model', 'created': 1743877158, 'owned_by': 'Meta', 'active': True, 'context_window': 131072, 'public_apps': None, 'max_completion_tokens': 8192 }] }