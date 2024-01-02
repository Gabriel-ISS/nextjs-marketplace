import filterSlice, { FilterSlice } from '@/_store/filterSlice'
import modalSlice, { ModalSlice } from '@/_store/modalSlice'
import { Draft } from 'immer'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'


export type ImmerSet = (nextStateOrUpdater: State | Partial<State> | ((state: Draft<State>) => void), shouldReplace?: boolean) => void
export type ImmerGet = () => State

export type Slice<T> = (set: ImmerSet, get: ImmerGet) => T;

export type State = (
  ModalSlice &
  FilterSlice
)

const useAppStore = create<State, [["zustand/devtools", never], ["zustand/immer", never]]>(devtools(immer((set, get) => ({
  ...modalSlice(set, get),
  ...filterSlice(set, get),
}))));


export default useAppStore;