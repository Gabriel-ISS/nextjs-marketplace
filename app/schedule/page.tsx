import style from '@/schedule/page.module.scss'

export default function Schedule() {
  const schedule = [
    ['Lunes', '7:00 - 18:00'],
    ['Martes', '7:00 - 18:00'],
    ['Miércoles', '7:00 - 18:00'],
    ['Jueves', '7:00 - 18:00'],
    ['Viernes', '7:00 - 18:00'],
    ['Sábado', '7:00 - 12:00'],
    ['Domingo', 'CERRADO'],
  ]
  return (
    <main className={style.main}>
      <h2 className={style.title}>Horarios de atención</h2>
      <ul className={style.days}>
        {schedule.map(([day, schedule]) => (
          <li className={style.day} key={day}>
            <span>{day}</span>
            <span>{schedule}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}