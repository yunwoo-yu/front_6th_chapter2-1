import { useCallback, useRef } from 'react';

interface SaleSchedulerConfig {
  maxDelay: number;
  interval: number;
  onExecute: () => boolean;
}

/**
 * 개별 세일 스케줄러를 관리하는 훅
 */
export const useSaleScheduler = () => {
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const startScheduler = useCallback((config: SaleSchedulerConfig) => {
    // 이미 실행 중이면 중단
    if (intervalRef.current) {
      return () => {}; // no-op cleanup
    }

    const delay = Math.random() * config.maxDelay;

    timeoutRef.current = window.setTimeout(() => {
      // 인터벌이 이미 설정되어 있으면 중단
      if (intervalRef.current) {
        return;
      }

      intervalRef.current = window.setInterval(() => {
        const success = config.onExecute();

        // 실행 실패 시 인터벌 중지 (선택적)
        if (!success) {
          // 현재는 베이직과 동일하게 계속 실행
        }
      }, config.interval);
    }, delay);

    // cleanup 함수 반환
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const stopScheduler = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const isRunning = useCallback(() => {
    return intervalRef.current !== null;
  }, []);

  return {
    startScheduler,
    stopScheduler,
    isRunning,
  };
};
