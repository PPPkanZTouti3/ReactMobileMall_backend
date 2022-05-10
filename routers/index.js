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
const OrderModel = require('../models/OrderModel')
const OrderProductModel = require('../models/OrderProductModel')
const CollectionModel = require('../models/CollectionModel')
const UserProductModel = require('../models/UserProductModel')
const HistoryModel = require('../models/HistoryModel')
const RoleModel = require('../models/RoleModel')
const now = require('../utils/dateUtils')
const userProdUtils = require('../utils/userProdUtils')
const { RecommendUserService } = require('../utils/CF')
const prodFormatUtils = require('../utils/prodFormatUtils')
const mongoose = require('mongoose')
const alipaySdk = require('./alipaySdk')
const axios = require('axios')
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
  user.updatedAt = now();
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
  address.updatedAt = now();
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
        createdAt: now(),
        updatedAt: now()
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
    
    targetAddress.updatedAt = now();
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
})

// 获取购物车信息
router.get('/getCart', (req, res) => {
  const { userId } = req.query;
  CartModel.find({ userId }).then(cart => {
    res.send({
      data: cart
    })
  })
})

// 添加至购物车
router.post('/addToCart', (req, res) => {
  const { groupId, productId, count, userId, score } = req.body;
  UserProductModel.findOne({userId, groupId}).then(prod => {
    prod.score += Number(score);
    prod.updatedAt = now();
    prod.save()
  }).catch(() => {
    UserProductModel.create({
      groupId,
      userId,
      score:Number(score),
      createdAt: now(),
      updatedAt: now()
    })
  })
  CartModel.findOne({productId, userId}).then(prod => {
    prod.count += Number(count);
    prod.updatedAt = now();
    prod.save();
    res.send({
      status: 0,
      msg: '添加成功'
    })
  }).catch(() => {
    CartModel.create({
      ...req.body,
      createdAt: now(),
      updated: now()
    })
    res.send({
      status: 0,
      msg: '添加成功'
    })
  })
})

router.post('/delCartProd', (req, res) => {
  const { _ids } = req.body;
  _ids.length && _ids.forEach(_id => {
    CartModel.deleteOne({_id}).catch(err => {
      return res.send({
        status: 1,
        msg: '删除异常'
      })
    })
  })
  res.send({
    status: 0,
    msg: '删除成功'
  })
})

// 在线支付
router.post('/pay', (req, res) => {

})

// 生成订单
router.post('/addOrder', (req, res) => {
  const {
    orderId,
    products,
    userId,
    addressId,
    payStatus,
    deliveryFee,
    productPrice,
    totalPrice,
    payStartTime,
    payEndTime,
  } = req.body

  try {
    products.map(item => {
      OrderProductModel.create({
        userId,
        orderId,
        productId: item.skuId,
        price: item.productPrice,
        count: item.selectQuantity,
        productName: item.productName,
        productImage: item.productImage,
        groupId: item.productId,
        desc: item.skuStr,
        createdAt: now(),
        updatedAt: now()
      })
    })
  
    OrderModel.create({
      orderId,
      userId,
      addressId,
      payStatus,
      payStartTime,
      payEndTime,
      deliveryFee,
      productPrice,
      totalPrice,
      createdAt: now(),
      updatedAt: now()
    })
  
    res.send({
      status: 0,
      msg: '添加订单成功'
    })
  }
  catch(err) {
    res.send({
      status: 1,
      msg: '添加订单异常'
    })
  }
  
})

// 取消订单
router.post('/cancelOrder', (req, res) => {
  const { orderId } = req.body;
  OrderModel.deleteOne({ orderId }).then(() => {
  }).catch(err => {
    res.send({
      status: 1,
      msg: '订单取消异常'
    })
  })
  OrderProductModel.deleteMany({ orderId }).then(() => {
    res.send({
      status: 0,
      msg: '订单取消成功'
    })
  }).catch(err => {
    res.send({
      status: 1,
      msg: '订单取消异常'
    })
  })
  
})

