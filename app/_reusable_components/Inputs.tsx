'use client'

import { getBase64 } from '@/_lib/utils'
import React, { ChangeEvent, HTMLInputTypeAttribute, useState } from 'react'
import styles from '@/_reusable_components/Inputs.module.scss'
import { ErrorMessage } from 'formik'

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

  return <div className={styles.img_input}>
    <label className={`${styles.img_input__btn} ${className ? className : ''}`} htmlFor="image-selector" role='button'>{isReading ? 'Leyendo imagen' : 'Elige una imagen'}</label>
    <input className={styles.img_input__input} id='image-selector' type='file' accept='image/*' onChange={_handler} required />
  </div>
}




interface CustomFormikErrorProps {
  name: string
}

export function CustomFormikError({ name }: CustomFormikErrorProps) {
  return <ErrorMessage className={styles.error_message} name={name} component='div' />
}