type Brand = {
  _id: string
  name: string
  used: number
}

type PropertyValue = {
  _id: string
  name: string
  used: number
}

type Property = {
  _id: string
  name: string
  values: PropertyValue[]
}

type Filter = {
  category: string
  category_img: string
  brands: Brand[]
  properties: Property[]
}

type Group = {
  _id: string
  name: string
  image: string
  used: number
}

type Product = {
  _id: string
  image: string
  name: string
  price: {
    old?: number,
    current: number
  }
  note?: string
  category: string
  brand: string
  properties: {
    name: string
    values: string[]
  }[]
  tags: string[]
}

type User = {
  _id: string
  name: string,
  password: string
}