// 获取订单信息
router.get('/getOrderList', async (req, res) => {
  const { userId } = req.query;
  let order = await OrderModel.find({userId})
  let data = {}
  data = JSON.parse(JSON.stringify(order))
  order.forEach(async (item, i) => {
    let tmp = JSON.parse(JSON.stringify(item))
    let products = await OrderProductModel.find({orderId: tmp.orderId})
    products = JSON.parse(JSON.stringify(products))
    
    data[i].products = products;
    if(i === order.length - 1) {
      res.send({
        status: 0,
        data
      })
    }
  })
  
})

// 获取订单详情
router.get('/getOrderDetail', async (req, res) => {
  const { orderId } = req.query;
  let order = await OrderModel.find({orderId})
  let data = {}
  data = JSON.parse(JSON.stringify(order))
  order.forEach(async (item, i) => {
    let tmp = JSON.parse(JSON.stringify(item))
    let products = await OrderProductModel.find({orderId: tmp.orderId})
    products = JSON.parse(JSON.stringify(products))
    data[i].products = products;
    if(i === order.length - 1) {
      res.send({
        status: 0,
        data
      })
    }
  })
  
})

// 处理订单超时
router.post('/setOrderOverTime', (req, res) => {
  const { orderId } = req.body;

  OrderModel.findOne({orderId}).then(item => {
    item.isOverTime = 1;
    item.save();
    res.send({
      status: 0,
      msg: '订单超时处理成功'
    })
  })
  .catch(err => {
    res.send({
      status: 1,
      msg: '订单超时处理异常'
    })
  })
})

// 处理订单状态 为1
router.post('/orderHasPayed', (req, res) => {
  const { orderId } = req.body;
  OrderModel.findOne({orderId}).then(order => {
    order.payStatus = 1;
    order.save();
    res.send({
      status: 0,
      msg: '订单支付成功'
    })
  }).catch(err => {
    res.send({
      status: 1,
      msg: '订单支付异常'
    })
  })
})

// 购买成功后处理库存和销量
router.post('/handleSalesAndStock', async (req, res) => {
  const {productList} = req.body;
  productList.length&&productList.map(async (item) => {
    let product = await ProductModel.findOne({_id: item.productId});
    // console.log(product)
    product.sales += item.selectQuantity;
    if(product.detailProduct && product.detailProduct.length){
      product.detailProduct.map((prod) => {
        if(prod._id.toString() === item.skuId) {
          
          prod.stockNum -= item.selectQuantity;
          // prod.save();
          // console.log(prod.stockNum, product.sales)
          product.save();
        }
      })
    }
  })
  res.send({
    status: 0,
    msg: '销量和库存修改成功'
  })
  
})

// 获取购物车列表
router.get('/cartList', (req, res) => {
  // // 跨域
  // var reqOrigin = req.header("origin");
 
  // if(reqOrigin !=undefined && reqOrigin.indexOf("http://localhost:3000") > -1){
  // //设置允许 http://localhost:3000 这个域响应
  //   res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  //   res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  //   res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  // }
  // let data = JSON.parse(fs.readFileSync(path.join(__dirname,'../mock/cart.json'),'utf8'))
  const {userId} = req.query
  CartModel.find({userId}).then((item) => {
    res.send({
      data: item,
      status: 0
    })
  }).catch(err => {
    res.send({
      status: 1,
      msg: '获取购物车列表异常'
    })
  })
  
})

// 添加商品 用于mock
router.post('/addProd', (req, res) => {
  console.log(req.body)
  req.body.list.map(item => {
    ProductModel.create({
      ...item,
      createdAt: now(),
      updatedAt: now(),
    })
  })
  
  res.send({
    status: 0,
    msg: 'success'
  })
    
})

