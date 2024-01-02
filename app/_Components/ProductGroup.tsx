'use client'

import style from '@/_Components/ProductGroup.module.scss'
import useAppStore from '@/_store/useStore'
import Link from 'next/link'
import QueryString from 'qs'


interface Props {
  name: string
  image: string
}

export default function ProductGroup({ name, image }: Props) {
  const query: Query = {
    tags: [name]
  }
  const url = `/products?${QueryString.stringify(query)}`
  const setTag = useAppStore(s => s.query.setTag)

  function linkHandler() {
    setTag(name)
  }

  return (
    <li className={style.prod_group} style={{ backgroundImage: `url('${image}')` }}>
      <Link className={style.prod_group__name_container} href={url} onClick={linkHandler}>
        <h3 className={style.prod_group__name}>{name}</h3>
      </Link>
    </li>
  )
}