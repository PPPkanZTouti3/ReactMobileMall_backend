/*
能操作product_attri集合数据的Model
 */
// 1.引入mongoose
const mongoose = require('mongoose')
const now = require('../utils/dateUtils')

// 2.字义Schema(描述文档结构)
const productAttriSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'product'
    },
    groupAttriValueId: {
        type: String,
        required: true,
        ref: 'group_attri_value'
    },
    createdAt: {
        type: String,
        default: now
    },
    updatedAt: {
        type: String,
        default: now
    }
}, {
    collection: 'product_attri'
})

// 3. 定义Model(与集合对应, 可以操作集合)
const ProductAttriModel = mongoose.model('product_attri', productAttriSchema)

// 4. 向外暴露Model
module.exports = ProductAttriModel