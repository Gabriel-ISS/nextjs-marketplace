import { Header } from '@/_reusable_components/Modal/Modal';
import useAppStore from '@/_store/useStore';
import Link from 'next/link';
import { FaOpencart } from 'react-icons/fa';
import styles from '@/product/_components/AddedToCartModal.module.scss'


export default function AddedToCartModal() {
  const closeModal = useAppStore(s => s.modal.close)

  return <>
    <Header>Producto agregado al carrito</Header>
    <div className={styles.btn_container}>
      <button className={styles.continue_buying} onClick={closeModal}>Continuar comprando</button>
      <Link className={styles.view_cart} href='/cart' role='button'  onClick={closeModal}>Ver carrito <FaOpencart /></Link>
    </div>
  </>
}