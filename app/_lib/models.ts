import { Document, Model, ObjectId, Schema, model, models } from 'mongoose';

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
  role: String
}, {
  versionKey: false
})

type CartFromDB = Omit<Cart, 'userID'> & { userID: ObjectId }
const cartSchema = new Schema<CartFromDB & Document>({
  userID: { type: Schema.Types.ObjectId, ref: 'User' },
  products: [{
    ID: { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number
  }]
})

export const Product = (models.Product as Model<Product & Document>) || model('Product', productSchema, 'products');
export const Filter = (models.Filter as Model<Filter & Document>) || model('Filter', filterSchema);
export const Group = (models.Group as Model<Group & Document>) || model('Group', groupSchema);
export const User = (models.User as Model<User & Document>) || model('User', userSchema);
export const Cart = (models.Cart as Model<Cart & Document>) || model('Cart', cartSchema);