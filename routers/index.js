/*
用来定义路由的路由器模块
 */
const fs = require('fs');
const path = require('path');
const express = require('express')
const md5 = require('blueimp-md5')
const { v4: uuidv4 } = require('uuid');
const UserModel = require('../models/UserModel')
const CategoryModel = require('../models/CategoryModel')
const ProductModel = require('../models/ProductModel')
const CartModel = require('../models/CartModel')
const ProductAttriModel = require('../models/ProductAttriModel')
const GroupAttriModel = require('../models/GroupAttriModel')
const GroupAttriValueModel = require('../models/GroupAttriValueModel')
const RoleModel = require('../models/RoleModel')
const now = require('../utils/dateUtils')
const prodFormatUtils = require('../utils/prodFormatUtils')
const mongoose = require('mongoose')

// 得到路由器对象
const router = express.Router()
// console.log('router', router)

// 指定需要过滤的属性
const filter = {
  password: 0,
  __v: 0
}

/**
 * 用户api
 */
// 登陆
router.post('/login', (req, res) => {
  const {
    userName,
    password
  } = req.body
  // 根据userName和password查询数据库users, 如果没有, 返回提示错误的信息, 如果有, 返回登陆成功信息(包含user)
  UserModel.findOne({
      userName,
      password: md5(password)
    })
    .then(user => {
      if (user) { // 登陆成功
        // 生成一个cookie(userid: user._id), 并交给浏览器保存
        res.cookie('userId', user.userId, {
          maxAge: 1000 * 60 * 60 * 24
        })
        
        // 返回登陆成功信息(包含user)
        res.send({
          status: 0,
          data: user
        })
        

      } else { // 登陆失败
        res.send({
          status: 1,
          msg: '用户名或密码不正确!'
        })
      }
    })
    .catch(error => {
      console.error('登陆异常', error)
      res.send({
        status: 1,
        msg: '登陆异常, 请重新尝试'
      })
    })
})

// 注册
router.post('/register', (req, res) => {
  // 读取请求参数数据
  const {
    userName,
    password,
    phone
  } = req.body
  // 处理: 判断用户是否已经存在, 如果存在, 返回提示错误的信息, 如果不存在, 保存
  // 查询(根据userName)
  console.log(req.body)
  UserModel.findOne({
      userName
    })
    .then(user => {
      // 如果user有值(已存在)
      if (user) {
        // 返回提示错误的信息
        res.send({
          status: 1,
          msg: '此用户已存在'
        })
        return new Promise(() => {})
      }})
  UserModel.findOne({ phone }).then(user => {
    if(user) {
      res.send({
        status: 1,
        msg: '手机号已存在' 
      })
      return;
    }
  })
      
      
      
    // 保存
    delete req.body.__v;
    delete req.body.create_time;
    
    UserModel.create(
      {...req.body,
        userId: uuidv4(),
        password: md5(password || '123456'),
        nickName: userName
      }
    )
    .then(user => {
      // 返回包含user的json数据
      res.send({
        status: 0,
        // 这里返回数据最好要隐藏一下
        msg: '注册成功' 
      })
    })
    .catch(error => {
      console.error('注册异常', error)
      res.send({
        status: 1,
        msg: '添加用户异常, 请重新尝试'
      })
    })
})

// 更新用户
router.post('/user/updateInfo', (req, res) => {
  let user = req.body;
  user.updatedAt = now;
  const { _id, userName, phone, email } = user;
  console.log('user',user)
  UserModel.findOne({ userName }).then(item => {
    console.log(item)
    if(item._id.toString() !== _id) {
      res.send({
        status: 1,
        msg: '用户名已存在' 
      })
    }
    return;
  })
  UserModel.findOne({ phone }).then(item => {
    console.log(item)
    if(item._id.toString() !== _id) {
      res.send({
        status: 1,
        msg: '手机号已存在' 
      })
      return;
    }
  })
  UserModel.findOne({ email }).then(item => {
    if(item._id.toString() !== _id) {
      res.send({
        status: 1,
        msg: '邮箱已存在' 
      })
    }
    return;
  })
  UserModel.findOneAndUpdate({
    _id: user._id
  }, user)
  .then(() => {
    // 返回
    res.send({
      status: 0,
      msg: '修改成功'
    })
  })
  .catch(error => {
    console.error('更新用户异常', error)
    res.send({
      status: 1,
      msg: '更新用户异常, 请重新尝试'
    })
  })
})

