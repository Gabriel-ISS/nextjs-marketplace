import { useThrottleCallback } from '@react-hook/throttle';
import { DependencyList, useEffect } from 'react';

export default function useThrottleEffect(callback: (...args: any[]) => void, dependencyList: DependencyList, fps?: number) {
  const throttled = useThrottleCallback(callback, fps)

  useEffect(() => {
    throttled()
  }, dependencyList)
}