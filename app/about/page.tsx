import styles from '@/about/page.module.scss'

export default function About() {
  return (
    <main className={styles.main}>
      <div>
        <h2 className={styles.title}>Misión</h2>
        <p className={styles.paragraph}>Lorem ipsum dolor sit amet consectetur, adipisicing elit. In atque suscipit molestiae recusandae officiis doloribus sapiente necessitatibus eius esse assumenda ea enim temporibus, vero aliquam excepturi ipsa autem mollitia saepe.</p>
      </div>
      <div>
        <h2 className={styles.title}>Vision</h2>
        <p className={styles.paragraph}>Lorem ipsum dolor sit amet consectetur, adipisicing elit. In atque suscipit molestiae recusandae officiis doloribus sapiente necessitatibus eius esse assumenda ea enim temporibus, vero aliquam excepturi ipsa autem mollitia saepe.</p>
      </div>
    </main>
  )
}