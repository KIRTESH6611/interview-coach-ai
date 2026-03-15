import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building2, FileText, CheckCircle2, X, ArrowRight, AlertCircle } from 'lucide-react';
import NavBar from '../components/NavBar';
import SkillTag from '../components/SkillTag';
import { useSession } from '../context/SessionContext';
import { fetchQuestions, parseResume } from '../api';

const ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Scientist', 'ML Engineer',
  'Product Manager', 'DevOps Engineer', 'UX Designer', 'Data Analyst',
];

const LEVELS = [
  { key: 'junior', label: 'Junior', range: '0–2 yrs' },
  { key: 'mid', label: 'Mid', range: '2–5 yrs' },
  { key: 'senior', label: 'Senior', range: '5+ yrs' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { session, updateSession } = useSession();
  const [role, setRole] = useState(session.role);
  const [company, setCompany] = useState(session.company);
  const [level, setLevel] = useState(session.experienceLevel);
  const [numQ, setNumQ] = useState(session.numQuestions);
  const [skills, setSkills] = useState<string[]>(session.skills);
  const [resumeFile, setResumeFile] = useState<string>('');
  const [resumeStatus, setResumeStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResume = useCallback(async (file: File) => {
    setResumeStatus('loading');
    setResumeFile(file.name);
    try {
      const data = await parseResume(file);
      setSkills(data.skills);
      setResumeStatus('done');
    } catch {
      setResumeStatus('error');
      setSkills([]);
    }
  }, []);

  const handleStart = async () => {
    if (!role.trim()) return;
    setLoading(true);
    setError('');
    try {
      const questions = await fetchQuestions({
        role, company, experienceLevel: level, skills, numQuestions: numQ,
      });
      updateSession({
        role, company, experienceLevel: level, numQuestions: numQ, skills,
        questions, answers: [], finalScore: null,
      });
      navigate('/interview');
    } catch (err: any) {
      setError(err.message || 'Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-base dot-grid flex flex-col">
      <NavBar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-8 animate-fadeUp">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-glowPulse" />
            <span className="font-mono text-xs text-brand">AI-powered mock interviews</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-off-white leading-tight mb-4">
            Ace your next<br /><em>interview.</em>
          </h1>
          <p className="text-ink-muted text-lg max-w-sm mx-auto leading-relaxed">
            Personalized questions, instant AI scoring, camera mode — all in one session.
          </p>
        </div>

        {/* Setup Card */}
        <div className="max-w-[560px] w-full bg-ink-card border border-ink-border rounded-2xl p-6 animate-fadeUp" style={{ animationDelay: '100ms' }}>
          <h2 className="font-display text-xl text-off-white mb-5">Set up your interview</h2>

          {/* Role */}
          <div className="mb-4">
            <label className="font-mono text-xs text-ink-muted tracking-wider block mb-1.5">JOB ROLE *</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                list="roles"
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full bg-ink-base border border-ink-border rounded-xl py-3 pl-9 pr-4 text-sm text-off-white placeholder-ink-muted focus:outline-none focus:border-brand/50 focus:shadow-[0_0_12px_rgba(91,127,255,0.15)] transition-all"
              />
              <datalist id="roles">
                {ROLES.map(r => <option key={r} value={r} />)}
              </datalist>
            </div>
          </div>

          {/* Company */}
          <div className="mb-4">
            <label className="font-mono text-xs text-ink-muted tracking-wider block mb-1.5">
              COMPANY <span className="opacity-50">(optional)</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Google, Stripe, your startup…"
                className="w-full bg-ink-base border border-ink-border rounded-xl py-3 pl-9 pr-4 text-sm text-off-white placeholder-ink-muted focus:outline-none focus:border-brand/50 focus:shadow-[0_0_12px_rgba(91,127,255,0.15)] transition-all"
              />
            </div>
          </div>

          {/* Experience Level */}
          <div className="mb-4">
            <label className="font-mono text-xs text-ink-muted tracking-wider block mb-1.5">EXPERIENCE LEVEL</label>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map(l => (
                <button
                  key={l.key}
                  onClick={() => setLevel(l.key)}
                  className={`p-3 rounded-xl border text-left transition-all ${level === l.key ? 'border-brand bg-brand/10 text-brand' : 'border-ink-border text-ink-muted hover:border-ink-border/80'}`}
                >
                  <span className="text-sm font-medium block">{l.label}</span>
                  <span className="text-xs opacity-60 font-mono">{l.range}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Number of Questions */}
          <div className="mb-4">
            <label className="font-mono text-xs text-ink-muted tracking-wider block mb-1.5">
              QUESTIONS <span className="text-brand font-mono ml-2">{numQ}</span>
            </label>
            <input
              type="range"
              min={3} max={10} step={1}
              value={numQ}
              onChange={e => setNumQ(Number(e.target.value))}
              className="w-full accent-brand"
            />
            <div className="flex justify-between font-mono text-xs text-ink-muted mt-1">
              <span>3 quick</span>
              <span>10 thorough</span>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="mb-5">
            <label className="font-mono text-xs text-ink-muted tracking-wider block mb-1.5">
              RESUME <span className="opacity-50">(optional — personalized questions)</span>
            </label>

            {resumeStatus === 'idle' && (
              <label className="flex flex-col items-center gap-2 p-5 border-2 border-dashed border-ink-border rounded-xl cursor-pointer hover:border-brand/40 hover:text-brand transition-all text-ink-muted">
                <FileText className="w-5 h-5" />
                <span className="text-sm">Upload PDF resume</span>
                <span className="text-xs opacity-60">Enables personalized questions</span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleResume(e.target.files[0])}
                />
              </label>
            )}

            {resumeStatus === 'loading' && (
              <div className="flex items-center gap-3 p-4 bg-ink-card border border-ink-border rounded-xl">
                <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                <div>
                  <p className="text-sm text-off-white truncate">{resumeFile}</p>
                  <p className="text-xs text-ink-muted">Parsing resume…</p>
                </div>
              </div>
            )}

            {resumeStatus === 'done' && (
              <div>
                <div className="flex items-center gap-3 p-4 border border-mint/30 bg-mint/5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-mint flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-off-white truncate">{resumeFile}</p>
                    <p className="text-xs text-mint">{skills.length} skills extracted</p>
                  </div>
                  <button onClick={() => { setResumeStatus('idle'); setSkills([]); setResumeFile(''); }}>
                    <X className="w-4 h-4 text-ink-muted hover:text-off-white transition-colors" />
                  </button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {skills.slice(0, 8).map(s => <SkillTag key={s} skill={s} />)}
                    {skills.length > 8 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono text-ink-muted bg-ink-border/30">
                        +{skills.length - 8} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {resumeStatus === 'error' && (
              <div className="flex items-center gap-2 p-4 border border-rose/30 bg-rose/5 rounded-xl">
                <X className="w-4 h-4 text-rose flex-shrink-0" />
                <span className="text-sm text-rose">Parse failed — using role-based questions</span>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose/10 border border-rose/20 text-rose text-sm mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={!role.trim() || loading}
            className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dim text-white rounded-xl py-3 px-6 font-medium transition-all duration-300 shadow-[0_0_20px_rgba(91,127,255,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating questions…
              </>
            ) : (
              <>Start Interview <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-6 animate-fadeUp" style={{ animationDelay: '200ms' }}>
          {['🎤 Voice mode', '📷 Camera mode', '⚡ Instant scoring', '📊 Performance report'].map(f => (
            <span key={f} className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-muted border border-ink-border rounded-full px-3 py-1.5">
              <span className="w-1 h-1 rounded-full bg-brand" />
              {f}
            </span>
          ))}
        </div>
      </main>
    </div>
  );
}
