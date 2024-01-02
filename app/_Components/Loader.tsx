import React, { ReactNode } from 'react'

interface Props {
  isLoading: boolean
  meanwhile: React.JSX.Element
  children: ReactNode
}


export default function Loader({ isLoading, meanwhile, children }: Props) {
  if (isLoading) {
    return meanwhile
  } else {
    return children
  }
}