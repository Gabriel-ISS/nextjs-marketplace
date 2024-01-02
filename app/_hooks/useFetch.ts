import useLoadState from '@/_hooks/useLoadState';
import { UpdateState } from '@/_hooks/useWritableState';
import { useEffect } from 'react';


interface Config<T = any> {
  fetcher: () => Promise<T>
  message?: string
  condition?: () => boolean
  then?: (data: T, setData: UpdateState<T | null>) => void
  dependencyList?: any[]
}

export default function useFetch<T>({
  fetcher,
  message,
  condition,
  then,
  dependencyList
}: Config<T>) {
  const [data, setData, loading, setLoading] = useLoadState<T | null>(null)

  useEffect(() => {
    if (condition === undefined ? true : condition()) {
      setLoading(true)
      fetcher()
        .then(data => {
          then ? then(data, setData) : setData(() => data)
        })
        .catch(error => {
          alert(message || 'Error al obtener datos')
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, dependencyList || [])

  return [data, setData, loading, setLoading] as const
}