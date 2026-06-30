import { Router, Request, Response } from 'express';
import OpenAI from 'openai';

const router = Router();

// DeepSeek is OpenAI-compatible — just swap the baseURL
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: 'https://api.deepseek.com',
});

// POST /v1/enrich — $0.05 — full NLP enrichment
router.post('/enrich', async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text field is required' });
  }

  try {
    const chat = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a text analysis engine. Respond with valid JSON only.',
        },
        {
          role: 'user',
          content: `Analyze this text and return a JSON object with:\n- "summary": 1-2 sentence summary\n- "keywords": array of 5 key terms\n- "sentiment": "positive" | "negative" | "neutral"\n- "word_count": number\n\nText: ${text.slice(0, 3000)}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 512,
    });

    const result = JSON.parse(chat.choices[0].message.content ?? '{}');
    return res.json({ ok: true, model: 'deepseek-chat', data: result });
  } catch (err: any) {
    return res.status(502).json({ error: 'AI backend error', detail: err.message });
  }
});

// POST /v1/summarize — $0.02 — summary only
router.post('/summarize', async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text field is required' });
  }

  try {
    const chat = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: `Summarize in 2 sentences, be concise: ${text.slice(0, 3000)}`,
        },
      ],
      max_tokens: 200,
    });

    return res.json({
      ok: true,
      model: 'deepseek-chat',
      summary: chat.choices[0].message.content,
    });
  } catch (err: any) {
    return res.status(502).json({ error: 'AI backend error', detail: err.message });
  }
});

// POST /v1/reason — $0.10 — DeepSeek-R1 reasoning
router.post('/reason', async (req: Request, res: Response) => {
  const { question } = req.body;
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'question field is required' });
  }

  try {
    const chat = await deepseek.chat.completions.create({
      model: 'deepseek-reasoner',
      messages: [
        {
          role: 'user',
          content: question.slice(0, 2000),
        },
      ],
      max_tokens: 1024,
    });

    return res.json({
      ok: true,
      model: 'deepseek-reasoner',
      reasoning: (chat.choices[0].message as any).reasoning_content ?? null,
      answer: chat.choices[0].message.content,
    });
  } catch (err: any) {
    return res.status(502).json({ error: 'AI backend error', detail: err.message });
  }
});

export default router;
