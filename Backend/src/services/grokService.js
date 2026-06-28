import OpenAI from 'openai';

function getAiConfig() {
  const apiKey = process.env.GROK_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) return null;

  const provider = process.env.AI_PROVIDER || (apiKey.startsWith('gsk_') ? 'groq' : 'xai');

  if (provider === 'groq') {
    return {
      apiKey,
      baseURL: process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1',
      model: process.env.AI_MODEL || 'llama-3.3-70b-versatile',
    };
  }

  return {
    apiKey,
    baseURL: process.env.AI_BASE_URL || 'https://api.x.ai/v1',
    model: process.env.AI_MODEL || 'grok-2',
  };
}

function fallbackFeedback(answer) {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  if (words < 15) {
    return {
      score: 35,
      strengths: ['You attempted the core idea.'],
      improvements: ['Expand the answer with definitions, examples, and trade-offs.'],
    };
  }
  if (words < 45) {
    return {
      score: 62,
      strengths: ['Clear basic explanation', 'Some relevant interview keywords present'],
      improvements: ['Add one practical example', 'Mention edge cases or constraints'],
    };
  }
  return {
    score: 80,
    strengths: ['Well structured answer', 'Good depth for a fresher interview'],
    improvements: ['Tighten the ending with a concise summary.'],
  };
}

export async function getInterviewFeedback({ question, answer, role, round }) {
  const config = getAiConfig();
  if (!config) {
    return fallbackFeedback(answer);
  }

  const prompt = `You are an expert Indian IT interview evaluator for freshers. Evaluate this interview answer.

Question: ${question}
Role: ${role}
Round: ${round}
Answer: ${answer}

Return ONLY valid JSON (no markdown, no code blocks):
{
  "score": <0-100>,
  "strengths": [<positive points>],
  "improvements": [<areas to improve>]
}`;

  try {
    const client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });

    const response = await client.chat.completions.create({
      model: config.model,
      max_tokens: 1024,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.choices[0]?.message?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return fallbackFeedback(answer);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      score: Math.min(100, Math.max(0, Number(parsed.score) || 0)),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    };
  } catch (err) {
    console.error('AI Feedback Error:', {
      message: err.message,
      status: err.status,
      provider: process.env.AI_PROVIDER || 'auto',
    });
    return fallbackFeedback(answer);
  }
}
