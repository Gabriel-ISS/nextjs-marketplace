import { Draft, produce } from "immer";
import { useState } from "react";


export type Produce<T> = (draft: Draft<T>) => void
export type StateUpdater<T> = (updater: Produce<T>) => void

export default function useWritableState<T>(defaultState: T) {
  const [state, setState] = useState(defaultState)

  function updateState(updater: Produce<T>) {
    setState(produce(updater))
  }

  return [state, updateState, setState] as const
}