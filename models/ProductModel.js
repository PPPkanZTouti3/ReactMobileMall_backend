/*
能操作product集合数据的Model
 */
// 1.引入mongoose
const mongoose = require('mongoose')
const now = require('../utils/dateUtils')

// 2.字义Schema(描述文档结构)
const productSchema = new mongoose.Schema({
  groupId: {type: String, default: ''},
  name: {type: String, default: ''}, // 名称
  description: String,
  defaultPrice: {type: Number}, // 小卡片上显示的价格
  image: {type: Array, default: []}, // 总览图片
  detailProduct: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: mongoose.Types.ObjectId()
    },
    stockNum: {type: Number, default: 139},
    productId: {type: String, default: ''},
    price: {type: Number, required: true},
    img: {type: Array, default: []}, // 具体图片
    status: {type: Number, default: 1}, // 1 在售  0 下架
    attri: [
      {
        attri_id: {
          type: String,
          ref: 'product_attri'
        }
      }
    ]
  }],
  sales: Number,
  tags: {
    type: String,
    default: ''
  },
  createdAt: {
    type: String,
  },
  updatedAt: {
    type: String,
  },
  introduction: {
    type: Array,
    default: []
  }
},
{
  collection: 'product'
})


// 3. 定义Model(与集合对应, 可以操作集合)
const ProductModel = mongoose.model("product", productSchema)

// 4. 向外暴露Model
module.exports = ProductModel