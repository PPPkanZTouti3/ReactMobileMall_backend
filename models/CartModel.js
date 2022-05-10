/*
能操作cart集合数据的Model
 */
// 1.引入mongoose
const mongoose = require('mongoose')
const now = require('../utils/dateUtils')

// 2.字义Schema(描述文档结构)
const cartSchema = new mongoose.Schema({
    cartId: String,
    userId: {
        type: String,
        required: true
    },
    groupId: {
        type: String,
        required: true
    },
    productId: {
        type: String,
        required: true
    },
    productName: String,
    productImage: String,
    desc: String,
    price: Number,
    count: {
        type: Number,
        required: true,
        default: 1
    },
    stockNum: Number,
    createdAt: {
        type: String,
    },
    updatedAt: {
        type: String,
    }
},
{
    collection: 'cart'
})

// 3. 定义Model(与集合对应, 可以操作集合)
const CartModel = mongoose.model('cart', cartSchema)

// 4. 向外暴露Model
module.exports = CartModel