import Price from '@/_Components/Price'
import style from '@/_Components/Product.module.scss'


interface Props {
  product: Product
}

export default function Product({ product }: Props) {
  return (
    <div className={style.product}>
      <img className={style.product__img} src={product.image} alt={product.name} />
      <div className={style.product__data}>
        <div>
          <h2 className={style.product__name}>{product.name}</h2>
          <Price className={style.product__price} price={product.price} />
        </div>
        <a role='button' className={style.product__contact_btn} href='#'>Contáctenos</a>
        {product.note && <p className={style.product__note}>{product.note}</p>}
        <ul className={style.product__properties}>
          {product.properties.map(property => (
            <li key={property.name} className={style.product__property}>
              <span>{property.name}</span>
              <span>{property.values.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}