// 修改用户密码
router.post('/user/resetPwd', (req, res) => {
  const { _id, userName, oldPwd, newPwd } = req.body;
  UserModel.findOne({_id}).then(user => {
    if(user.userName === userName && user.password === md5(oldPwd)) {
      user.password = md5(newPwd)
      user.save();
    }
  })
  .then(() => {
    res.send({
      status: 0,
      msg: '密码修改成功'
    })
  })
  .catch(error => {
    console.error('修改密码异常', error)
    res.send({
      status: 1,
      msg: '修改密码异常, 请重新尝试'
    })
  })
})

// 找回密码
router.post('/user/findPwd', (req, res) => {
  const { userName, phone, newPwd } = req.body;
  UserModel.findOne({userName, phone}).then(user => {    
    user.password = md5(newPwd)
    user.save();    
  })
  .then(() => {
    res.send({
      status: 0,
      msg: '密码修改成功'
    })
  })
  .catch(error => {
    console.error('修改密码异常', error)
    res.send({
      status: 1,
      msg: '用户名或手机号错误'
    })
  })
})

// 添加地址
router.post('/addAddress', (req, res) => {
  let address = req.body;
  address.updatedAt = now;
  const { _id, isDefault } = address; //这里的id是用户id
  delete address._id;
  UserModel.findOne({ _id }).then(user => {
    if(isDefault) {
      user.address.map((item) => {
        item.isDefault = 0;
      })
    }
    user.address.push(
      {
        ...address,
        addressId: mongoose.Types.ObjectId(),
        createdAt: now,
        updatedAt: now
      }
    )
    user.save()
  })
  .then(() => {
    // 返回包含user的json数据
    res.send({
      status: 0,
      // 这里返回数据最好要隐藏一下
      msg: '添加成功' 
    })
  })
  .catch(error => {
    console.error('注册异常', error)
    res.send({
      status: 1,
      msg: '添加地址异常, 请重新尝试'
    })
  })
})

// 获取用户地址
router.get('/getAddress', (req, res) => {
  const { _id } = req.query; // user._id
  UserModel.findOne({_id}).then(user => {
    let data = user.address || [];
    if(data.length) {
      let isDefaultAddress = data.filter(item => {
        return item.isDefault === 1;
      });
      if(!isDefaultAddress.length) {
        data[0].isDefault = 1;
        user.save();
      }
    }
    res.send({
      data,
      status: 0
    })
  }).catch((error) => {
    res.send({
      status: 1,
      msg: '获取地址异常'
    })
  })
})

// 修改用户地址
router.post('/updateAddress', (req, res) => {
  let address = req.body;
  const { _id, addressId, isDefault, userId } = address;
  delete address.userId;
  delete address.addressId;
  delete address._id;
  UserModel.findOne({_id: userId}).then(user => {
    if(isDefault) {
      user.address.map((item) => {
        item.isDefault = 0;
      })
    }
    let targetAddress = user.address.filter((item)=> {
      return item._id.toString() === _id
    })[0]
    for(let k in address) {
      targetAddress[k] = address[k]
    }
    
    targetAddress.updatedAt = now;
    user.save();
  })
  .then(() => {
    res.send({
      status: 0,
      msg: '修改成功' 
    })
  })
  .catch(error => {
    console.error('修改异常', error)
    res.send({
      status: 1,
      msg: '修改地址异常, 请重新尝试'
    })
  })
})

// 删除用户地址
router.post('/deleteAddress', (req, res) => {
  const { addressId, userId } = req.body;
  UserModel.findOne({_id: userId}).then(user => {
    user.address.some((item, i) => {
      if(item._id.toString() === addressId) {
        user.address.splice(i,1)
      }
    })
    user.save()
  }).then(() => {
    res.send({
      status: 0,
      msg: '删除成功'
    })
  }).catch(error => {
    console.error('修改异常', error)
    res.send({
      status: 1,
      msg: '删除地址异常, 请重新尝试'
    })
  })
})


/**
 * 商品api
 */

//  根据groupId获取商品信息
router.get('/getProdByGroupId', (req, res) => {
  const { _id } = req.query; 
//   ProductModel.aggregate([
//     {
//       $lookup: {
//         from: "product_attri",
//         localField: "detailProduct.attri.attriId",
//         foreignField: "_id",
//         as: "attri"
//       }
//     },
//     // {
//     //   $group: {
//     //     _id: '$_id',
//     //     content_sum: {
//     //       $sum: 1
//     //     }
//     //   }
//     // }
//     {
//       $lookup: {
//         from: "group_attri_value",
//         localField: "attri.groupAttriValueId",
//         foreignField: "_id",
//         as: "attri2"
//       }
//     }
//   ],function(err,docs){
//     if(err){
//         console.log(err)
//         return;
//     }
//     console.log(JSON.stringify(docs))
//     res.send({docs})
// })
  
  ProductModel.findOne({ _id })
  .populate({
    path: 'detailProduct.attri.attriId',
    select: 'groupAttriValueId',
    model: ProductAttriModel,
    populate:{
      path: 'groupAttriValueId',
      select: 'attriValue groupAttriId',
      model: GroupAttriValueModel,
      populate: {
        path: 'groupAttriId',
        select: 'attriName',
        model: GroupAttriModel
      }
    }
  })
  .then((ans) => {
    let data = prodFormatUtils(ans)
    // console.log(ans)
    res.json({
        code: 0,
        data
    })
})

    
    // populate: {
    //    path: 'city',
    // }


})



