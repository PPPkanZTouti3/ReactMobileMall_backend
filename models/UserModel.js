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
  email: {type: String, unique: true},
  profile: String,
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