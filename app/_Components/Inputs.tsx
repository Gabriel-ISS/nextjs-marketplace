'use client'

import { getBase64 } from '@/_lib/utils'
import React, { ChangeEvent, HTMLInputTypeAttribute, useState } from 'react'
import style from '@/_Components/Inputs.module.scss'


interface InputProps {
  label: string
  field: string
  value: string | number
  handler(field: string, value: string): void
  inputType?: HTMLInputTypeAttribute
  as?: string
  className?: string
}

export function Input({ label, field, value, handler, inputType, as, className }: InputProps) {
  const imp = React.createElement(as || 'input', {
    type: inputType || 'text',
    value,
    onChange: inputHandler,
    name: field,
    required: true,
    className
  })

  function inputHandler(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    handler(field, e.currentTarget.value)
  }

  return <div>
    <label>{label}</label>
    {imp}
  </div>
}


export type ImageFileData = {
  base64Img: string,
  name: string
  type: string
}

interface ImageInputProps {
  className?: string
  handler(data: ImageFileData): void
}

export function ImageInput({ className, handler }: ImageInputProps) {
  const [isReading, setIsReading] = useState(false)

  async function _handler(e: ChangeEvent<HTMLInputElement>) {
    const file = (e.target.files as FileList)[0]
    setIsReading(true)
    const base64Img = await getBase64(file)
    setIsReading(false)
    handler({ base64Img, name: file.name, type: file.type })
  }

  return <div className={style.img_input}>
    <label className={`${style.img_input__btn} ${className ? className : ''}`} htmlFor="image-selector" role='button'>{isReading ? 'Leyendo imagen' : 'Elige una imagen'}</label>
    <input className={style.img_input__input} id='image-selector' type='file' accept='image/*' onChange={_handler} required />
  </div>
}

