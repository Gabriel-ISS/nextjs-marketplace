import styles from '@/_components/ProductGroup.module.scss'
import { ClientError } from '@/_lib/utils'
import Link from 'next/link'
import QueryString from 'qs'


interface Props {
  name: string
  imgPath: string
  type: 'tag' | 'category'
}

export default function ProductGroup({ name, imgPath, type }: Props) {
  const q: Query =
    type == 'tag' ? { tags: [name] } :
      type == 'category' ? { category: name } :
        (() => { throw new ClientError(`El tipo de grupo no puede ser ${type}`) })()

  const img = process.env.NEXT_PUBLIC_IMAGE_KIT_BASE_URL + imgPath + '?tr=w-340'
  const url = `/products?${QueryString.stringify(q)}`

  return (
    <li className={styles.prod_group}>
      <Link className={styles.prod_group__container} href={url}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.prod_group__img} src={img} alt={name} loading='lazy' />
        <h3 className={styles.prod_group__name}>{name}</h3>
      </Link>
    </li>
  )
}