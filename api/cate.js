const router = require('koa-router')();
const util = require('../../models/util.js');
const fs = require('fs');
const path = require('path');

router.get('/', async (ctx)=>{
    let cate = fs.readFileSync(path.join(__dirname,'../../static/cate.json'),'utf8')
    ctx.body=JSON.parse(cate)
})
module.exports = router.routes()