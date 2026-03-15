import { useState, useCallback, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ChevronRight, Mic, MicOff, ArrowRight, AlertCircle } from 'lucide-react';
import NavBar from '../components/NavBar';
import CameraPanel from '../components/CameraPanel';
import WaveformBars from '../components/WaveformBars';
import EvaluationResult from '../components/EvaluationResult';
import { useSession } from '../context/SessionContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { evaluateAnswer } from '../api';
import type { Evaluation } from '../api';

export default function InterviewPage() {
  const navigate = useNavigate();
  const { session, updateSession } = useSession();
  const { questions, role, company, answers } = session;

  const [currentIdx, setCurrentIdx] = useState(answers.length);
  const [confirmedText, setConfirmedText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');

  const onFinal = useCallback((text: string) => {
    setConfirmedText(prev => prev + text);
  }, []);
  const onInterim = useCallback((text: string) => {
    setInterimText(text);
  }, []);

  const { listening, supported, start: startVoice, stop: stopVoice } = useSpeechRecognition(onFinal, onInterim);

  useEffect(() => {
    if (listening) updateSession({ voiceUsed: true });
  }, [listening, updateSession]);

  if (questions.length === 0) return <Navigate to="/" replace />;

  const total = questions.length;
  const question = questions[currentIdx];
  const displayText = confirmedText + (interimText ? ' ' + interimText : '');
  const isLast = currentIdx === total - 1;

  const handleSubmit = async () => {
    const text = confirmedText.trim();
    if (!text) {
      setError('Please provide an answer first');
      return;
    }
    if (listening) stopVoice();
    setEvaluating(true);
    setError('');
    try {
      const ev = await evaluateAnswer({ question, answer: text, role });
      setEvaluation(ev);
      const newAnswers = [...answers, { text, evaluation: ev }];
      updateSession({ answers: newAnswers });
    } catch (err: any) {
      setError(err.message || 'Request timed out. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    setCurrentIdx(prev => prev + 1);
    setConfirmedText('');
    setInterimText('');
    setEvaluation(null);
    setError('');
  };

  const handleFinish = () => {
    const allAnswers = session.answers;
    const avg = allAnswers.reduce((s, a) => s + a.evaluation.score, 0) / allAnswers.length;
    updateSession({ finalScore: Math.round(avg * 10) / 10 });
    navigate('/report');
  };

  return (
    <div className="min-h-screen bg-ink-base dot-grid flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-ink-border/50 bg-ink-base/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <NavBar />
          <div className="flex items-center gap-3">
            {/* Progress pills */}
            <div className="flex items-center gap-1.5">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all ${
                    i < currentIdx ? 'w-5 h-1.5 bg-mint' :
                    i === currentIdx ? 'w-7 h-1.5 bg-brand animate-glowPulse' :
                    'w-3.5 h-1.5 bg-ink-border'
                  }`}
                />
              ))}
              <span className="font-mono text-xs text-ink-muted ml-2">Q{currentIdx + 1}/{total}</span>
            </div>
          </div>
          <span className="font-mono text-xs text-ink-muted hidden md:block">
            {role}{company ? ' · ' + company : ''}
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row gap-6">
          {/* Left - Interview panel */}
          <div className="flex-1 max-w-xl space-y-4">
            {/* Question */}
            <div key={currentIdx} className="bg-ink-card border border-ink-border rounded-2xl p-6 border-l-[3px] border-l-brand animate-fadeUp">
              <div className="flex items-center gap-1.5 font-mono text-xs text-ink-muted mb-3">
                <span>Q{currentIdx + 1}</span>
                <ChevronRight className="w-3 h-3" />
                <span>{currentIdx < Math.ceil(total * 0.6) ? 'Technical' : 'Behavioural'}</span>
              </div>
              <p className="text-lg text-off-white leading-relaxed">{question}</p>
            </div>

            {/* Answer or Evaluation */}
            {!evaluation ? (
              <div className="animate-fadeUp" style={{ animationDelay: '100ms' }}>
                {/* Textarea */}
                <div className="relative">
                  <textarea
                    value={displayText}
                    onChange={e => { if (!listening) setConfirmedText(e.target.value); }}
                    placeholder="Type your answer here, or use voice mode…"
                    rows={6}
                    className="w-full bg-ink-card border border-ink-border rounded-2xl px-5 py-4 text-sm text-off-white placeholder-ink-muted resize-none leading-relaxed focus:outline-none focus:border-brand/50 transition-all"
                  />
                  {/* Waveform */}
                  <div className="absolute bottom-4 right-4 pointer-events-none">
                    <WaveformBars active={listening} />
                  </div>
                </div>

                {/* Controls */}
                <div className="flex gap-3 mt-3">
                  {supported && (
                    <button
                      onClick={listening ? stopVoice : startVoice}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                        listening
                          ? 'border-rose/50 bg-rose/10 text-rose'
                          : 'border-ink-border text-ink-muted hover:border-brand/40 hover:text-brand'
                      }`}
                    >
                      {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      {listening ? 'Stop' : 'Voice answer'}
                    </button>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={(!confirmedText.trim() && !listening) || evaluating}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand hover:bg-brand-dim text-white rounded-xl py-3 px-6 font-medium transition-all duration-300 shadow-[0_0_20px_rgba(91,127,255,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {evaluating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Evaluating…
                      </>
                    ) : (
                      <>Submit Answer <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>

                {!supported && (
                  <p className="font-mono text-xs text-ink-muted mt-1.5">
                    Voice mode requires Chrome or Edge browser.
                  </p>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose/10 border border-rose/20 text-rose text-sm mt-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <EvaluationResult
                evaluation={evaluation}
                answerText={session.answers[currentIdx]?.text || confirmedText}
                isLast={isLast}
                onNext={handleNext}
                onFinish={handleFinish}
              />
            )}
          </div>

          {/* Right - Camera panel */}
          <div className="w-full md:w-72 flex-shrink-0 md:sticky md:top-24 h-fit">
            <CameraPanel micActive={listening} />
          </div>
        </div>
      </main>
    </div>
  );
}
