import { useThrottleCallback } from '@react-hook/throttle';
import { DependencyList, Dispatch, SetStateAction, useEffect, useState } from 'react';


type setState<T> = Dispatch<SetStateAction<T>>
type ActionResHandler<T> = (res: ActionRes<T>) => void
type Manager<T> = (fetcher: () => Promise<ActionRes<T>>) => Promise<boolean>

type Data<T> = {
  manager: Manager<T>
  setData: setState<T | null>
  setLoading: setState<boolean>
  setError: setState<string | null>
  actionResHandler: ActionResHandler<T>
}

export default function useFetch<T>(
  fn: (dt: Data<T>) => Promise<any>,
  dependencyList?: DependencyList
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const throttledFn = useThrottleCallback((dt: Data<T>) => {
    fn(dt)
  })

  const actionResHandler: ActionResHandler<T> = (res: ActionRes<T>) => {
    if (res.success) {
      setData(res.success)
    } else {
      setError(res.error as string)
    }
  }

  const manager: Manager<T> = async (fetcher) => {
    setLoading(true)
    try {
      const res = await fetcher()
      actionResHandler(res)
    } catch (error) {
      setError('Algo ha salido mal')
    }
    setLoading(false)
    return true
  }

  useEffect(() => {
    throttledFn({ manager, setData, setLoading, setError, actionResHandler })
  }, dependencyList || [])

  return {
    data, setData,
    isLoading, setLoading,
    error, setError
  }
}