// 搜索商品
router.get('/searchProd', (req, res) => {
  const { val } = req.query;
  let reg = new RegExp(val, 'i');
  ProductModel.find({
    $or : [
        {name : {$regex : reg}},
        {tags : {$regex : reg}}
    ]
  },).then(data => {
    res.send({
      status: 0,
      data
    })
  })
  .catch(err => {
    res.send({
      status: 1,
      msg: err
    })
  })
})

// 推荐模块 搜索商品
router.post('/searchProdFunc', async (req, res) => {
  const { val, score, userId } = req.body;
  let reg = new RegExp(val, 'i');
  let data = await ProductModel.find({
    $or : [
        {name : {$regex : reg}},
        {tags : {$regex : reg}}
    ]
  },)
  data && data.map(item => {
    UserProductModel.findOne({userId, groupId: item.groupId}).then((prod) => {
      prod.score += Number(score);
      prod.updatedAt = now();
      prod.save()
      res.send({
        msg: 'updated success'
      })
    }).catch(() => {
      UserProductModel.create({
        groupId: item.groupId,
        userId,
        score: Number(score),
        createdAt: now(),
        updatedAt: now()
      })
      res.send({
        msg: 'created success'
      })
    })
  })
})

// 获取用户收藏列表
router.get('/collection', (req, res) => {
  const {_id} = req.query;
  CollectionModel.find({userId: _id}).populate('groupId').then(data => {
    res.send({
      status: 0,
      data
    })
  }).catch(err => {
    res.send({
      status: 1,
      msg: err
    })
  })
})

// 添加至收藏夹
router.post('/addToCollection', (req, res) => {
  const { groupId, userId, score } = req.body;
  CollectionModel.findOne({userId, groupId}).then(item => {
    if(item) {
      res.send({
        status: 1,
        msg: '该商品已收藏'
      })
      return false;
    }
    else {
      UserProductModel.findOne({userId, groupId}).then((item) => {
        item.score += Number(score);
        item.updatedAt = now();
        item.save()
      }).catch(() => {
        UserProductModel.create({
          userId,
          groupId,
          score: Number(score),
          createdAt: now(),
          updatedAt: now()
        })
      })
      CollectionModel.create({
        groupId,
        userId,
        createdAt: now(),
        updatedAt: now()
      }).then(() => {
        res.send({
          status: 0,
          msg: '添加至收藏夹成功'
        })
      }).catch(err => {
        console.log(err)
        res.send({
          status: 1,
          msg: '添加至收藏夹异常' + err
        })
      })
    }
  })
})

// 检查是否已经收藏
router.get('/checkCollected', (req, res) => {
  const {userId, groupId} = req.query;
  CollectionModel.findOne({userId, groupId}).then(item => {
    if(item) {
      res.send({
        status: 0,
        data: 1
      })
    }
    else {
      res.send({
        status: 0,
        data: 0
      })
    }
  }).catch(err => {
    res.send({
      status: 0,
      msg: '查询是否收藏异常'
    })
  })
})

// 取消收藏
router.post('/delCollection', (req, res) => {
  const { userId, groupId, score } = req.body;
  UserProductModel.findOne({userId, groupId}).then((item) => {
    item.score -= Number(score);
    item.updatedAt = now();
    item.save()
  })
  CollectionModel.deleteOne({
    userId,
    groupId
  }).then(() => {
    res.send({
      status: 0,
      msg: '取消收藏成功'
    })
  }).catch(err => {
    res.send({
      status: 1,
      msg: '取消收藏异常' + err
    })
  })
})

// 浏览商品
router.post('/watchProd', (req, res) => {
  const {userId, groupId, score} = req.body;
  HistoryModel.findOne({
    userId,
    groupId
  }).then(item => {
    item.updatedAt = now();
    item.save();
  }).catch(() => {
    HistoryModel.create({
      userId,
      groupId,
      createdAt: now(),
      updatedAt: now()
    })
  })
  UserProductModel.findOne({userId, groupId}).then(item => {
    item.score += Number(score)
    item.updatedAt = now();
    item.save();
    res.send({
      msg: 'updated success'
    })
  })
  .catch(() => {
    UserProductModel.create({
      ...req.body,
      createdAt: now(),
      updatedAt: now()
    })
    res.send({
      msg: 'created success'
    })
  })
})

