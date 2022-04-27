const router = require('koa-router')();
const md5 = require('../../models/util.js');
const fs = require('fs');
const path = require('path');
const UserModel = require('../../models/UserModel')

// router.post('/register', async (ctx) => {
//     // 读取请求参数数据
//     console.log(ctx)
//     let {status, userName, password} = ctx.request.body
//     ctx.body = 'ok'
//     // if(status===0){
//     //     let order_list = fs.readFileSync(path.join(__dirname,'../../static/order_list.json'),'utf8')
//     //     ctx.body=JSON.parse(order_list)
//     // }else{
//     //     ctx.body={
//     //         "pageNumber": 1,
//     //         "code": 0,
//     //         "data": [],
//     //         "totalPages": 1,
//     //         "pageSize": 10,
//     //         "message": "操作成功"
//     //     }
//     // }
//     // const {
//     //     userName,
//     //     password
//     // } = req.body
//     // 处理: 判断用户是否已经存在, 如果存在, 返回提示错误的信息, 如果不存在, 保存
//     // 查询(根据userName)
//     // UserModel.findOne({
//     //         userName
//     //     })
//     //     .then(user => {
//     //         // 如果user有值(已存在)
//     //         if (user) {
//     //             // 返回提示错误的信息
//     //             res.send({
//     //                 status: 1,
//     //                 msg: '此用户已存在'
//     //             })
//     //             return new Promise(() => {})
//     //         } else { // 没值(不存在)
//     //             // 保存
//     //             return UserModel.create({
//     //                 ...req.body,
//     //                 password: md5(password)
//     //             })
//     //         }
//     //     })
//     //     .then(user => {
//     //         // 返回包含user的json数据
//     //         res.send({
//     //             status: 0,
//     //             data: user
//     //         })
//     //     })
//     //     .catch(error => {
//     //         console.error('注册异常', error)
//     //         res.send({
//     //             status: 1,
//     //             msg: '添加用户异常, 请重新尝试'
//     //         })
//     //     })
// })


// router.post("/register", async ctx => {
//     //接收参数 post
//     console.log(ctx.request.body);
//     const findResult = await UserModel.find({
//         userName: ctx.request.body.userName
//     });
//     console.log(findResult);
//     //判断是否存在该用户
//     if(findResult.length > 0){
//         //状态码
//         ctx.status = 400;
//         ctx.body = {
//             status: 400,
//             message: "用户名已经被占用"
//         }
//     }else{
//         //存储到数据库
//         const newUser = new UserModel({
//             password: ctx.request.body.password,
//             userName: ctx.request.body.userName
//         })
//         //返回给客户端 一定要await 否则会返回Not Found
//         await newUser.save().then(user =>{
//             console.log(user);
//             ctx.status = 200;
//             ctx.body = {
//                 status: 200,
//                 message: "注册成功",
//                 userInfo: user
//             }
//         }).catch(err =>{
//             console.log(err);
//         })  
//     }
// })

router.post('/register', ctx => {
    console.log(ctx)
    ctx.body = {
        message: '233'
    }
})

module.exports = router.routes()