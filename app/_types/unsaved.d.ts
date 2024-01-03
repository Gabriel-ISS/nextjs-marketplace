type UnsavedBrand = Omit<Brand, '_id'>

type UnsavedProperty = Omit<Property, '_id' | 'values'> & {
  values: UnsavedPropertyValue[]
}

type UnsavedPropertyValue = Omit<PropertyValue, '_id'>

type UnsavedFilter = {
  category: string
  brands: UnsavedBrand[]
  properties: UnsavedProperty[]
}

type UnsavedGroup = Omit<Group, '_id'>