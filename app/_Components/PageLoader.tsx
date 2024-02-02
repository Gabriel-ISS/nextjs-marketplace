import { TbLoader2 } from 'react-icons/tb'
import styles from '@/_Components/PageLoader.module.scss'

export default function PageLoader() {
  return (
    <div className={styles.container}>
      <TbLoader2 className={styles.spinner} size='3rem' />
    </div>
  )
}