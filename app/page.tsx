import style from '@/page.module.scss'
import Search from '@/_Components/Search'
import ProductGroup from '@/_Components/ProductGroup'
import { exo2 } from '@/_lib/fonts'
import { CiSettings } from 'react-icons/ci'
import { PiBroom } from 'react-icons/pi'
import { PiCircuitry } from 'react-icons/pi'
import { MdOutlineSpeed } from 'react-icons/md'
import { GiCctvCamera } from 'react-icons/gi'
import { getProductTags as getProductGroups } from '@/_lib/data'


export default async function () {
  const services = [
    <><CiSettings /> Reparación</>,
    <><PiBroom /> Mantenimiento y limpieza</>,
    <><PiCircuitry /> Instalación de componentes de computadoras</>,
    <><MdOutlineSpeed /> Actualización y optimización de sistemas</>,
    <><GiCctvCamera /> Instalación de cámaras de seguridad</>,
  ]
  const productGroups = await getProductGroups()

  return (
    <main>
      <section className={style.search_section}>
        <Search />
      </section>
      <section className={style.services}>
        <div className={style.services__container}>
          <h2 className={`${exo2.className} ${style.services__title}`}>Servicios</h2>
          <ul className={style.services__list}>
            {services.map((service, i) => (
              <li key={'service' + i} className={style[`services__service_${i}`]}>
                {service}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className={style.products}>
        <h2 className={`${exo2.className} ${style.products__title}`}>Encuentre en PC Click</h2>
        <ul className={style.products__container}>
          {productGroups.map(group => (
            <ProductGroup key={group.name} name={group.name} image={group.image} />
          ))}
        </ul>
      </section>
    </main>
  )
}
