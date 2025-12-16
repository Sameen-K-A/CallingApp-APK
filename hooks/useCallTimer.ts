import { useCallback, useEffect, useRef, useState } from "react";

interface UseCallTimerReturn {
  seconds: number;
  formatted: string;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useCallTimer(): UseCallTimerReturn {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRunningRef = useRef(false);

  const formatTime = useCallback((totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const start = useCallback(() => {
    if (isRunningRef.current) return;

    isRunningRef.current = true;
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isRunningRef.current = false;
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setSeconds(0);
  }, [stop]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    seconds,
    formatted: formatTime(seconds),
    isRunning,
    start,
    stop,
    reset,
  };
}