import CropImage from '@/_Components/CropImage';
import { ImageFileData } from '@/_Components/Inputs';
import { Header } from '@/_Components/Modal/Modal';
import { getBase64 } from '@/_lib/utils';
import useAppStore from '@/_store/useStore';
import { useEffect, useState } from 'react';


/* interface Props {
  image: File
  onSaveCrop: (crop: string) => void
  ar?: number
}

export default function CropImageModal({ image, onSaveCrop, ar = 1 }: Props) {
  const closeModal = useAppStore(s => s.modal.close)
  const [base64Image, setBase64Image] = useState('')

  async function loadImage() {
    const base64 = await getBase64(image)
    setBase64Image(base64)
  }

  useEffect(() => {
    loadImage()
  }, [image])

  return <>
    <Header>Recortar</Header>
    <CropImage aspect={ar} imgSrc={base64Image} imageName={image.name} fileType={image.type} onSaveCrop={crop => {
      onSaveCrop(crop)
      closeModal()
    }} />
  </>
}; */

interface Props {
  imageData: ImageFileData
  onSaveCrop(crop: string): void
  ar?: number
}

export default function CropImageModal({ imageData, onSaveCrop, ar = 1 }: Props) {
  const closeModal = useAppStore(s => s.modal.close)

  return <>
    <Header>Recortar</Header>
    <CropImage aspect={ar} imgSrc={imageData.base64Img} imageName={imageData.name} fileType={imageData.type} onSaveCrop={crop => {
      onSaveCrop(crop)
      closeModal()
    }} />
  </>
};
