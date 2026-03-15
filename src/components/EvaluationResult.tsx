import { ThumbsUp, Lightbulb } from 'lucide-react';
import ScoreBar from './ScoreBar';
import type { Evaluation } from '../api';

interface EvaluationResultProps {
  evaluation: Evaluation;
  answerText: string;
  isLast: boolean;
  onNext: () => void;
  onFinish: () => void;
}

function scoreColor(score: number) {
  if (score >= 8) return { border: 'border-mint/30', bg: 'bg-mint/10', text: 'text-mint' };
  if (score >= 5) return { border: 'border-brand/30', bg: 'bg-brand/10', text: 'text-brand' };
  return { border: 'border-rose/30', bg: 'bg-rose/10', text: 'text-rose' };
}

export default function EvaluationResult({ evaluation, answerText, isLast, onNext, onFinish }: EvaluationResultProps) {
  const colors = scoreColor(evaluation.score);

  return (
    <div className="space-y-4 animate-fadeUp">
      {/* Score Banner */}
      <div className={`flex justify-between items-center p-5 rounded-2xl border ${colors.border} ${colors.bg}`}>
        <div>
          <p className="font-mono text-xs text-ink-muted mb-1">ANSWER SCORE</p>
          <span className={`font-display text-5xl ${colors.text}`}>{evaluation.score}</span>
          <span className="text-ink-muted text-sm">/10</span>
        </div>
        <ScoreBar score={evaluation.score} className="w-36" />
      </div>

      {/* Your Answer */}
      <div className="bg-ink-card border border-ink-border rounded-2xl p-5">
        <p className="font-mono text-xs text-ink-muted mb-2">YOUR ANSWER</p>
        <p className="text-sm text-off-white/75 leading-relaxed italic">"{answerText}"</p>
      </div>

      {/* Strengths */}
      {evaluation.strengths.length > 0 && (
        <div className="border border-mint/20 bg-mint/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ThumbsUp className="w-[13px] h-[13px] text-mint" />
            <span className="font-mono text-xs text-mint">STRENGTHS</span>
          </div>
          <ul className="space-y-2">
            {evaluation.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-off-white/80">
                <span className="w-1.5 h-1.5 rounded-full bg-mint mt-2 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {evaluation.improvements.length > 0 && (
        <div className="border border-gold/20 bg-gold/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-[13px] h-[13px] text-gold" />
            <span className="font-mono text-xs text-gold">IMPROVE</span>
          </div>
          <ul className="space-y-2">
            {evaluation.improvements.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-off-white/80">
                <span className="text-gold">→</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Coach */}
      <div className="bg-ink-card border border-ink-border rounded-2xl p-5">
        <p className="font-mono text-xs text-ink-muted mb-2">AI COACH</p>
        <p className="text-sm text-off-white/80 leading-relaxed">{evaluation.overall_feedback}</p>
      </div>

      {/* Next / Finish Button */}
      <button
        onClick={isLast ? onFinish : onNext}
        className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dim text-white rounded-xl py-3 px-6 font-medium transition-all duration-300 shadow-[0_0_20px_rgba(91,127,255,0.2)]"
      >
        {isLast ? '📊 View Full Report' : 'Next Question →'}
      </button>
    </div>
  );
}
