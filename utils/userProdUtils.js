const userProdUtils = (data) => {
    let res = [];
    data.forEach(item => {
        let temp = {}
        temp.userId = item.userId;
        temp.goodsId = item.groupId;
        res = [...res, temp]
    })

    return res;
}

module.exports = userProdUtils;