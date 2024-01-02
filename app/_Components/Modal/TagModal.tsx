'use client'

import CropImage from '@/_Components/CropImage'
import { ImageFileData, ImageInput } from '@/_Components/Inputs'
import style from '@/_Components/Modal/TagModal.module.scss'
import { Header } from '@/_Components/Modal/Modal'
import useAppStore from '@/_store/useStore'
import { useState } from 'react'


interface Props {
  title: string
  onAccept(tag: string, img: string): void
}

export default function TagModal({ title, onAccept }: Props) {
  const close = useAppStore(s => s.modal.close)
  const [tag, setTag] = useState('')
  const [img, setImage] = useState<ImageFileData | null>()

  function imageHandler(data: ImageFileData) {
    setImage(data)
  }

  function saveAndClose(crop: string) {
    if (crop) {
      onAccept(tag, crop)
      close()
    } else {
      alert('No has seleccionado ninguna imagen')
    }
  }

  return (
    <>
      <Header>{title}</Header>
      <form className={style.form}>
        <input className={style.text_input} placeholder='Nombre de etiqueta' type="text" value={tag} onChange={e => setTag(e.target.value)} required autoFocus />
        <ImageInput className={style.img_input} handler={imageHandler} />
        {img && <CropImage className={style.crop} aspect={1} imgSrc={img.base64Img} imageName={img.name} fileType={img.type} onSaveCrop={saveAndClose} />}
      </form>
    </>
  )
}