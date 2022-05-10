/*
能操作order_product集合数据的Model
 */
// 1.引入mongoose
const mongoose = require('mongoose')

// 2.字义Schema(描述文档结构)
const orderProductSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    orderId: {
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
    cartId: String,
    price: Number,
    count: Number,
    desc: String,
    productName: String,
    productImage: String,
    createdAt: {
        type: String,
    },
    updatedAt: {
        type: String,
    }
}, {
    collection: 'order_product'
})

// 3. 定义Model(与集合对应, 可以操作集合)
const OrderProductModel = mongoose.model('order_product', orderProductSchema)

// 4. 向外暴露Model
module.exports = OrderProductModel