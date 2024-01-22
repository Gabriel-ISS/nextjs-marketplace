type UnsavedBrand = Omit<Brand, '_id' | 'used'>
type UnsavedBrand2 = Omit<Brand, '_id'>

type UnsavedProperty = Omit<Property, '_id' | 'values'> & {
  values: UnsavedPropertyValue[]
}
type UnsavedProperty2 = Omit<Property, '_id' | 'values'> & {
  values: UnsavedPropertyValue2[]
}

type UnsavedPropertyValue = Omit<PropertyValue, '_id' | 'used'>
type UnsavedPropertyValue2 = Omit<PropertyValue, '_id'>

type UnsavedFilter = {
  category: string
  brands: UnsavedBrand[]
  properties: UnsavedProperty[]
}
type UnsavedFilter2 = {
  category: string
  category_img: string
  brands: UnsavedBrand2[]
  properties: UnsavedProperty2[]
}

type UnsavedGroup = Omit<Group, '_id' | 'used'>