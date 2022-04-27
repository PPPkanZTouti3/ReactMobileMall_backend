/*
能操作collection集合数据的Model
 */
// 1.引入mongoose
const mongoose = require('mongoose')
const now = require('../utils/dateUtils')

// 2.字义Schema(描述文档结构)
const collectionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    // 之收藏商品的大类
    groupId: {
        type: String,
        required: true
    },
    createdAt: {
        type: String,
        default: now
    },
    updatedAt: {
        type: String,
        default: now
    }
},
{
    collection: 'collection'
})

// 3. 定义Model(与集合对应, 可以操作集合)
const CollectionModel = mongoose.model('collection', collectionSchema)

// 4. 向外暴露Model
module.exports = CollectionModel