import style from '@/_Components/ErrorBlock.module.scss'


interface Props {
  children: string
  className?: string
}

export default function ErrorBlock({children, className}: Props) {
  const classNm = className ? ' ' + className : ''

  return (
    <div className={style.error + classNm}>{children}</div>
  )
}