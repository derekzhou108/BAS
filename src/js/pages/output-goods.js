/*----------
*  各渠道物品产出情况
----------*/

(function (scope = {}) {

    scope.dataInit = function (params, nodes) {
        let data, tableData, asyncHeads

        if (nodes.length > 2) {
            layer.msg('该时间段数据计算量过大，建议选择两天内')
            return false
        }

        api.propProduct(params).then(res => {

            _.ErrorMsg(res)

            // 数据列表与表头字段
            data = res.data.list
            asyncHeads = res.data.label

            if ((Array.isArray(res.data) && !res.data.length) || !data) return false

            //  表头文本
            // let thead = ['日期', '系统平台', '服务器', '势力', '物品类型', '物品名称', '今日总产出']

            // 深复制拷贝-用于表格处理数据
            let tempData = util.deepClone(data)

            tempData.forEach(item => {
                item.data.forEach((k, j) => {
                    item[k.reason_id] = k.total_num
                })
            })

            tableData = tableConfig.parseHead({
                elem: '#table1',
                thead: asyncHeads,
                data: tempData,
                fixed: 7
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

            window.open('/special/product/prop-product?' + tempParams)
        })

    }

    scope.init = (obj => {

        _.dataReload(obj)
    })(scope)
})()