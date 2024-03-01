import styles from '@/_reusable_components/ErrorBlock.module.scss'


interface Props {
  children: string
  className?: string
}

export default function ErrorBlock({children, className}: Props) {
  const classNm = className ? ' ' + className : ''

  return (
    <div className={styles.error + classNm}>{children}</div>
  )
}