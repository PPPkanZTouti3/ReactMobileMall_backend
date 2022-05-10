/*
能操作history集合数据的Model
 */
// 1.引入mongoose
const mongoose = require('mongoose')

// 2.字义Schema(描述文档结构)
const historySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    groupId: {
        type: String,
        required: true,
        ref: 'product'
    },
    createdAt: {
        type: String,
    },
    updatedAt: {
        type: String,
    }
}, {
    collection: 'history'
})

// 3. 定义Model(与集合对应, 可以操作集合)
const HistoryModel = mongoose.model('history', historySchema)

// 4. 向外暴露Model
module.exports = HistoryModel