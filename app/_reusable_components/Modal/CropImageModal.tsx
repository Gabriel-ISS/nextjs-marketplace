import CropImage from '@/_reusable_components/CropImage';
import { ImageFileData } from '@/_reusable_components/Inputs';
import { Header } from '@/_reusable_components/Modal/Modal';
import useAppStore from '@/_store/useStore';


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
