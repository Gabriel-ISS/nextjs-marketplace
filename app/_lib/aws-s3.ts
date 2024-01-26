import { ServerSideError } from '@/_lib/server-utils';
import { DeleteObjectsCommand, ListObjectsCommand, PutObjectCommand, S3 } from '@aws-sdk/client-s3';

function getClient() {
  try {
    return new S3({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    })
  } catch (e) {
    throw new ServerSideError('Error al conectarse con almacén de imágenes')
  }
}

const
  Bucket = process.env.S3_BUCKET_NAME || ' ',
  region = process.env.AWS_REGION || '',
  bucketLocation = 'https://' + process.env.S3_IMAGE_DOMAIN + '/',
  client = getClient()

const getProductKey = (productID: string, fileExtension: string) => `products/${productID}/${Date.now()}.${fileExtension}`
const getTagKey = (tagID: string, fileExtension: string) => `tags/${tagID}/${Date.now()}.${fileExtension}`
const getCategoryKey = (tagID: string, fileExtension: string) => `categories/${tagID}/${Date.now()}.${fileExtension}`

export async function saveImage(pathGenerator: (extension: string) => string, base64Image: string): Promise<string> {
  // data:image/jpeg;base64,/9j/4AAQSkZJRgA...
  const
    ContentType = base64Image.slice('data:'.length, base64Image.indexOf(';')),
    fileExtension = ContentType.split('/')[1],
    Key = pathGenerator(fileExtension),
    buffer = Buffer.from(base64Image.split(',')[1], 'base64')

  try {
    await client.send(new PutObjectCommand({
      Bucket,
      Key,
      Body: buffer,
      ContentType
    }))
  } catch (error) {
    throw new ServerSideError('Error al subir imagen')
  }

  return bucketLocation + Key
}

export async function saveProductImage(productID: string, base64Image: string): Promise<string> {
  return await saveImage(extension => getProductKey(productID, extension), base64Image)
}

export async function saveCategoryImage(filterID: string, base64Image: string): Promise<string> {
  return await saveImage(extension => getCategoryKey(filterID, extension), base64Image)
}

export async function saveTagImage(tagID: string, base64Image: string): Promise<string> {
  return await saveImage(extension => getTagKey(tagID, extension), base64Image)
}

export async function deleteImages(...links: string[]) {
  if (!links.length) return;
  try {
    return await client.send(new DeleteObjectsCommand({
      Bucket,
      Delete: {
        Objects: links.map(link => {
          const url = new URL(link)
          return { Key: url.pathname.slice(1) }
        })
      }
    }))
  } catch (error) {
    throw new ServerSideError('Error al eliminar imágenes')
  }
}

