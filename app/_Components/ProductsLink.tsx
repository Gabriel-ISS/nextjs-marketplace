import useAppStore from '@/_store/useStore';
import Link from 'next/link';
import QueryString from 'qs';
import { useEffect, useState } from 'react';

export default function ProductsLink() {
  const query = useAppStore(s => s.query.data)
  const [qs, setQs] = useState('')

  useEffect(() => {
    setQs(QueryString.stringify(query))
  }, [query])
  
  return (
    <Link href={qs.length ? `/products?${qs}` : '/products'}>Productos</Link>
  )
}