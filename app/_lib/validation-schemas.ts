import { ObjectSchema, object, string, number, array } from 'yup'

export const productSchema: ObjectSchema<Product> = object({
  _id: string().required(),
  image: string().required(),
  name: string().required(),
  price: object({
    old: number().optional(),
    current: number().required(),
  }).required(),
  note: string().optional(),
  category: string().required(),
  brand: string().required(),
  properties: array().of(object({
    name: string().required(),
    values: array().of(string().required()).required(),
  })).required(),
  tags: array().of(string().required()).required(),
})