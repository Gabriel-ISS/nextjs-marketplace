import Price from '@/_Components/Price'
import styles from '@/_Components/Product.module.scss'


interface Props {
  product: Product
}

export default function Product({ product }: Props) {
  return (
    <div className={styles.product}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.product__img} src={product.image} alt={product.name} />
      <div className={styles.product__data}>
        <div>
          <h2 className={styles.product__name}>{product.name}</h2>
          <Price className={styles.product__price} price={product.price} />
        </div>
        <a role='button' className={styles.product__contact_btn} href='#'>Contáctenos</a>
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