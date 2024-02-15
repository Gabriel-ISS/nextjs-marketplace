import { ObjectSchema, object, string, number, array, ref } from 'yup'


const requiredMessage = (field: string) => `"${field}" es un campo requerido.`
const minLengthMessage = (field: string) => `"${field}" debe tener como mínimo \${min} caracteres.`
const maxLengthMessage = (field: string) => `"${field}" debe tener como máximo \${max} caracteres.`
const minValueMessage = (field: string) => `"${field}" debe ser de al menos \${min}.`
const minItemsMessage = (field: string) => `"${field}" requiere al menos \${min} elementos.`


export const productSchema: ObjectSchema<Omit<Product, '_id'>> = object({
  imgPath: string().required(requiredMessage('Imagen')),
  name: string().required(requiredMessage('Nombre')).min(8, minLengthMessage('Nombre')).max(50, maxLengthMessage('Nombre')),
  price: object({
    old: number().optional(),
    current: number().required().min(5000, minValueMessage('Precio')),
  }).required(),
  note: string().optional(),
  category: string().required(requiredMessage('Categoría')),
  brand: string().required(requiredMessage('Marca')),
  properties: array().of(object({
    name: string().required(),
    values: array().of(string().required()).required().min(1, 'Valor de propiedad'),
  })).required().min(2, minItemsMessage('Propiedades comunes')),
  tags: array().of(string().required()).required(),
})

export const userSchema: ObjectSchema<Omit<User, '_id' | 'cart'> & Partial<Pick<User,'cart'>>> = object({
  name: string().required(requiredMessage('nombre')).min(5, minLengthMessage('nombre')).max(25, maxLengthMessage('nombre')),
  password: string().required(requiredMessage('contraseña')).min(14, minLengthMessage('contraseña')).max(25, maxLengthMessage('contraseña')),
  role: string().optional(),
  cart: array().of(string().required()).optional()
})

export const NewCredentialsSchema = userSchema.concat(object({
  confirmPassword: string().required(requiredMessage('confirmar contraseña')).oneOf([ref('password')], 'Este valor debe ser igual a la contraseña')
}))