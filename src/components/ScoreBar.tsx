interface ScoreBarProps {
  score: number;
  className?: string;
}

function scoreColor(score: number) {
  if (score >= 8) return 'bg-mint';
  if (score >= 5) return 'bg-brand';
  return 'bg-rose';
}

export default function ScoreBar({ score, className = '' }: ScoreBarProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="h-2 bg-ink-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${scoreColor(score)}`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <p className="font-mono text-xs text-ink-muted text-right mt-1">{score}/10</p>
    </div>
  );
}
