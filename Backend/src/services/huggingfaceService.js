import OpenAI from 'openai';

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
  if (!process.env.GROK_API_KEY) {
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
      apiKey: process.env.GROK_API_KEY,
      baseURL: 'https://api.x.ai/v1',
    });

    const response = await client.messages.create({
      model: 'grok-2',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
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
      code: err.code,
      status: err.status,
      details: err.toString()
    });
    return fallbackFeedback(answer);
  }
}
