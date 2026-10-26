import { useState, useEffect, useCallback } from 'react';

export interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  totalSecondsRemaining: number;
  isExpired: boolean;
  formatted: string;
  progressPercent: number;
}

/**
 * Calculates a live 24-hour (or custom lifespan) countdown from a post's creation timestamp.
 */
export function useCountdown(isoTimestamp: string, lifespanHours: number = 24): CountdownResult {
  const calculate = useCallback((): CountdownResult => {
    const postTime = new Date(isoTimestamp).getTime();
    const lifespanMs = lifespanHours * 60 * 60 * 1000;
    const expiryTime = postTime + lifespanMs;
    const now = Date.now();
    const diff = Math.max(0, expiryTime - now);
    const totalSecondsRemaining = Math.floor(diff / 1000);
    const isExpired = diff <= 0;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n: number) => String(n).padStart(2, '0');
    const formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    const progressPercent = Math.min(100, Math.max(0, ((lifespanMs - diff) / lifespanMs) * 100));

    return {
      hours,
      minutes,
      seconds,
      totalSecondsRemaining,
      isExpired,
      formatted,
      progressPercent,
    };
  }, [isoTimestamp, lifespanHours]);

  const [state, setState] = useState<CountdownResult>(calculate);

  useEffect(() => {
    setState(calculate());
    const interval = setInterval(() => {
      setState(calculate());
    }, 1000);
    return () => clearInterval(interval);
  }, [calculate]);

  return state;
}

export default useCountdown;
