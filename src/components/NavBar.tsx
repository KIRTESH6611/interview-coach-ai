import { Cpu } from 'lucide-react';
import { isDemoMode } from '../api';

interface NavBarProps {
  rightContent?: React.ReactNode;
}

export default function NavBar({ rightContent }: NavBarProps) {
  return (
    <nav className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2">
        <Cpu className="w-4 h-4 text-brand" />
        <span className="font-mono text-sm tracking-widest text-brand">INTERVIEWAI</span>
      </div>
      <div className="flex items-center gap-2">
        {rightContent}
        {isDemoMode() && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-mint animate-glowPulse" />
            <span className="font-mono text-xs text-ink-muted">Demo mode ready</span>
          </div>
        )}
      </div>
    </nav>
  );
}
