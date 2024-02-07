'use client'

import MessageModal from '@/_Components/Modal/MessageModal'
import Price from '@/_Components/Price'
import styles from '@/_Components/ProductItem.module.scss'
import { deleteProduct } from '@/_lib/actions'
import useAppStore from '@/_store/useStore'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaEdit, FaTrash } from 'react-icons/fa'

import { FaExternalLinkAlt } from 'react-icons/fa'

interface Props {
  product: Product
  adminMode: boolean
}

export default function ProductItem({ product, adminMode }: Props) {
  const router = useRouter()
  const openModal = useAppStore(s => s.modal.open)

  function editProduct() {
    router.push(`/admin/product?id=${product._id}`)
  }

  function deleteProductHandler() {
    openModal(<MessageModal title='Advertencia' message='El producto se eliminara permanentemente' onAccept={async () => {
        const res = await deleteProduct(product._id)
        if (res.success)
        openModal(<MessageModal title='Éxito' message={res.success} onAccept={() => {
          revalidatePath('/products')
        }} />, 'green')
        if (res.error) {
          openModal(<MessageModal title='Error' message={res.error} />, 'red')
        }
    }} />, 'yellow')
  }

  return (
    <article className={styles.product}>
      <div className={styles.product__container}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.product__image} src={product.image} alt={product.name} />
        <div className={styles.product__right}>
          <Link href={'/product?id=' + product._id} target='_blank'><h3 className={styles.product__name}>{product.name} <FaExternalLinkAlt /></h3></Link>
          <Price price={product.price} />
          <div className={styles.product__tags} title='etiquetas'>
            {product.tags.map(tag => (
              <span key={product._id + tag} className={styles.product__tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
      {adminMode && (
        <footer className={styles.admin_fn}>
          <button className={`${styles.admin_fn__btn} ${styles['admin_fn__btn--edit']}`} onClick={editProduct}><FaEdit /> Edit</button>
          <button className={`${styles.admin_fn__btn} ${styles['admin_fn__btn--delete']}`} onClick={deleteProductHandler}><FaTrash /> Delete</button>
        </footer>
      )}
    </article>
  )
}