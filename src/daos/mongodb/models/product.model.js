const {Schema, model} = require("mongoose")
const mongoosePaginate = require('mongoose-paginate-v2')

const productCollectionName = "products";

const productSchema = new Schema({
    title: {type: String, required: true},
    description: { type: String, required: true },
    code: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: Boolean, default: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    thumbnails: { type: [String], default: [] }
})

productSchema.plugin(mongoosePaginate);

const ProductModel = model(productCollectionName, productSchema)

module.exports = {
    ProductModel
}