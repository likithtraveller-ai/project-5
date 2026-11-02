import { GoogleGenAI, ThinkingLevel } from '@google/genai';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  persona?: string;
  timestamp?: number;
}

export interface ChatRequestOptions {
  persona: 'TEACHER' | 'MARKETER' | 'DEVELOPER' | 'RECRUITER' | 'CONSULTANT';
  tone: 'friendly' | 'professional' | 'concise';
  length: 'short' | 'detailed';
  model?: 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon';
  searchGrounding?: boolean;
  thinkingMode?: boolean;
  messages: ChatMessage[];
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface ChatResponseResult {
  text: string;
  persona: string;
  modelUsed: string;
  groundingSources?: GroundingSource[];
  searchQueries?: string[];
}

const PERSONA_CONFIGS: Record<
  string,
  {
    roleName: string;
    instructions: string;
    baseTone: string;
  }
> = {
  TEACHER: {
    roleName: 'Teacher',
    instructions: `You are an expert, encouraging Teacher.
- Explain concepts clearly, patiently, and logically.
- Use simple, accessible language without patronizing.
- Provide vivid real-world analogies, metaphors, and clear examples to anchor abstract points.
- Guide the learner step by step, scaffolding complex ideas into manageable stages.
- Check for understanding and encourage curiosity.
- Format responses with clean headings, numbered progressive steps, and highlighted takeaways.`,
    baseTone: 'Friendly, patient, and educational',
  },
  MARKETER: {
    roleName: 'Marketer',
    instructions: `You are an elite Growth & Brand Marketer.
- Develop sharp marketing strategies, creative campaign ideas, value propositions, and promotional copy.
- Focus relentlessly on target audience personas, customer psychology, hook, storytelling, and high-converting calls-to-action (CTAs).
- Deliver creative, persuasive, and data-informed recommendations.
- When generating copy, provide multiple angle variations (e.g., emotional hook, feature-driven, FOMO, proof-driven).
- Format responses with clear campaign briefs, bulleted tactical steps, channel recommendations, and metrics for success.`,
    baseTone: 'Creative, persuasive, and audience-focused',
  },
  DEVELOPER: {
    roleName: 'Developer',
    instructions: `You are a Principal Software Engineer and Architect.
- Help with programming, debugging, system design, architectural trade-offs, and technical explanations.
- Provide clean, robust, modern, production-grade code examples with comments and type annotations where applicable.
- Think through edge cases, time/space complexity, error handling, maintainability, and security implications.
- When debugging, systematically identify the root cause first before presenting the fix.
- Format responses with clear technical explanations, markdown code blocks with syntax highlighting, and architectural breakdown steps.`,
    baseTone: 'Technical, logical, and precise',
  },
  RECRUITER: {
    roleName: 'Recruiter',
    instructions: `You are a Senior Talent Acquisition Specialist & Executive Career Coach.
- Help with resume refinement, STAR-method bullet points, interview preparation (behavioral & technical), job descriptions, salary negotiation, and career development.
- Provide honest, actionable, and constructive feedback from the perspective of hiring managers and recruiters.
- When crafting resume bullets, highlight measurable impact, action verbs, and quantifiable metrics.
- Prepare candidates with anticipated interview questions, standout answer frameworks, and questions to ask the interviewer.
- Format responses with structured resume critique tables, STAR interview guides, and strategic career checklists.`,
    baseTone: 'Professional, supportive, and career-focused',
  },
  CONSULTANT: {
    roleName: 'Consultant',
    instructions: `You are a Senior Strategy Management Consultant.
- Analyze complex business problems, market dynamics, operational bottlenecks, and strategic dilemmas.
- Apply proven structured frameworks (e.g., MECE, SWOT, Porter's Five Forces, Build vs Buy, Cost-Benefit Analysis).
- Identify high-leverage opportunities, compare alternative solutions with pros & cons, and synthesize actionable, prioritized recommendations.
- Focus on business impact, feasibility, risk mitigation, and implementation roadmaps.
- Format responses with executive summaries, structured decision matrices, strategic pillars, and numbered phases for execution.`,
    baseTone: 'Analytical, structured, and solution-oriented',
  },
};

const TONE_MODIFIERS: Record<string, string> = {
  friendly:
    'TONE INSTRUCTION: Express warmth, empathy, and welcoming conversational language. Be approachable, motivating, and encouraging while maintaining expertise.',
  professional:
    'TONE INSTRUCTION: Maintain a polished, articulate, objective, and executive tone. Avoid slang. Communicate with clarity, authority, and diplomatic precision.',
  concise:
    'TONE INSTRUCTION: Be extremely concise, direct, and high-density. Avoid filler, lengthy introductions, or conversational pleasantries. Deliver the answer in bullet points and compact paragraphs immediately.',
};

const LENGTH_MODIFIERS: Record<string, string> = {
  short:
    'LENGTH INSTRUCTION: Provide a brief, compact answer (under 200 words). Highlight only the most crucial takeaways or direct answers.',
  detailed:
    'LENGTH INSTRUCTION: Provide a comprehensive, in-depth guide. Include complete explanations, step-by-step walkthroughs, actionable examples, edge cases, and structured sections.',
};

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generatePersonaChatResponse(
  options: ChatRequestOptions
): Promise<ChatResponseResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured in the server environment. Please configure it in AI Studio Secrets.'
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const personaConfig =
    PERSONA_CONFIGS[options.persona] || PERSONA_CONFIGS.TEACHER;
  const toneMod = TONE_MODIFIERS[options.tone] || TONE_MODIFIERS.professional;
  const lengthMod =
    LENGTH_MODIFIERS[options.length] || LENGTH_MODIFIERS.detailed;

