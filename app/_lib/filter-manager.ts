import { Filter } from '@/_lib/models';
import { Document } from 'mongoose';

type CustomFilterConstructorProps = {
  filter?: UnsavedFilter2 & Document,
  product?: Product
}

export type RelevantFilterDataKeys = 'category' | 'brand' | 'properties'
export type RelevantFilterData = Pick<NewFilters, RelevantFilterDataKeys>


export type _RelevantFilterData = Pick<NewFilters, Exclude<RelevantFilterDataKeys, 'category'>>

export class FilterManager {
  data: UnsavedFilter2 & Document;

  constructor({ filter, product }: CustomFilterConstructorProps) {
    if (filter) {
      this.data = filter
    } else if (product) {
      this.data = new Filter({
        category: product.category,
        brands: [{
          name: product.brand,
          used: 1
        }], properties: product.properties.map(p => ({
          name: p.name,
          values: p.values.map(v => ({
            name: v,
            used: 1
          }))
        }))
      })
    } else {
      throw new Error('FilterManager requires at least one input')
    }
  }

  increaseOrAddBrand(brand: _RelevantFilterData['brand']) {
    const toUpdate = this.data.brands.find(b => b.name == brand)
    if (toUpdate) {
      toUpdate.used++;
    } else {
      this.data.brands.push({ name: brand, used: 1 })
    }
  }

  increaseOrAddPropertyValue(values: UnsavedPropertyValue2[], p_values: _RelevantFilterData['properties'][number]['values']) {
    for (const p_value of p_values) {
      const updatableValue = values.find(v => v.name == p_value)
      if (updatableValue) {
        updatableValue.used++;
      } else {
        values.push({
          name: p_value,
          used: 1
        })
      }
    }
  }

  addProperty(property: _RelevantFilterData['properties'][number]) {
    this.data.properties.push({
      name: property.name,
      values: property.values.map(v => ({
        name: v,
        used: 1
      }))
    })
  }

  increaseOrAddProperties(properties: _RelevantFilterData['properties']) {
    for (const property of properties) {
      const updatableProperty = this.data.properties.find(p => p.name == property.name)
      if (updatableProperty) {
        this.increaseOrAddPropertyValue(updatableProperty.values, property.values)
      } else {
        this.addProperty(property)
      }
    }
  }

  increase({ brand, properties }: _RelevantFilterData) {
    this.increaseOrAddBrand(brand)
    this.increaseOrAddProperties(properties)
    return this
  }

  reduceOrRemoveBrand(brand: _RelevantFilterData['brand']) {
    const index = this.data.brands.findIndex(b => b.name == brand)
    const toUpdate = this.data.brands[index]

    if (!toUpdate) throw new Error(`No se puede reducir ni eliminar la marca ${brand} porque no existe`)

    if (toUpdate.used > 1) {
      toUpdate.used--;
    } else {
      this.data.brands.splice(index, 1)
    }
  }

  reduceOrRemovePropertyValue(values: UnsavedPropertyValue2[], p_values: _RelevantFilterData['properties'][number]['values']) {
    for (const p_value of p_values) {
      const index = values.findIndex(v => v.name == p_value)
      const updatableValue = values[index]

      if (!updatableValue) throw new Error('No se puede reducir ni eliminar una propiedad de valor porque no se encuentra')

      if (updatableValue.used > 1) {
        updatableValue.used--;
      } else {
        values.splice(index, 1)
      }
    }
  }

  reduceOrRemoveProperties(properties: _RelevantFilterData['properties']) {
    for (const property of properties) {
      const index = this.data.properties.findIndex(p => p.name == property.name)
      const updatableProperty = this.data.properties[index]

      if (!updatableProperty) throw new Error(`No se puede eliminar ni reducir la propiedad ${property.name} porque no existe`)

      this.reduceOrRemovePropertyValue(updatableProperty.values, property.values)

      if (!updatableProperty.values.length) {
        this.data.properties.splice(index, 1)
      }
    }
  }

  reduce({ brand, properties }: _RelevantFilterData) {
    this.reduceOrRemoveBrand(brand)
    this.reduceOrRemoveProperties(properties)
    return this
  }

  modify(product: _RelevantFilterData, prevProduct: _RelevantFilterData) {
    let increase: _RelevantFilterData = { brand: '', properties: [] }
    let reduce: _RelevantFilterData = { brand: '', properties: [] }

    if (product.brand != prevProduct.brand) {
      increase.brand = product.brand
      reduce.brand = product.brand
    }

    const getANotInB = (A: _RelevantFilterData['properties'], B: _RelevantFilterData['properties']) => {
      const accumulator: RelevantFilterData['properties'] = []
      A.forEach(A_Property => {
        const B_Property = B.find(B_Property => B_Property.name == A_Property.name)

        // Si la propiedad A se encuentra en B, es una propiedad común, pero los valores pueden variar
        if (B_Property) {
          const justInAValues: string[] = A_Property.values.filter(A_Value => !B_Property.values.includes(A_Value))
          if (justInAValues) {
            accumulator.push({
              name: B_Property.name,
              values: justInAValues
            })
          }
        }
        // Si la propiedad A no se encuentra en A, encones la propiedad A es única de de A
        else {
          accumulator.push(A_Property)
        }
      })
      return accumulator
    }

    reduce.properties = getANotInB(prevProduct.properties, product.properties)
    increase.properties = getANotInB(product.properties, reduce.properties)

    this.increase(increase)
    this.reduce(reduce)

    return this
  }

  async updateDB() {
    if (this.data.isNew) {
      return await this.data.save()
    } else {
      if (this.data.brands.length || this.data.properties.length) {
        return await this.data.save()
      } else {
        return await this.data.deleteOne()
      }
    }
  }
}