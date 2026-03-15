import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Evaluation } from '../api';

export interface AnswerEntry {
  text: string;
  evaluation: Evaluation;
}

export interface SessionState {
  role: string;
  company: string;
  experienceLevel: string;
  numQuestions: number;
  skills: string[];
  resumeSummary: string;
  questions: string[];
  answers: AnswerEntry[];
  finalScore: number | null;
  cameraUsed: boolean;
  voiceUsed: boolean;
}

const defaultState: SessionState = {
  role: '',
  company: '',
  experienceLevel: 'mid',
  numQuestions: 5,
  skills: [],
  resumeSummary: '',
  questions: [],
  answers: [],
  finalScore: null,
  cameraUsed: false,
  voiceUsed: false,
};

const STORAGE_KEY = 'interviewai_session';

function loadSession(): SessionState {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return { ...defaultState, ...JSON.parse(saved) };
  } catch {}
  return defaultState;
}

interface SessionContextType {
  session: SessionState;
  updateSession: (patch: Partial<SessionState>) => void;
  resetSession: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionState>(loadSession);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const updateSession = useCallback((patch: Partial<SessionState>) => {
    setSession(prev => ({ ...prev, ...patch }));
  }, []);

  const resetSession = useCallback(() => {
    setSession(defaultState);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <SessionContext.Provider value={{ session, updateSession, resetSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
