/*
能操作users集合数据的Model
 */
// 1.引入mongoose
const mongoose = require('mongoose')
const md5 = require('blueimp-md5')
const now = require('../utils/dateUtils')

// 2.字义Schema(描述文档结构)
const userSchema = new mongoose.Schema({
  userId: {type: String, required: true}, // 用户id
  userName: {type: String, required: true, unique: true}, // 用户名
  password: {type: String, required: true}, // 密码
  nickName: String,
  phone: {type: String, required: true, unique: true},
  email: String,
  profile: {
    type: String,
    default: 'data:image/jpeg;base64,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'
  },
  gender: {type: Number, default: 1},
  points: Number,
  address: [{
    addressId: String,
    recipient: String,
    phone: String,
    province: String,
    city: String,
    area: String,
    address: String,
    isDefault: Number,
    createdAt: String,
    updatedAt: String,
  }],
  createdAt: {type: String, default: now},
  updatedAt: {type: String, default: now},
})

// 3. 定义Model(与集合对应, 可以操作集合)
const UserModel = mongoose.model('users', userSchema)

// 初始化默认超级管理员用户: admin/admin
// UserModel.findOne({userName: 'admin'}).then(user => {
//   if(!user) {
//     UserModel.create({userName: 'admin', password: md5('admin')})
//             .then(user => {
//               console.log('初始化用户: 用户名: admin 密码为: admin')
//             })
//   }
// })

// 4. 向外暴露Model
module.exports = UserModel