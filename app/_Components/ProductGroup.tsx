'use client'

import styles from '@/_Components/ProductGroup.module.scss'
import useAppStore from '@/_store/useStore'
import Link from 'next/link'
import QueryString from 'qs'
import { useState } from 'react'


interface Props {
  name: string
  image: string
  type: 'tag' | 'category'
}

export default function ProductGroup({ name, image, type }: Props) {
  const [query] = useState<Query>(() => {
    if (type == 'tag') {
      return { tags: [name] }
    }
    else if (type == 'category') {
      return { category: name }
    }
    else {
      throw new Error(`El tipo de grupo no puede ser ${type}`)
    }
  })
  const [url] = useState(() => `/products?${QueryString.stringify(query)}`)
  const setQuery = useAppStore(s => s.query.setter)

  function linkHandler() {
    setQuery(query)
  }

  return (
    <li className={styles.prod_group}>
      <Link className={styles.prod_group__container} href={url} onClick={linkHandler}>
        <img className={styles.prod_group__img} src={image} alt={name} />
        <h3 className={styles.prod_group__name}>{name}</h3>
      </Link>
    </li>
  )
}