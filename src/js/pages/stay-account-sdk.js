/**
 * 玩家留存跟踪（广告渠道）
 */


(function (scope = {}) {

    scope.dataInit = function (params, nodes) {
        let data, tableData

        api.stayUserSDK(params).then(res => {
            _.ErrorMsg(res)

            if (!res.data || !res.data.length) return false

            data = res.data

            //  表头文本
            let thead = ['留存天数', '系统平台', '常规渠道', '广告渠道']
            let mainCols //一维表头
            let subCols //二维表头
            let mainData = data.map(item => {
                const { day_number, platform_name, channel_name, ad_channel_name } = item
                return { day_number, platform_name, channel_name, ad_channel_name }
            })

            tableData = tableConfig.parse({
                elem: '#table1',
                fixed: thead.length,
                data: mainData,
                thead
            })

            mainCols = tableData.cols[0] //一维表头
            subCols = tableData.cols[1] = [] //二维表头

            // 设置前4列表头
            mainCols.forEach((item, index) => {
                if (index < thead.length) {
                    item.rowspan = 2
                    item.fixed = 'left'
                    item.minWidth = 100
                }
            })

            data[0].data.forEach((item, index) => {
                // 追加数据的第一行表头
                mainCols.push({
                    field: 'main' + index,
                    title: `${item.date}新注册：${item.new_user_role}`,
                    colspan: 2,
                    align: 'center',
                    minWidth: 60
                })
                // 追加数据的第二行表头
                subCols.push(
                    {
                        field: 'retention_user' + index,
                        title: '留存账号数',
                        align: 'center',
                        minWidth: 120
                    },
                    {
                        field: 'retention_ratio' + index,
                        title: '留存率',
                        align: 'center',
                        minWidth: 120
                    }
                )
            })

            // 追加tableData
            data.forEach(item => {
                item.data.forEach((k, j) => {
                    item['retention_user' + j] = k.retention_user
                    item['retention_ratio' + j] = k.retention_ratio
                })
                delete item.data
            })

            tableData.data = data

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

            window.open('/basic/stay/stay-user-sdk?' + tempParams)
        })

    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()