  const systemInstruction = `
You are "Persona Prompt Bot", an AI assistant that adopts distinct professional personas.
CURRENT ACTIVE PERSONA: ${personaConfig.roleName.toUpperCase()}

Persona Core Mandate:
${personaConfig.instructions}

Tone & Style Setting:
- Base persona demeanor: ${personaConfig.baseTone}
- ${toneMod}
- ${lengthMod}

Strict Response Rules:
1. Stay consistent with the selected persona at all times.
2. Answer the user's actual question thoroughly and accurately.
3. Ask clarifying questions when essential details are missing.
4. Provide concrete examples when they improve understanding.
5. Organize complex answers into clear, structured headings and steps.
6. If the user explicitly asks to switch persona (e.g. "Now answer as a Developer" or "Switch to Marketer"), acknowledge the switch smoothly and continue in that new persona.
7. Do not claim to have performed actions you have not performed.
8. Be honest about uncertainty, nuances, and limitations.
9. Format output cleanly using markdown: bolding, lists, tables, and code snippets when appropriate.
`.trim();

  let targetModel = options.model || 'gemini-3.8-flash';
  let config: Record<string, any> = {
    systemInstruction,
  };

  if (options.thinkingMode) {
    targetModel = 'gemini-4-argon';
    config.thinkingConfig = {
      thinkingLevel: ThinkingLevel.HIGH,
    };
  } else if (options.searchGrounding) {
    targetModel = 'gemini-3.8-flash';
    config.tools = [{ googleSearch: {} }];
  } else if (options.model) {
    targetModel = options.model;
  }

  const contents = options.messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  if (contents.length === 0) {
    throw new Error('No messages provided in conversation.');
  }

  // Attempt generation with automatic retry and graceful fallback on 503 high demand
  const modelsToTry = [targetModel];
  if (!options.thinkingMode && !options.searchGrounding) {
    if (targetModel === 'gemini-3.8-flash') {
      modelsToTry.push('gemini-3.1-flash-lite');
    }
  }

  let lastError: any = null;
  for (const modelToAttempt of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelToAttempt,
          contents,
          config,
        });

        const generatedText = response.text || '';

        // Extract search grounding metadata if available
        const groundingSources: GroundingSource[] = [];
        const searchQueries: string[] = [];

        const candidate = response.candidates?.[0];
        if (candidate?.groundingMetadata) {
          const meta = candidate.groundingMetadata;
          if (meta.webSearchQueries && Array.isArray(meta.webSearchQueries)) {
            searchQueries.push(...meta.webSearchQueries);
          }
          if (meta.groundingChunks && Array.isArray(meta.groundingChunks)) {
            for (const chunk of meta.groundingChunks) {
              if (chunk.web?.uri) {
                groundingSources.push({
                  title: chunk.web.title || chunk.web.uri,
                  url: chunk.web.uri,
                });
              }
            }
          }
        }

        return {
          text: generatedText,
          persona: options.persona,
          modelUsed: modelToAttempt,
          groundingSources:
            groundingSources.length > 0 ? groundingSources : undefined,
          searchQueries: searchQueries.length > 0 ? searchQueries : undefined,
        };
      } catch (err: any) {
        lastError = err;
        console.warn(
          `Attempt ${attempt} on ${modelToAttempt} failed:`,
          err?.message || err
        );
        // Wait briefly before retry if 503
        await sleep(800 * attempt);
      }
    }
  }

  throw new Error(
    lastError?.message ||
      'AI model is currently experiencing high demand. Please try again in a few moments.'
  );
}
