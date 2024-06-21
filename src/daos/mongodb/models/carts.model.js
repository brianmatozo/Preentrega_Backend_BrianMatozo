const {Schema, model, default: mongoose} = require("mongoose")
const mongoosePaginate = require('mongoose-paginate-v2')

const cartCollectionName = "carts";

const cartSchema = new Schema({
    products: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'products',
          required: true,
        },
        quantity: {
          type: Number,
          default: 1 
        },
      }
    ]
});

cartSchema.plugin(mongoosePaginate);

const CartModel = model(cartCollectionName, cartSchema)

module.exports={
    CartModel
}