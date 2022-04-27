/*
能操作order集合数据的Model
 */
// 1.引入mongoose
const mongoose = require('mongoose')
const now = require('../utils/dateUtils')

// 2.字义Schema(描述文档结构)
const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    addressId: {
        type: String,
        required: true
    },
    expressCompany: String,
    expressNumber: String, // 快递单号
    payStatus: { type: Number, default: 0 }, // 0待支付 1已支付，待发货 2运送中 3已完成
    // 运费
    deliveryFee: Number,
    // 商品费用
    productPrice: Number,
    totalPrice: Number,
    // 开始支付时间
    payStartTime: String,
    createdAt: {
        type: String,
        default: now
    },
    updatedAt: {
        type: String,
        default: now
    }
}, {
    collection: 'order'
})

// 3. 定义Model(与集合对应, 可以操作集合)
const OrderModel = mongoose.model('order', orderSchema)

// 4. 向外暴露Model
module.exports = OrderModel