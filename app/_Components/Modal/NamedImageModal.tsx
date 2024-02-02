'use client'

import CropImage from '@/_Components/CropImage'
import { ImageFileData, ImageInput } from '@/_Components/Inputs'
import styles from '@/_Components/Modal/NamedImageModal.module.scss'
import { Header } from '@/_Components/Modal/Modal'
import useAppStore from '@/_store/useStore'
import { useState } from 'react'


interface Props {
  title: string
  onAccept(tag: string, img: string): void
}

export default function NamedImageModal({ title, onAccept }: Props) {
  const close = useAppStore(s => s.modal.close)
  const [name, setName] = useState('')
  const [img, setImage] = useState<ImageFileData | null>()

  function imageHandler(data: ImageFileData) {
    setImage(data)
  }

  function saveAndClose(crop: string) {
    if (crop) {
      onAccept(name, crop)
      close()
    } else {
      alert('No has seleccionado ninguna imagen')
    }
  }

  return (
    <>
      <Header>{title}</Header>
      <form className={styles.form}>
        <input className={styles.text_input} placeholder='Nombre' type="text" value={name} onChange={e => setName(e.target.value)} required autoFocus />
        <ImageInput className={styles.img_input} handler={imageHandler} />
        {img && <CropImage className={styles.crop} aspect={1} imgSrc={img.base64Img} imageName={img.name} fileType={img.type} onSaveCrop={saveAndClose} />}
      </form>
    </>
  )
}