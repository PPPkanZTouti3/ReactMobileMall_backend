// 代码还可以优化 但是时间有限 能跑就行

const prodFormatUtils = (data) => {
    // 下面这行代码 必须要有 不然不能按预期修改数据格式
    data = JSON.parse(JSON.stringify(data))
    let detailProduct = data.detailProduct;
    let newObj = {
        attri: []
    };
    let newAttri = [];
    if (detailProduct && detailProduct.length) {
        detailProduct.forEach(prod => {
            let attri = prod.attri;
            if (attri && attri.length) {
                attri.forEach(ptem => {
                    if (ptem) {
                        let item = JSON.parse(JSON.stringify(ptem))
                        let temp = {};
                        // const { _id } = item.attriId
                        temp.productAttriId = item.attriId._id;
                        temp.groupAttriValueId = item.attriId.groupAttriValueId._id;
                        temp.groupAttriId = item.attriId.groupAttriValueId.groupAttriId._id;
                        temp.attriName = item.attriId.groupAttriValueId.groupAttriId.attriName;
                        temp.attriValue = item.attriId.groupAttriValueId.attriValue;
                        newAttri.push(temp)
                    }
                })
                
            }

            newObj.attri = newAttri
            Object.assign(prod, newObj)
            newAttri = []
                
        })
    }
    
    return data;
}

module.exports = prodFormatUtils;