const router = require('koa-router')();
const util = require('../../../models/util.js');
const fs = require('fs');
const path = require('path');

router.get('/list', async (ctx)=>{
    let goodslist = [
        {
          title:'华硕(ASUS) 灵耀S 2代 14英寸三面微边超轻薄笔记本电脑',
          desc:'(i7-8550U 8G 256GSSD MX150 2G IPS)金色(S4300)',
          cover:'//img12.360buyimg.com/n2/s240x240_jfs/t22732/232/1180670442/162217/dfc29f00/5b554638Ne26882b5.jpg!q70.jpg.webp',
          price:5999.00,
          volume:652,
          id:100000
        },
        {
          title:'Apple MacBook Air 13.3英寸笔记本电脑',
          desc:'银色(2017款Core i5 处理器/8GB内存/128GB闪存 MQD32CH/A)  ',
          cover:'//img11.360buyimg.com/n2/s240x240_jfs/t14848/365/2076510540/93902/e5883831/5a6947e5N39e16ed8.jpg!q70.jpg.webp',
          price:6498.00,
          volume:224,
          id:100001
        },
        {
          title:'联想(Lenovo)拯救者R720 15.6英寸大屏游戏笔记本电脑',
          desc:'(i5-7300HQ 8G 1T+128G SSD GTX1050Ti 4G IPS 黑金)',
          cover:'//img11.360buyimg.com/n2/s240x240_jfs/t14947/152/2547272843/249018/b643c07c/5aa8c8a8N7cc84d18.jpg!q70.jpg.webp',
          price:5199.00,
          volume:427,
          id:100002
        },
        {
          title:'荣耀MagicBook 14英寸轻薄窄边框笔记本电脑',
          desc:'（i5-8250U 8G 256G MX150 2G独显 FHD IPS 正版Office）冰河银',
          cover:'//img12.360buyimg.com/n2/s240x240_jfs/t17458/302/1792090017/223266/7f72f23e/5ad851cdN50df02d5.jpg!q70.jpg.webp',
          price:4998.00,
          volume:321,
          id:100003
        },
        {
          title:'联想(Lenovo)拯救者Y7000 15.6英寸游戏笔记本电脑',
          desc:'(英特尔八代酷睿i5-8300H 8G 2T+128G GTX1050Ti 黑)  ',
          cover:'//img12.360buyimg.com/n2/s240x240_jfs/t21313/152/576243349/299675/32a7dafd/5b11634fN6153fccf.jpg!q70.jpg.webp',
          price:6198.00,
          volume:954,
          id:100004
        },
        {
          title:'小米(MI)Pro 15.6英寸金属轻薄笔记本',
          desc:'(i5-8250U 8G 256GSSD MX150 2G独显 FHD 指纹识别 预装office)深空灰',
          cover:'//img12.360buyimg.com/n2/s240x240_jfs/t17083/327/2335382799/285989/d34a93fa/5af50e5fNa34f717e.jpg!q70.jpg.webp',
          price:5599.00,
          volume:721,
          id:100005
        },
        {
          title:'戴尔DELL灵越燃7000 II 14.0英寸轻薄窄边框笔记本电脑',
          desc:'(i7-8550U 8G 128GSSD+1T MX150 2G独显 IPS)银  ',
          cover:'//img14.360buyimg.com/n2/s240x240_jfs/t11719/257/481321980/260610/bc7201c5/59f15b8aN8fb3c4f5.jpg!q70.jpg.webp',
          price:6199.00,
          volume:654,
          id:100006
        }
      ]
    ctx.body={
        msg:'success',
        code:0,
        goodslist
    }
})
module.exports = router.routes()