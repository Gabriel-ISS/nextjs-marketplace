import style from '@/about/page.module.scss'

export default function () {
  // TODO: completar
  return (
    <main className={style.main}>
      <div>
        <h2 className={style.title}>Misión</h2>
        <p className={style.paragraph}>Lorem ipsum dolor sit amet consectetur, adipisicing elit. In atque suscipit molestiae recusandae officiis doloribus sapiente necessitatibus eius esse assumenda ea enim temporibus, vero aliquam excepturi ipsa autem mollitia saepe.</p>
      </div>
      <div>
        <h2 className={style.title}>Vision</h2>
        <p className={style.paragraph}>Lorem ipsum dolor sit amet consectetur, adipisicing elit. In atque suscipit molestiae recusandae officiis doloribus sapiente necessitatibus eius esse assumenda ea enim temporibus, vero aliquam excepturi ipsa autem mollitia saepe.</p>
      </div>
    </main>
  )
}