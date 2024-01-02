type UnsavedProperty = Omit<Property, '_id' | 'values'> & {
  values: Omit<PropertyValue, '_id'>[]
}

type UnsavedFilter = {
  category: string
  brands: Omit<Brand, '_id'>[]
  commonProperties: UnsavedProperty[]
}

type UnsavedGroup = Omit<Group, '_id'>