// 获取浏览商品信息
router.get('/browseInfo', (req, res) => {
  const {userId} = req.query
  HistoryModel.find({userId}).populate('groupId').then(data => {
    data = data.sort((a, b) => {
      if(a.updatedAt > b.updatedAt) return -1;
      return 1
    })
    res.send({
      data,
      status: 0
    })
  })
})

router.post('/buyProd', (req, res) => {
  const {userId, productList, score} = req.body;
  if(productList && productList.length) {
    productList.map(item => {
      UserProductModel.findOne({userId, groupId: item.productId})
      .then(prod => {
        prod.score += Number(score);
        prod.updatedAt = now()
        prod.save();
        res.send({
          msg: 'updated success'
        })
      })
      .catch(() => {
        UserProductModel.create({
          userId,
          groupId: item.productId,
          score: Number(score),
          createdAt: now(),
          updatedAt: now()
        })
        res.send({
          msg: 'created success'
        })
      })
    })
  }
  else {
    UserProductModel.findOne({userId, groupId: productList.productId})
      .then(prod => {
        prod.score += Number(score);
        prod.save();
        res.send({
          msg: 'updated success'
        })
      })
      .catch(() => {
        UserProductModel.create({
          userId,
          groupId: productList.productId,
          score: Number(score),
          createdAt: now(),
          updatedAt: now()
        })
        res.send({
          msg: 'created success'
        })
      })
  }
  
})

// 销量排行
router.get('/sales', (req, res) => {
  ProductModel.find({}).then(data => {
    data = data.sort((a,b) => b.sales - a.sales).slice(0, 10);
    res.send({
      status: 0,
      data
    })
  }).catch(() => {
    res.send({
      status: 1,
      msg: 'err'
    })
  })
})

// 新品发售
router.get('/news', (req, res) => {
  ProductModel.find({}).then(data => {
    data = data.sort((a,b) => {
      if(a.createdAt > b.createdAt) return -1;
      return 1;
    }).slice(0, 10);
    res.send({
      status: 0,
      data
    })
  }).catch(() => {
    res.send({
      status: 1,
      msg: 'err'
    })
  })
})

// 推荐商品
router.get('/recommend', async (req, res) => {
  const {userId} = req.query;
  let users = await UserModel.find({});
  users = users.map(user => user._id)
  let dataList = []
  let temp = []
  users.forEach(async (_id, i) => {
    let data = await UserProductModel.find({userId: _id})
      data.sort((a, b) => b.score - a.score);
      if(data.length > 200) data = data.slice(0, 200);
      temp = temp.concat(data)
      if(i == 0) {

        dataList = dataList.concat(temp);
        let ans = userProdUtils(dataList);
        const recommendUserService = new RecommendUserService(ans, userId, 3)
        const result = recommendUserService.start()
        res.send({
          data: result,
          status: 0
        })
      }
  })

    
})

