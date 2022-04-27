// CORS→Cross Origin Resource Sharing
function corsUtils(req,res,next){
    // 设置可以用如下三行的写法即三个res.header,也可以用对象去写即res.set({}).二选一即可
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    // res.header("Access-Control-Allow-Methods","PUT,POST,GET,PATCH,DELETE,OPTIONS");
    res.set({
        "Access-Control-Allow-Origin":"*",
        "Access-Control-Allow-Headers":"Content-Type,Content-Length, Authorization, Accept,X-Requested-With",
        "Access-Control-Allow-Methods":"PUT,POST,GET,PATCH,DELETE,OPTIONS",
    })
    // 跨域请求CORS中的预请求
    if(req.method=="OPTIONS") {
        res.sendStatus(200);/*让options请求快速返回*/
    } else{
        next();
    }
}
// corsky:表示cors跨域
module.exports={corsUtils}
