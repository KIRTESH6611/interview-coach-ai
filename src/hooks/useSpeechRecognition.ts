import { useState, useRef, useCallback, useEffect } from 'react';

interface SpeechRecognitionHook {
  listening: boolean;
  supported: boolean;
  start: () => void;
  stop: () => void;
}

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export function useSpeechRecognition(
  onFinalTranscript: (text: string) => void,
  onInterimTranscript: (text: string) => void,
): SpeechRecognitionHook {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const supported = !!SpeechRecognitionAPI;

  const start = useCallback(() => {
    if (!SpeechRecognitionAPI) return;
    const rec = new SpeechRecognitionAPI();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event: any) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += transcript + ' ';
        else interimText += transcript;
      }
      if (finalText) onFinalTranscript(finalText);
      onInterimTranscript(interimText);
    };

    rec.onerror = (e: any) => {
      if (e.error !== 'aborted') console.error('Speech error:', e.error);
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      onInterimTranscript('');
    };

    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }, [onFinalTranscript, onInterimTranscript]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
    onInterimTranscript('');
  }, [onInterimTranscript]);

  useEffect(() => () => { recognitionRef.current?.stop(); }, []);

  return { listening, supported, start, stop };
}
