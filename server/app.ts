import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { generatePersonaChatResponse, ChatRequestOptions } from './gemini';

dotenv.config();

export const apiApp = express();

apiApp.use(express.json({ limit: '10mb' }));

apiApp.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

apiApp.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      persona,
      tone,
      length,
      model,
      searchGrounding,
      thinkingMode,
      messages,
    } = req.body as ChatRequestOptions;

    if (!persona || !messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({
        error: 'Invalid request: persona and non-empty messages array are required.',
      });
      return;
    }

    const result = await generatePersonaChatResponse({
      persona,
      tone: tone || 'professional',
      length: length || 'detailed',
      model,
      searchGrounding: Boolean(searchGrounding),
      thinkingMode: Boolean(thinkingMode),
      messages,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    const errorMessage =
      error?.message || 'An unexpected error occurred while generating AI response.';
    res.status(500).json({
      error: errorMessage,
    });
  }
});
