/**
 * 各玩法参与情况
 */

(function (scope = {}) {

    scope.dataInit = function (params, nodes) {
        let data, tableData, asyncHeads

        api.getActivityGift(params).then(res => {
            _.ErrorMsg(res)

            // 数据列表与表头字段
            data = res.data.list
            asyncHeads = res.data.label

            if ((Array.isArray(res.data) && !res.data.length) || !data) return false

            //  表头文本
            // let thead = ['日期', '系统平台', '服务器', '势力']
            // let theadLen = thead.length

            // 深复制拷贝-用于表格处理数据
            let tempData = util.deepClone(data)

            tempData.forEach(item => {
                item.data.forEach((k, j) => {
                    item[k.gift_id] = k.buy_role
                })
            })

            tableData = tableConfig.parseHead({
                elem: '#table1',
                thead: asyncHeads,
                data: tempData,
                fixed: 4
            })

            tableConfig.render(tableData)

            return true
        }).then(res => {
            // 调用下载Excel方法
            this.downloadExcel(params, res)
        })

    }

    // 点击下载Excel
    scope.downloadExcel = (params, isExistData) => {

        // 先解绑再绑定，防止多此重复绑定
        $('#downExcel').unbind("click").on('click', function () {

            let tempParams = {}

            if (!isExistData) return


            params = Object.assign({}, params, { export: 1 })

            // 参数对象转url参数
            tempParams = util.objParseQuery(params)

            window.open('/special/activity/gift-buy?' + tempParams)

        })
    }


    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()