/**======================================================== */
// 删除用户
router.post('/manage/user/delete', (req, res) => {
  const {
    userId
  } = req.body
  UserModel.deleteOne({
      _id: userId
    })
    .then((doc) => {
      res.send({
        status: 0
      })
    })
})

// 获取用户信息的路由(根据cookie中的userid)
/*router.get('/user', (req, res) => {
  // 从请求的cookie得到userid
  const userid = req.cookies.userid
  // 如果不存在, 直接返回一个提示信息
  if (!userid) {
    return res.send({status: 1, msg: '请先登陆'})
  }
  // 根据userid查询对应的user
  UserModel.findOne({_id: userid}, filter)
    .then(user => {
      if (user) {
        res.send({status: 0, data: user})
      } else {
        // 通知浏览器删除userid cookie
        res.clearCookie('userid')
        res.send({status: 1, msg: '请先登陆'})
      }
    })
    .catch(error => {
      console.error('获取用户异常', error)
      res.send({status: 1, msg: '获取用户异常, 请重新尝试'})
    })
})*/

// 获取所有用户列表
router.get('/manage/user/list', (req, res) => {
  UserModel.find({
      userName: {
        '$ne': 'admin'
      }
    })
    .then(users => {
      RoleModel.find().then(roles => {
        res.send({
          status: 0,
          data: {
            users,
            roles
          }
        })
      })
    })
    .catch(error => {
      console.error('获取用户列表异常', error)
      res.send({
        status: 1,
        msg: '获取用户列表异常, 请重新尝试'
      })
    })
})


// 添加分类
router.post('/manage/category/add', (req, res) => {
  const {
    categoryName,
    parentId
  } = req.body
  CategoryModel.create({
      name: categoryName,
      parentId: parentId || '0'
    })
    .then(category => {
      res.send({
        status: 0,
        data: category
      })
    })
    .catch(error => {
      console.error('添加分类异常', error)
      res.send({
        status: 1,
        msg: '添加分类异常, 请重新尝试'
      })
    })
})

// 获取分类列表
router.get('/manage/category/list', (req, res) => {
  const parentId = req.query.parentId || '0'
  CategoryModel.find({
      parentId
    })
    .then(categorys => {
      res.send({
        status: 0,
        data: categorys
      })
    })
    .catch(error => {
      console.error('获取分类列表异常', error)
      res.send({
        status: 1,
        msg: '获取分类列表异常, 请重新尝试'
      })
    })
})

// 更新分类名称
router.post('/manage/category/update', (req, res) => {
  const {
    categoryId,
    categoryName
  } = req.body
  CategoryModel.findOneAndUpdate({
      _id: categoryId
    }, {
      name: categoryName
    })
    .then(oldCategory => {
      res.send({
        status: 0
      })
    })
    .catch(error => {
      console.error('更新分类名称异常', error)
      res.send({
        status: 1,
        msg: '更新分类名称异常, 请重新尝试'
      })
    })
})

// 根据分类ID获取分类
router.get('/manage/category/info', (req, res) => {
  const categoryId = req.query.categoryId
  CategoryModel.findOne({
      _id: categoryId
    })
    .then(category => {
      res.send({
        status: 0,
        data: category
      })
    })
    .catch(error => {
      console.error('获取分类信息异常', error)
      res.send({
        status: 1,
        msg: '获取分类信息异常, 请重新尝试'
      })
    })
})


// 添加产品
router.post('/manage/product/add', (req, res) => {
  const product = req.body
  ProductModel.create(product)
    .then(product => {
      res.send({
        status: 0,
        data: product
      })
    })
    .catch(error => {
      console.error('添加产品异常', error)
      res.send({
        status: 1,
        msg: '添加产品异常, 请重新尝试'
      })
    })
})

// 获取产品分页列表
router.get('/manage/product/list', (req, res) => {
  const {
    pageNum,
    pageSize
  } = req.query
  ProductModel.find({})
    .then(products => {
      res.send({
        status: 0,
        data: pageFilter(products, pageNum, pageSize)
      })
    })
    .catch(error => {
      console.error('获取商品列表异常', error)
      res.send({
        status: 1,
        msg: '获取商品列表异常, 请重新尝试'
      })
    })
})

