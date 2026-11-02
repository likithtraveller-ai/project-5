export type PersonaType =
  | 'TEACHER'
  | 'MARKETER'
  | 'DEVELOPER'
  | 'RECRUITER'
  | 'CONSULTANT';

export type ToneType = 'friendly' | 'professional' | 'concise';

export type ResponseLengthType = 'short' | 'detailed';

export type ModelType =
  | 'gemini-3.8-flash'
  | 'gemini-3.1-flash-lite'
  | 'gemini-4-argon';

export interface PersonaMetadata {
  id: PersonaType;
  name: string;
  tagline: string;
  description: string;
  toneDescription: string;
  iconName: string;
  badge: string;
  samplePrompts: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  persona: PersonaType;
  timestamp: number;
  modelUsed?: string;
  groundingSources?: { title: string; url: string }[];
  searchQueries?: string[];
}

export interface SessionData {
  id: string;
  userId: string;
  title: string;
  persona: PersonaType;
  tone: ToneType;
  length: ResponseLengthType;
  model: ModelType;
  searchGrounding: boolean;
  thinkingMode: boolean;
  messages: ChatMessage[];
  createdAt: any;
  updatedAt: any;
}

export const PERSONAS: Record<PersonaType, PersonaMetadata> = {
  TEACHER: {
    id: 'TEACHER',
    name: 'Teacher',
    tagline: 'Patient, Step-by-Step Educational Guide',
    description:
      'Explains difficult concepts with clear simplicity, intuitive analogies, and guided steps.',
    toneDescription: 'Friendly, patient, and educational',
    iconName: 'GraduationCap',
    badge: 'Education',
    samplePrompts: [
      'Explain quantum computing to a 10-year-old using everyday analogies',
      'Walk me step-by-step through how neural networks learn',
      'Explain compound interest and why starting early matters so much',
      'How does CRISPR gene editing work? Break it down simply',
    ],
  },
  MARKETER: {
    id: 'MARKETER',
    name: 'Marketer',
    tagline: 'Creative & Persuasive Growth Strategist',
    description:
      'Crafts high-converting campaign plans, audience narratives, brand positioning, and compelling copy.',
    toneDescription: 'Creative, persuasive, and audience-focused',
    iconName: 'Megaphone',
    badge: 'Growth & Brand',
    samplePrompts: [
      'Write 3 high-converting email subject lines and launch copy for a productivity app',
      'Create a 30-day organic TikTok content strategy for a B2B SaaS startup',
      'Develop 3 distinct value propositions for an eco-friendly athletic wear brand',
      'How should we reposition a declining legacy subscription service to Gen-Z?',
    ],
  },
  DEVELOPER: {
    id: 'DEVELOPER',
    name: 'Developer',
    tagline: 'Technical, Logical & Precise Engineer',
    description:
      'Solves architecture challenges, debugs errors, writes production-grade code, and explains internals.',
    toneDescription: 'Technical, logical, and precise',
    iconName: 'Code2',
    badge: 'Software Engineering',
    samplePrompts: [
      'Design a resilient RESTful API with idempotency keys and rate limiting',
      'Why does React re-render twice in Strict Mode and how does useEffect cleanup work?',
      'Write a TypeScript function to debounce asynchronous API calls with cancellation',
      'Compare PostgreSQL vs DynamoDB for high-throughput IoT time-series events',
    ],
  },
  RECRUITER: {
    id: 'RECRUITER',
    name: 'Recruiter',
    tagline: 'Strategic Talent & Executive Career Coach',
    description:
      'Polishes resumes into quantifiable impact statements, conducts mock interviews, and guides negotiations.',
    toneDescription: 'Professional, supportive, and career-focused',
    iconName: 'UserCheck',
    badge: 'Career & Hiring',
    samplePrompts: [
      'Rewrite these engineering bullets into impact-driven Google XYZ / STAR format',
      'Run a mock behavioral interview for a Senior Engineering Manager role',
      'How should I counter-offer an equity compensation package diplomatically?',
      'Write an inclusive, punchy job description for a Lead Product Designer',
    ],
  },
  CONSULTANT: {
    id: 'CONSULTANT',
    name: 'Consultant',
    tagline: 'Structured Management & Strategy Advisor',
    description:
      'Structures ambiguous business problems, performs tradeoff analyses, and recommends actionable roadmaps.',
    toneDescription: 'Analytical, structured, and solution-oriented',
    iconName: 'Briefcase',
    badge: 'Business Strategy',
    samplePrompts: [
      'Conduct a structured SWOT & Porter’s Five Forces analysis for entering the EV charging space',
      'Evaluate Build vs Buy vs Partner for internal LLM inference infrastructure',
      'Develop a 90-day turnaround strategy for a SaaS company suffering from 40% churn',
      'Structure an executive presentation on optimizing operating expenditure by 15%',
    ],
  },
};
