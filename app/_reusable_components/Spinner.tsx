import { TbLoader2 } from 'react-icons/tb'
import styles from '@/_reusable_components/Spinner.module.scss'

export default function Spinner() {
  return <TbLoader2 className={styles.spinner} size='3rem' />
}

export function CenteredSpinner() {
  return (
    <div className='center center--fill-space'>
      <Spinner />
    </div>
  )
}