router.post('/recommendProd', (req, res) => {
  let data = [];
  const {prodList} = req.body;
  prodList.map( async (_id, i) => {
    let prod = await ProductModel.findOne({_id})
    // console.log(prod)
    data.push(prod)
    if(i == prodList.length - 1) {
      res.send({
        data,
        status: 0
      })
    }
  })
  
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

/**
 * 支付宝支付api
 */
router.get('/aliPay', async (req, res) => {

  const { orderId, totalPrice } = req.query;
  // sdk签名
  const AlipayFormData = require("alipay-sdk/lib/form").default;
  const formData = new AlipayFormData();
  formData.setMethod('get');
  formData.addField('bizContent', {
    outTradeNo: orderId, // 商户订单号,64个字符以内、可包含字母、数字、下划线,且不能重复
    productCode: 'FAST_INSTANT_TRADE_PAY', // 销售产品码，与支付宝签约的产品码名称,仅支持FAST_INSTANT_TRADE_PAY
    totalAmount: totalPrice + '', // 订单总金额，单位为元，精确到小数点后两位
    subject: '商品', // 订单标题
    body: '商品详情', // 订单描述
  });
  // 表示异步通知回调,
  // formData.addField('notifyUrl', 'https://www.baidu.com');
  // 付款成功的跳转页面
  formData.addField('returnUrl', 'http://localhost:3000/#/success_pay/' + orderId);


  let data = await alipaySdk.exec(
    'alipay.trade.wap.pay',
    {},
    {
      formData: formData
    }, 
  // { validateSign: true }).then(result => {
  //   console.log('支付宝返回支付链接：',result);
  //   res.send(result)
  // }
  );
  res.send(data)
})

router.post('/queryOrderAlipay', (req, res) => {
  let orderId=req.body.orderId
  const AlipayFormData = require("alipay-sdk/lib/form").default;
  const formData = new AlipayFormData();
  formData.setMethod('get');
  formData.addField('bizContent', {
    orderId
  });
  // 通过该接口主动查询订单状态
  const result = alipaySdk.exec(
    'alipay.trade.query',
    {},
    { formData: formData },
  );
  axios({
    method: 'GET',
    url: result
  })
    .then(data => {
      let r = data.data.alipay_trade_query_response;
      if(r.code === '10000') { // 接口调用成功
        switch(r.trade_status) {
          case 'WAIT_BUYER_PAY':
            res.send(
              {
                "success": true,
                "message": "success",
                "code": 200,
                "timestamp": (new Date()).getTime(),
                "result": {
                  "status":0,
                  "massage":'交易创建，等待买家付款'
                }
              }
            )
            break;
          case 'TRADE_CLOSED':
            res.send(
              {
                "success": true,
                "message": "success",
                "code": 200,
                "timestamp": (new Date()).getTime(),
                "result": {
                  "status":1,
                  "massage":'未付款交易超时关闭，或支付完成后全额退款'
                }
              }
            )
            break;
          case 'TRADE_SUCCESS':
            res.send(
              {
                "success": true,
                "message": "success",
                "code": 200,
                "timestamp": (new Date()).getTime(),
                "result": {
                  "status":2,
                  "massage":'交易支付成功'
                }
              }
            )
            break;
          case 'TRADE_FINISHED':
            res.send(
              {
                "success": true,
                "message": "success",
                "code": 200,
                "timestamp": (new Date()).getTime(),
                "result": {
                  "status":3,
                  "massage":'交易结束，不可退款'
                }
              }
            )
            break;
        }
      } else if(r.code === '40004') {
        res.send('交易不存在');
      }
    })
    .catch(err => {
      res.json({
        msg: '查询失败',
        err
      });
    });

})


/**
 * 将爬虫得到的数据 添加到数据库
 * 
 */
router.post('/spider', (req, res) => {
  const { list } = req.body;
  list.map(item => {
    ProductModel.findOne({name: item.商品名称}).then(prod => {
      prod.groupId = prod._id.toString()
      prod.image.unshift(item.图片地址)
      prod.detailProduct.map(detailProd => {
        detailProd.productId = detailProd._id.toString()
        detailProd.price = prod.defaultPrice
        detailProd.save()
      })
      prod.save()
    })
  })
  res.send({
    msg: 'success'
  })
})

router.post('/checkdata', (req, res) => {
  // ProductModel.deleteMany({groupId: ''}).catch((err) => {
  //   res.send({
  //     err
  //   })
  // })
  ProductModel.find({}).then(ans => {
    ans.forEach(item => {
      
      if(!item.image[0]) {
        console.log(item)
        item.image.shift()
        item.save()
      }
    })
  }).then(() => {
    res.send({
      msg: 'success'
    })
  }).catch(err => {
    res.send({
      err
    })
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