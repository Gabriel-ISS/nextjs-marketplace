'use client'

import style from '@/_Components/Inputs.module.scss'
import { ErrorMessage } from 'formik'


interface CustomFormikErrorProps {
  name: string
}

export function CustomFormikError({ name }: CustomFormikErrorProps) {
  return <ErrorMessage className={style.error_message} name={name} component='div' />
}