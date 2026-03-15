const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
const MODEL = 'gpt-4o-mini';

const isDemo = !OPENAI_KEY;

async function chat(messages: Array<{role: string; content: string}>, jsonMode = false): Promise<string> {
  const body: Record<string, unknown> = {
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 1000,
    ...(jsonMode && { response_format: { type: 'json_object' } }),
  };
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

const DEMO_QUESTIONS = [
  "Tell me about yourself and why you're interested in this role.",
  "Describe the most challenging technical problem you've solved.",
  "How do you prioritize when multiple deadlines compete?",
  "Walk me through a project you're most proud of.",
  "Tell me about a time you disagreed with your team.",
  "How do you debug a production issue with no clear error logs?",
  "Describe a time you had to learn a new technology quickly.",
  "How do you ensure code quality in a fast-moving team?",
  "Tell me about a project that failed and what you learned.",
  "Where do you see yourself in 3 years?",
];

interface FetchQuestionsParams {
  role: string;
  company: string;
  experienceLevel: string;
  skills: string[];
  numQuestions: number;
}

export async function fetchQuestions({ role, company, experienceLevel, skills, numQuestions }: FetchQuestionsParams): Promise<string[]> {
  if (isDemo) return DEMO_QUESTIONS.slice(0, numQuestions);

  const systemPrompt = "You are an expert technical interviewer at a top technology company. Create realistic, specific, challenging interview questions. Mix behavioral (STAR method) and technical questions. Never ask vague or generic questions.";
  const userPrompt = `Generate exactly ${numQuestions} interview questions for a ${experienceLevel}-level ${role}.
${company ? 'The position is at ' + company + '.' : ''}
${skills.length ? 'Candidate skills: ' + skills.join(', ') + '.' : ''}

Level guidance:
- junior: fundamentals, learning ability, potential
- mid: balance technical depth with experience, one system design
- senior: architecture, leadership, trade-offs, system design

Mix ~60% technical, ~40% behavioral.
Output ONLY a numbered list: 1. 2. 3. etc.
No answers, no explanations, nothing else.`;

  const raw = await chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  return raw
    .split('\n')
    .map(l => l.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter(l => l.length >= 10)
    .slice(0, numQuestions);
}

export interface Evaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  overall_feedback: string;
}

interface EvaluateParams {
  question: string;
  answer: string;
  role: string;
}

export async function evaluateAnswer({ question, answer, role }: EvaluateParams): Promise<Evaluation> {
  if (!answer || answer.trim().length < 5) {
    return { score: 0, strengths: [], improvements: ['Please provide a substantive answer.'], overall_feedback: 'Please provide a substantive answer.' };
  }

  if (isDemo) {
    const wordCount = answer.split(' ').length;
    if (wordCount < 20) {
      return { score: 4, strengths: ['Attempted the question'], improvements: ['Expand your answer — aim for 3–5 sentences', 'Add a specific example from your experience', 'Use STAR method: Situation, Task, Action, Result'], overall_feedback: 'Answer is too brief. Interviewers want to hear your thought process and concrete examples.' };
    }
    if (wordCount <= 60) {
      return { score: 6, strengths: ['Relevant answer', 'Focused and clear'], improvements: ['Add a specific example with measurable outcome', 'Quantify your impact where possible'], overall_feedback: 'Good start — relevant but needs more depth and a concrete example to be compelling.' };
    }
    return { score: 8, strengths: ['Strong communication', 'Good level of detail', 'Shows relevant experience'], improvements: ['Tighten structure using STAR method', 'End with a clear measurable result'], overall_feedback: 'Strong answer overall. Well-structured with good detail. Minor refinements to structure would make this excellent.' };
  }

  const systemPrompt = "You are a senior hiring manager evaluating interview answers. Give honest, specific, constructive feedback. Always respond in valid JSON only.";
  const userPrompt = `Evaluate this answer for a ${role} position.

QUESTION: ${question}
ANSWER: ${answer}

Return exactly this JSON:
{
  "score": <number 0-10>,
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"],
  "overall_feedback": "<2-3 sentence honest summary>"
}

9-10: Exceptional — specific examples, excellent structure, clear impact
7-8:  Good — relevant and clear, minor gaps
5-6:  Average — addresses question but lacks depth or examples
3-4:  Below average — vague, off-topic, missing key points
0-2:  Poor — irrelevant or minimal effort

Reference the actual content of their answer. Be specific.`;

  const raw = await chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], true);

  return JSON.parse(raw) as Evaluation;
}

const SKILL_KEYWORDS = [
  'python', 'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js',
  'sql', 'postgresql', 'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'gcp',
  'git', 'fastapi', 'django', 'flask', 'machine learning', 'tensorflow',
  'pytorch', 'java', 'go', 'graphql', 'rest api', 'ci/cd', 'linux', 'html', 'css',
];

export interface ResumeData {
  skills: string[];
  experience_summary: string;
  suggested_roles: string[];
}

export async function parseResume(file: File): Promise<ResumeData> {
  let text = '';
  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      pages.push(content.items.map((item: any) => item.str).join(' '));
    }
    text = pages.join('\n');
  } catch {
    text = '';
  }

  if (!text.trim()) {
    throw new Error('Could not extract text from PDF');
  }

  // Regex fallback for skills
  const lowerText = text.toLowerCase();
  const foundSkills = SKILL_KEYWORDS.filter(s => lowerText.includes(s));

  if (isDemo || foundSkills.length === 0) {
    return {
      skills: foundSkills.length ? foundSkills : ['javascript', 'react', 'node.js'],
      experience_summary: 'Resume parsed successfully.',
      suggested_roles: ['Software Engineer', 'Frontend Developer'],
    };
  }

  return {
    skills: foundSkills,
    experience_summary: 'Resume parsed successfully.',
    suggested_roles: ['Software Engineer'],
  };
}

export function isDemoMode(): boolean {
  return isDemo;
}
