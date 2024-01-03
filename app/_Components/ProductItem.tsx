import MessageModal from '@/_Components/Modal/MessageModal'
import Price from '@/_Components/Price'
import style from '@/_Components/ProductItem.module.scss'
import { StateUpdater } from '@/_hooks/useWritableState'
import { deleteProduct } from '@/_lib/actions'
import useAppStore from '@/_store/useStore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaEdit, FaTrash } from 'react-icons/fa'

import { FaExternalLinkAlt } from 'react-icons/fa'

interface Props {
  product: Product
  adminMode: boolean
  setProducts: StateUpdater<Product[]>
}

export default function ProductItem({ product, adminMode, setProducts }: Props) {
  const router = useRouter()
  const openModal = useAppStore(s => s.modal.open)

  function editProduct() {
    router.push(`/admin/product?id=${product._id}`)
  }

  function deleteProductHandler() {
    openModal(<MessageModal title='Advertencia' message='El producto se eliminara permanentemente' onAccept={async () => {
      try {
        const message = await deleteProduct(product._id, product.category)
        openModal(<MessageModal title='Éxito' message={message} onAccept={() => {
          setProducts(products => {
            const index = products.findIndex(p => p.name == product.name)
            products.splice(index, 1)
            router.refresh()
          })
        }} />, 'green')
      } catch (error: any) {
        openModal(<MessageModal title='Error' message={error.message} />, 'red')
      }
    }} />, 'yellow')
  }

  return (
    <article className={style.product}>
      <div className={style.product__container}>
        <img className={style.product__image} src={product.image} alt={product.name} />
        <div className={style.product__right}>
          <Link href={'/product?id=' + product._id} target='_blank'><h3 className={style.product__name}>{product.name} <FaExternalLinkAlt /></h3></Link>
          <Price price={product.price} />
          <div className={style.product__tags} title='etiquetas'>
            {product.tags.map(tag => (
              <span key={product._id + tag} className={style.product__tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
      {adminMode && (
        <footer className={style.admin_fn}>
          <button className={`${style.admin_fn__btn} ${style['admin_fn__btn--edit']}`} onClick={editProduct}><FaEdit /> Edit</button>
          <button className={`${style.admin_fn__btn} ${style['admin_fn__btn--delete']}`} onClick={deleteProductHandler}><FaTrash /> Delete</button>
        </footer>
      )}
    </article>
  )
}