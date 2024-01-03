import { Model, Schema, model, models } from 'mongoose';


const RequiredNumber = { type: Number, required: true }
const RequiredString = { type: String, required: true }

const productSchema = new Schema<Product & Document>({
  image: RequiredString,
  name: RequiredString,
  price: {
    old: Number,
    current: RequiredNumber,
  },
  note: String,
  category: RequiredString,
  brand: RequiredString,
  properties: [{
    name: RequiredString,
    values: [String],
  }],
  tags: [String],
})

const filterSchema = new Schema<Filter & Document>({
  category: RequiredString,
  brands: [{
    name: RequiredString,
    used: RequiredNumber
  }],
  properties: [{
    name: RequiredString,
    values: [{
      name: RequiredString,
      used: RequiredNumber
    }]
  }]
})

const groupSchema = new Schema<Group & Document>({
  name: RequiredString,
  image: RequiredString,
  used: {
    type: Number,
    default: 1
  }
})

const userSchema = new Schema<User & Document>({
  name: RequiredString,
  password: RequiredString
})

export const Product = (models.Product as Model<Product & Document>) || model('Product', productSchema);
export const Filter = (models.Filter as Model<Filter & Document>) || model('Filter', filterSchema);
export const Group = (models.Group as Model<Group & Document>) || model('Group', groupSchema);
export const User = (models.User as Model<User & Document>) || model('User', userSchema);