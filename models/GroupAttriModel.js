/*
能操作group_attri集合数据的Model
 */
// 1.引入mongoose
const mongoose = require('mongoose')
const now = require('../utils/dateUtils')

// 2.字义Schema(描述文档结构)
const groupAttriSchema = new mongoose.Schema({
    groupAttriId: {
        type: String,
        required: true
    },
    // 商品属性名
    attriName: String,
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
    collection: 'group_attri'
})

// 3. 定义Model(与集合对应, 可以操作集合)
const GroupAttriModel = mongoose.model('group_attri', groupAttriSchema)

// 4. 向外暴露Model
module.exports = GroupAttriModel