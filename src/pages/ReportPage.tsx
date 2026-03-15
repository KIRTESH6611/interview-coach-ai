import { useMemo, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { BarChart2, TrendingUp, Camera, ThumbsUp, Lightbulb, Award, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import NavBar from '../components/NavBar';
import { useSession } from '../context/SessionContext';

function gradeInfo(score: number) {
  if (score >= 8) return { label: 'Excellent', color: 'mint', border: 'border-mint/30', bg: 'bg-mint/10', text: 'text-mint' };
  if (score >= 6) return { label: 'Good', color: 'brand', border: 'border-brand/30', bg: 'bg-brand/10', text: 'text-brand' };
  if (score >= 4) return { label: 'Average', color: 'gold', border: 'border-gold/30', bg: 'bg-gold/10', text: 'text-gold' };
  return { label: 'Needs Work', color: 'rose', border: 'border-rose/30', bg: 'bg-rose/10', text: 'text-rose' };
}

function barColor(score: number) {
  if (score >= 8) return 'bg-mint';
  if (score >= 5) return 'bg-brand';
  return 'bg-rose';
}

function statColor(score: number) {
  if (score >= 8) return 'text-mint';
  if (score >= 5) return 'text-brand';
  return 'text-gold';
}

export default function ReportPage() {
  const navigate = useNavigate();
  const { session, updateSession, resetSession } = useSession();
  const { answers, questions, role, company, experienceLevel, cameraUsed, finalScore } = session;

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const presenceScores = useMemo(() => ({
    eyeContact: Math.floor(Math.random() * 4) + 6,
    posture: Math.floor(Math.random() * 4) + 6,
    confidence: Math.floor(Math.random() * 4) + 6,
  }), []);

  if (answers.length === 0) return <Navigate to="/" replace />;

  const scores = answers.map(a => a.evaluation.score);
  const avg = finalScore ?? (scores.reduce((a, b) => a + b, 0) / scores.length);
  const best = Math.max(...scores);
  const worst = Math.min(...scores);
  const grade = gradeInfo(avg);

  const topStrengths = [...new Set(answers.flatMap(a => a.evaluation.strengths))].slice(0, 4);
  const topImprovements = [...new Set(answers.flatMap(a => a.evaluation.improvements))].slice(0, 4);

  return (
    <div className="min-h-screen bg-ink-base dot-grid pb-16">
      <NavBar rightContent={
        <div className="flex items-center gap-2 font-mono text-xs text-ink-muted">
          <BarChart2 className="w-3.5 h-3.5" />
          Performance Report
        </div>
      } />

      <div className="max-w-[680px] mx-auto px-4 space-y-5">
        {/* Hero Score */}
        <div className={`text-center p-8 rounded-2xl border ${grade.border} ${grade.bg} animate-fadeUp`}>
          <p className="font-mono text-xs text-ink-muted tracking-wider mb-2">OVERALL PERFORMANCE</p>
          <div className="mb-4">
            <span className="font-display text-7xl text-off-white">{avg.toFixed(1)}</span>
            <span className="text-ink-muted font-mono text-sm">/10</span>
          </div>
          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium ${grade.border} ${grade.bg} ${grade.text}`}>
            <Award className="w-[13px] h-[13px]" />
            {grade.label}
          </span>
          <p className="font-mono text-xs text-ink-muted mt-3">
            {role}{company ? ' · ' + company : ''} · {experienceLevel} · {questions.length} questions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 animate-fadeUp" style={{ animationDelay: '100ms' }}>
          {[
            { label: 'Best Answer', value: best },
            { label: 'Average Score', value: Number(avg.toFixed(1)) },
            { label: 'Lowest Score', value: worst },
          ].map(s => (
            <div key={s.label} className="bg-ink-card border border-ink-border rounded-2xl p-4 text-center">
              <p className="font-mono text-xs text-ink-muted">{s.label}</p>
              <p className={`font-display text-3xl ${statColor(s.value)}`}>{s.value}</p>
              <p className="font-mono text-xs text-ink-muted">/10</p>
            </div>
          ))}
        </div>

        {/* Score Timeline */}
        <div className="bg-ink-card border border-ink-border rounded-2xl p-6 animate-fadeUp" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-[13px] h-[13px] text-brand" />
            <span className="font-mono text-xs text-ink-muted">SCORE BY QUESTION</span>
          </div>
          <div className="flex items-end gap-2 h-[100px]">
            {scores.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="font-mono text-xs text-ink-muted">{s}</span>
                <div
                  className={`w-full rounded-t-sm ${barColor(s)} animate-barGrow`}
                  style={{
                    '--bar-h': `${Math.max(s / 10 * 100, 8)}%`,
                    height: `${Math.max(s / 10 * 100, 8)}%`,
                    animationDelay: `${i * 100}ms`,
                  } as React.CSSProperties}
                />
                <span className="font-mono text-xs text-ink-muted">Q{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Camera Presence */}
        {cameraUsed && (
          <div className="bg-ink-card border border-brand/20 bg-brand/5 rounded-2xl p-6 animate-fadeUp">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-[13px] h-[13px] text-brand" />
              <span className="font-mono text-xs text-brand">PRESENCE ANALYSIS</span>
            </div>
            {Object.entries(presenceScores).map(([key, val]) => (
              <div key={key} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-off-white/80 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="font-mono text-ink-muted">{val}/10</span>
                </div>
                <div className="h-1.5 bg-ink-border rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full transition-all duration-700" style={{ width: `${val * 10}%` }} />
                </div>
              </div>
            ))}
            <p className="font-mono text-xs text-ink-muted/50 mt-3">
              * Simulated for demo — future builds use computer vision
            </p>
          </div>
        )}

        {/* Top Strengths */}
        {topStrengths.length > 0 && (
          <div className="border border-mint/20 bg-mint/5 rounded-2xl p-5 animate-fadeUp">
            <div className="flex items-center gap-2 mb-3">
              <ThumbsUp className="w-[13px] h-[13px] text-mint" />
              <span className="font-mono text-xs text-mint">TOP STRENGTHS</span>
            </div>
            <ul className="space-y-2">
              {topStrengths.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-off-white/80">
                  <CheckCircle2 className="w-4 h-4 text-mint flex-shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Key Improvements */}
        {topImprovements.length > 0 && (
          <div className="border border-gold/20 bg-gold/5 rounded-2xl p-5 animate-fadeUp">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-[13px] h-[13px] text-gold" />
              <span className="font-mono text-xs text-gold">KEY IMPROVEMENTS</span>
            </div>
            <ul className="space-y-2">
              {topImprovements.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-off-white/80">
                  <span className="text-gold">→</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Question Breakdown */}
        <div className="animate-fadeUp">
          <p className="font-mono text-xs text-ink-muted tracking-wider mb-3">QUESTION BREAKDOWN</p>
          <div className="space-y-2">
            {answers.map((a, i) => (
              <div key={i} className="bg-ink-card border border-ink-border rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <span className={`font-mono text-xl font-medium w-8 ${scores[i] >= 8 ? 'text-mint' : scores[i] >= 5 ? 'text-brand' : 'text-rose'}`}>
                    {scores[i]}
                  </span>
                  <span className="text-sm text-off-white/80 flex-1 truncate">{questions[i]}</span>
                  {openIdx === i ? <ChevronUp className="w-[13px] h-[13px] text-ink-muted" /> : <ChevronDown className="w-[13px] h-[13px] text-ink-muted" />}
                </button>
                {openIdx === i && (
                  <div className="border-t border-ink-border mx-4 pt-4 pb-4 animate-fadeUp space-y-3">
                    <div>
                      <p className="text-sm text-off-white/70 italic">"{a.text}"</p>
                    </div>
                    <div>
                      <p className="font-mono text-xs text-mint mb-1">STRENGTHS</p>
                      {a.evaluation.strengths.map((s, j) => (
                        <p key={j} className="text-xs text-off-white/70 ml-3">• {s}</p>
                      ))}
                    </div>
                    <div>
                      <p className="font-mono text-xs text-gold mb-1">IMPROVE</p>
                      {a.evaluation.improvements.map((s, j) => (
                        <p key={j} className="text-xs text-off-white/70 ml-3">→ {s}</p>
                      ))}
                    </div>
                    <p className="text-xs text-off-white/60 leading-relaxed">{a.evaluation.overall_feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex gap-3 animate-fadeUp">
          <button
            onClick={() => {
              updateSession({ answers: [], questions: [], finalScore: null });
              navigate('/');
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-brand hover:bg-brand-dim text-white rounded-xl py-3 px-6 font-medium transition-all duration-300 shadow-[0_0_20px_rgba(91,127,255,0.2)]"
          >
            ↺ Practice Again
          </button>
          <button
            onClick={() => { resetSession(); navigate('/'); }}
            className="flex-1 flex items-center justify-center gap-2 border border-ink-border hover:border-brand/40 hover:bg-brand/5 text-ink-muted hover:text-white rounded-xl py-3 px-6 font-medium transition-all duration-300"
          >
            Change Role
          </button>
        </div>
      </div>
    </div>
  );
}
