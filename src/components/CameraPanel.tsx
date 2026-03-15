import { Camera, Video } from 'lucide-react';
import { useCameraFeed } from '../hooks/useCameraFeed';
import { useEffect } from 'react';
import { useSession } from '../context/SessionContext';

interface CameraPanelProps {
  micActive?: boolean;
}

export default function CameraPanel({ micActive = false }: CameraPanelProps) {
  const { videoRef, status, start, stop } = useCameraFeed();
  const { updateSession } = useSession();

  useEffect(() => {
    if (status === 'active') updateSession({ cameraUsed: true });
  }, [status, updateSession]);

  useEffect(() => () => { stop(); }, []);

  if (status === 'idle' || status === 'requesting') {
    return (
      <div className="bg-ink-card border border-ink-border rounded-2xl p-6 text-center">
        <Camera className="w-8 h-8 text-ink-muted mx-auto mb-3" />
        <h3 className="font-display text-lg text-off-white mb-2">Enable camera</h3>
        <p className="text-sm text-ink-muted mb-4">
          See yourself like a real interview — spot nervous habits, check your posture and eye contact.
        </p>
        <button
          onClick={start}
          disabled={status === 'requesting'}
          className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dim text-white rounded-xl py-3 px-6 font-medium transition-all duration-300 shadow-[0_0_20px_rgba(91,127,255,0.2)] disabled:opacity-40"
        >
          <Video className="w-4 h-4" />
          {status === 'requesting' ? 'Requesting…' : 'Turn on camera'}
        </button>
        <button onClick={() => {}} className="text-xs text-ink-muted underline cursor-pointer mt-2 block mx-auto">
          Skip for now
        </button>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="bg-ink-card border border-rose/30 rounded-2xl p-6 text-center">
        <Camera className="w-8 h-8 text-rose mx-auto mb-3" />
        <h3 className="font-display text-lg text-off-white mb-2">Camera denied</h3>
        <p className="text-sm text-ink-muted">
          Please allow camera access in your browser settings and reload.
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-ink-card border border-rose/30 rounded-2xl p-6 text-center">
        <Camera className="w-8 h-8 text-rose mx-auto mb-3" />
        <h3 className="font-display text-lg text-off-white mb-2">Camera error</h3>
        <p className="text-sm text-ink-muted">Could not access camera. Check your device.</p>
      </div>
    );
  }

  // Active
  return (
    <div className={`bg-ink-card border rounded-2xl overflow-hidden transition-all duration-300 ${micActive ? 'border-mint/50 shadow-[0_0_15px_rgba(40,201,154,0.15)]' : 'border-ink-border'}`}>
      <div className="relative">
        <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video object-cover bg-ink-base -scale-x-100" />
        {/* Recording dot */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${micActive ? 'bg-rose animate-glowPulse' : 'bg-mint'}`} />
          <span className="font-mono text-[10px] text-off-white/70">{micActive ? 'REC' : 'LIVE'}</span>
        </div>
        {/* Stop button */}
        <button
          onClick={stop}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-ink-base/60 border border-ink-border/50 text-ink-muted hover:text-off-white transition-colors"
        >
          <Camera className="w-3 h-3" />
        </button>
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <span className="font-mono text-[10px] text-ink-muted">CAMERA ACTIVE</span>
        {micActive && <span className="font-mono text-[10px] text-mint">● MIC ON</span>}
      </div>
    </div>
  );
}
