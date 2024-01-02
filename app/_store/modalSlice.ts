import React from 'react'
import { Slice } from '@/_store/useStore'


type ModalColors = 'blue' | 'green' | 'red' | 'yellow'

export type Modal = {
  isActive: boolean
  content: React.JSX.Element
  theme: ModalColors
}

export type ModalSlice = {
  modal: {
    element: Modal
    open: (content: React.JSX.Element, theme?: ModalColors) => void
    close: () => void
    onCloseEnd: () => void
  }
}

const modalSlice: Slice<ModalSlice> = (set) => ({
  modal: {
    element: { isActive: false, content: React.createElement("div"), theme: 'blue' },
    open(content, theme) {
      set(prev => {
        prev.modal.element = { isActive: true, content, theme: theme || 'blue' }
      })
    },
    close() {
      set(prev => {
        prev.modal.element.isActive = false
      })
    },
    onCloseEnd() {
      set(prev => {
        prev.modal.element.content = React.createElement("div")
        prev.modal.element.theme = 'blue'
      })
    },
  }
})

export default modalSlice