import useWritableState from '@/_hooks/useWritableState';
import { useState } from 'react';

export default function useLoadState<T>(defaultValue: T) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useWritableState<T>(defaultValue)

  return [data, setData, loading, setLoading] as const
}