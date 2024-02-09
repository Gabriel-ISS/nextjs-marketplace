import { Document, Model, Schema, model, models } from 'mongoose';

const RequiredNumber = { type: Number, required: true }
const RequiredString = { type: String, required: true }
const SafeString = { type: String, required: true, select: false }
const UsedSchema = {
  type: Number,
  default: 1
}

const productSchema = new Schema<Product & Document>({
  imgPath: RequiredString,
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
  categoryImgPath: RequiredString,
  brands: [{
    name: RequiredString,
    used: UsedSchema
  }],
  properties: [{
    name: RequiredString,
    values: [{
      name: RequiredString,
      used: UsedSchema
    }]
  }]
})

const groupSchema = new Schema<Group & Document>({
  name: RequiredString,
  imgPath: RequiredString,
  used: UsedSchema
})

const userSchema = new Schema<User & Document>({
  name: RequiredString,
  password: SafeString,
  role: String,
  cart: Array
})

export const Product = (models.Product as Model<Product & Document>) || model('Product', productSchema);
export const Filter = (models.Filter as Model<Filter & Document>) || model('Filter', filterSchema);
export const Group = (models.Group as Model<Group & Document>) || model('Group', groupSchema);
export const User = (models.User as Model<User & Document>) || model('User', userSchema);

export const safeUserProjection: Projection<Partial<User>, 0> = { password: 0 }