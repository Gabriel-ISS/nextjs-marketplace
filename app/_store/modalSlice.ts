import React, { ComponentProps } from 'react'
import { Slice, State } from '@/_store/useStore'
import MessageModal from '@/_Components/Modal/MessageModal'


export type ModalColor = 'blue' | 'green' | 'red' | 'yellow'

export type Modal = {
  isActive: boolean
  content: React.JSX.Element
  theme: ModalColor
}

export type ModalSlice = {
  modal: {
    element: Modal
    open(content: React.JSX.Element, theme?: ModalColor): void
    openMessage(props: ComponentProps<typeof MessageModal>): void
    close(): void
    onCloseEnd(): void
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
    openMessage(props) {
      set(prev => {
        prev.modal.element.isActive = true
        prev.modal.element.content = MessageModal(props)
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