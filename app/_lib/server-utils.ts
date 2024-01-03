import { DEFAULT_PRODUCT } from '@/_lib/constants';
import { Filter, Group, Product } from '@/_lib/models';
import mongoose, { Document } from "mongoose";
import { getServerSession } from 'next-auth';


const { MONGO_URL } = process.env;

if (!MONGO_URL) throw new Error("MONGO_URL is not defined.");

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null };
}

export const connectDB = async () => {
  if (cached.conn) return cached.conn;

  cached.conn = await mongoose.connect(MONGO_URL);

  return cached.conn;
}

export async function checkAuthentication() {
  const user = await getServerSession()
  if (!user) throw new Error('Usuario no autenticado')
}

/** Explain product filter data */
export async function explainPFData(product: Product, newFilters: NewFilters): Promise<{ toIncrease: PFData, toReduce: PFData }> {
  const toIncrease: PFData = { category: '', brand: '', properties: [], tags: [] }
  const toReduce: PFData = { category: '', brand: '', properties: [], tags: [] }

  const getProduct = async (): Promise<Product> => {
    if (!product._id.length) return DEFAULT_PRODUCT
    const prevProduct = await Product.findById(product._id)
    if (!prevProduct) throw new Error("Can't fetch previous product")
    return prevProduct
  }

  const prevProduct = await getProduct()


  // categories
  if (prevProduct.category !== product.category) {
    if (!newFilters.category.length) toIncrease.category = product.category;
    toReduce.category = prevProduct.category;
  }

  // brands
  if (prevProduct.brand !== product.brand) {
    if (!newFilters.brand.length) toIncrease.brand = product.brand;
    toReduce.brand = prevProduct.brand;
  }

  // properties
  for (const property of prevProduct.properties) {
    const prevValues = property.values
    const currentValues = product.properties.find(p => p.name == property.name)?.values || []

    const deselectedValues = prevValues.filter(v => !currentValues.includes(v))
    const propertyFromNewFilters = newFilters.properties.find(p => p.name == property.name)
    const selectedValue = currentValues.filter(value => {
      const notInPrevProduct = !prevValues.includes(value)
      const notInNewFilters = !propertyFromNewFilters?.values.some(v => v == value)
      return notInPrevProduct && notInNewFilters
    })

    if (deselectedValues.length) {
      toReduce.properties.push({
        name: property.name,
        values: deselectedValues
      })
    }

    if (selectedValue.length) {
      toIncrease.properties.push({
        name: property.name,
        values: selectedValue
      })
    }
  }

  // tags
  toIncrease.tags = product.tags.filter(tag => {
    const notInPrevProduct = !prevProduct.tags.includes(tag)
    const notInNewFilters = !newFilters.tags.some(t => t.name == tag)
    return notInPrevProduct && notInNewFilters
  })
  toReduce.tags = prevProduct.tags.filter(tag => !product.tags.includes(tag))

  return { toIncrease, toReduce }
}

export async function createFilter(newFilterData: NewFilters) {
  const newFilter: UnsavedFilter = {
    category: newFilterData.category,
    brands: [{
      name: newFilterData.brand,
      used: 1
    }],
    properties: newFilterData.properties.map(property => ({
      name: property.name,
      values: property.values.map(value => ({
        name: value,
        used: 1
      }))
    }))
  }
  try {
    return await Filter.create(newFilter)
  } catch (error) {
    throw new Error("Can't create filter")
  }
}

export async function updateFilter(category: string, toAdd: NewFilters, toIncrease: PFData, toReduce: PFData) {
  const filter = await Filter.findOne({ category }) as UnsavedFilter
  if (!filter) throw new Error(`Can't find filter with category ${category}`)

  const updateBrandUse = (toIncreaseBrand: string, toAdd: 1 | -1) => {
    if (!toIncreaseBrand.length) return;
    filter.brands.forEach(brand => {
      if (toIncreaseBrand == brand.name) brand.used += toAdd;
    })
    filter.brands = filter.brands.filter(b => b.used)
  }

  const updatePropertyUse = (properties: PFData['properties'], toAdd: 1 | -1) => {
    if (!properties.length) return;
    filter.properties.forEach(property => {
      const toIncreaseValues = properties.find(p => p.name == property.name)?.values
      if (!toIncreaseValues) return;
      property.values.forEach(value => {
        if (toIncreaseValues.includes(value.name)) value.used += toAdd;
      })
      property.values = property.values.filter(v => v.used)
    })
    filter.properties = filter.properties.filter(p => p.values.length)
  }

  // brand
  updateBrandUse(toIncrease.brand, 1)

  updateBrandUse(toReduce.brand, -1)

  if (toAdd.brand.length) {
    filter.brands.push({
      name: toAdd.brand,
      used: 1
    })
  }

  // properties
  updatePropertyUse(toIncrease.properties, 1)

  updatePropertyUse(toReduce.properties, -1)

  toAdd.properties.forEach(property => {
    const filterProperty = filter.properties.find(p => p.name == property.name)
    const toAddValues = property.values.map(v => ({ name: v, used: 1 }))
    if (filterProperty) {
      filterProperty.values.push(...toAddValues)
    } else {
      filter.properties.push({
        name: property.name,
        values: toAddValues
      })
    }
  })

  if (filter.brands.length || filter.properties.length) {
    try {
      return await (filter as Filter & Document).save()
    } catch (error) {
      throw new Error("Can't save updated filter")
    }
  } else {
    try {
      return await Filter.findByIdAndDelete((filter as Filter & Document)._id)
    } catch (error) {
      throw new Error("Can't delete filter")
    }
  }
}

// TODO: guardar imagen
export async function updateTags(newTags: NewFilters['tags'], toIncreaseTags: string[], toReduceTags: string[]) {

  const createTags = async () => {
    return await Promise.all(newTags.map(async tag => {
      try {
        return await Group.create(tag)
      } catch (error) {
        throw new Error(`can't create tag ${tag}`)
      }
    }))
  }

  const updateUsed = async (tags: string[], toAdd: 1 | -1) => {
    return await Promise.all(tags.map(async tag => {
      const group = await Group.findOne({ name: tag })
      if (!group) throw new Error(`Can't find tag ${tag}`)
      if (group.used > 1 || toAdd > 0) {
        try {
          return await Group.findByIdAndUpdate(group._id, { $inc: { used: toAdd } })
        } catch (error) {
          throw new Error(`Can't update used count of tag ${tag}`)
        }
      } else {
        try {
          return await Group.findByIdAndDelete(group._id)
        } catch (error) {
          throw new Error(`Can't delete tag ${tag}`)
        }
      }
    }))
  }

  return await Promise.all([
    createTags(),
    updateUsed(toIncreaseTags, 1),
    updateUsed(toReduceTags, -1),
  ])
}