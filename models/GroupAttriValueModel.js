/*
能操作group_attri_value集合数据的Model
 */
// 1.引入mongoose
const mongoose = require('mongoose')
const now = require('../utils/dateUtils')

// 2.字义Schema(描述文档结构)
const groupAttriValueSchema = new mongoose.Schema({
    groupAttriValueId: {
        type: String,
        required: true
    },
    groupAttriId: {
        type: String,
        required: true,
        ref: 'group_attri'
    },
    // 商品属性值的名称
    attriValue: String,
    createdAt: {
        type: String,
        default: now
    },
    updatedAt: {
        type: String,
        default: now
    }
}, {
    collection: 'group_attri_value'
})

// 3. 定义Model(与集合对应, 可以操作集合)
const GroupAttriValueModel = mongoose.model('group_attri_value', groupAttriValueSchema)

// 4. 向外暴露Model
module.exports = GroupAttriValueModel