// 搜索产品列表
router.get('/manage/product/search', (req, res) => {
  const {
    pageNum,
    pageSize,
    searchName,
    productName,
    productDesc
  } = req.query
  let contition = {}
  if (productName) {
    contition = {
      name: new RegExp(`^.*${productName}.*$`)
    }
  } else if (productDesc) {
    contition = {
      desc: new RegExp(`^.*${productDesc}.*$`)
    }
  }
  ProductModel.find(contition)
    .then(products => {
      res.send({
        status: 0,
        data: pageFilter(products, pageNum, pageSize)
      })
    })
    .catch(error => {
      console.error('搜索商品列表异常', error)
      res.send({
        status: 1,
        msg: '搜索商品列表异常, 请重新尝试'
      })
    })
})

// 更新产品
router.post('/manage/product/update', (req, res) => {
  const product = req.body
  ProductModel.findOneAndUpdate({
      _id: product._id
    }, product)
    .then(oldProduct => {
      res.send({
        status: 0
      })
    })
    .catch(error => {
      console.error('更新商品异常', error)
      res.send({
        status: 1,
        msg: '更新商品名称异常, 请重新尝试'
      })
    })
})

// 更新产品状态(上架/下架)
router.post('/manage/product/updateStatus', (req, res) => {
  const {
    productId,
    status
  } = req.body
  ProductModel.findOneAndUpdate({
      _id: productId
    }, {
      status
    })
    .then(oldProduct => {
      res.send({
        status: 0
      })
    })
    .catch(error => {
      console.error('更新产品状态异常', error)
      res.send({
        status: 1,
        msg: '更新产品状态异常, 请重新尝试'
      })
    })
})


// 添加角色
router.post('/manage/role/add', (req, res) => {
  const {
    roleName
  } = req.body
  RoleModel.create({
      name: roleName
    })
    .then(role => {
      res.send({
        status: 0,
        data: role
      })
    })
    .catch(error => {
      console.error('添加角色异常', error)
      res.send({
        status: 1,
        msg: '添加角色异常, 请重新尝试'
      })
    })
})

// 获取角色列表
router.get('/manage/role/list', (req, res) => {
  RoleModel.find()
    .then(roles => {
      res.send({
        status: 0,
        data: roles
      })
    })
    .catch(error => {
      console.error('获取角色列表异常', error)
      res.send({
        status: 1,
        msg: '获取角色列表异常, 请重新尝试'
      })
    })
})

// 更新角色(设置权限)
router.post('/manage/role/update', (req, res) => {
  const role = req.body
  role.auth_time = Date.now()
  RoleModel.findOneAndUpdate({
      _id: role._id
    }, role)
    .then(oldRole => {
      // console.log('---', oldRole._doc)
      res.send({
        status: 0,
        data: {
          ...oldRole._doc,
          ...role
        }
      })
    })
    .catch(error => {
      console.error('更新角色异常', error)
      res.send({
        status: 1,
        msg: '更新角色异常, 请重新尝试'
      })
    })
})



/****
 * 模拟数据 后去可以删除
 */
router.get('/cartList', (req, res) => {
  // 跨域
  var reqOrigin = req.header("origin");
 
  if(reqOrigin !=undefined && reqOrigin.indexOf("http://localhost:3000") > -1){
  //设置允许 http://localhost:3000 这个域响应
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  }
  let data = JSON.parse(fs.readFileSync(path.join(__dirname,'../mock/cart.json'),'utf8'))
  res.send({
    data,
    status: 0
  })
})

router.get('/cate', (req, res) => {
  // 跨域
  var reqOrigin = req.header("origin");
 
  if(reqOrigin !=undefined && reqOrigin.indexOf("http://localhost:3000") > -1){
  //设置允许 http://localhost:3000 这个域响应
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  }
  let data = JSON.parse(fs.readFileSync(path.join(__dirname,'../mock/cate.json'),'utf8'))
  res.send({
    data,
    status: 0
  })
})

/*
得到指定数组的分页信息对象
 */
function pageFilter(arr, pageNum, pageSize) {
  pageNum = pageNum * 1
  pageSize = pageSize * 1
  const total = arr.length
  const pages = Math.floor((total + pageSize - 1) / pageSize)
  const start = pageSize * (pageNum - 1)
  const end = start + pageSize <= total ? start + pageSize : total
  const list = []
  for (var i = start; i < end; i++) {
    list.push(arr[i])
  }

  return {
    pageNum,
    total,
    pages,
    pageSize,
    list
  }
}

require('./file-upload')(router)

module.exports = router