import CartButton from '@/_Components/CartButton'
import Price from '@/_Components/Price'
import styles from '@/_Components/Product.module.scss'
import { getSafeUser } from '@/_lib/server-utils'


interface Props {
  product: Product
}

export default function Product({ product }: Props) {
  const img = process.env.NEXT_PUBLIC_IMAGE_KIT_BASE_URL + product.imgPath + '?tr=w-450'

  return (
    <div className={styles.product}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.product__img} src={img} alt={product.name} />
      <div className={styles.product__data}>
        <div>
          <h2 className={styles.product__name}>{product.name}</h2>
          <Price className={styles.product__price} price={product.price} />
        </div>
        <CartButton productID={product._id} />
        {product.note && <p className={styles.product__note}>{product.note}</p>}
        <ul className={styles.product__properties}>
          {product.properties.map(property => (
            <li key={property.name} className={styles.product__property}>
              <span>{property.name}</span>
              <span>{property.values.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}