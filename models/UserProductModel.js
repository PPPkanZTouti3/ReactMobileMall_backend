/*
能操作user_product集合数据的Model
 */
// 1.引入mongoose
const mongoose = require('mongoose')
const now = require('../utils/dateUtils')

// 2.字义Schema(描述文档结构)
const userProductSchema = new mongoose.Schema({
    userProductId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    productId: {
        type: String,
        required: true
    },
    score: Number,
    createdAt: {
        type: String,
        default: now
    },
    updatedAt: {
        type: String,
        default: now
    }
}, {
    collection: 'user_product'
})

// 3. 定义Model(与集合对应, 可以操作集合)
const UserProductModel = mongoose.model('user_product', userProductSchema)

// 4. 向外暴露Model
module.exports = UserProductModel