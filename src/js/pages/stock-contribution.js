/*----------
*  贡献币存量情况
----------*/

(function (scope = {}) {

    scope.dataInit = function (params, nodes) {
        let data, tableData

        api.getGongxcianStok(params).then(res => {
            _.ErrorMsg(res)

            if (!res.data || !res.data.length) return false

            data = res.data

            //  表头文本
            let thead = ['日期', '系统平台', '服务器', '代币类型']

            let chartNodes = [] // 柱状图x轴node
            let mainCols //一维表头
            let subCols //二维表头

            let costRange = [] // 对应子项数组
            let allRange = [] // 所有二级表数组

            /* ----- 渲染表格数据  -----*/

            // 先拿到公共基础的表格数据，对应thead的几项
            let mainData = data.map((item, index) => {
                // 创建每条子项数组
                costRange.push([])
                item.data.forEach(range => {
                    // 填充x轴node
                    const tempRange = range.range_level
                    if (!chartNodes.includes(tempRange)) {
                        chartNodes.push(tempRange)
                    }
                    costRange[index].push(tempRange)
                })
                // 公用数据
                const { date, platform_name, server_name, money_type } = item
                return { date, platform_name, server_name, money_type }
            })

            // 排序 切割 --> [10-20]级
            chartNodes.sort(function (a, b) {
                return a.split('-')[0].substr(1) - b.split('-')[0].substr(1)
            })

            // 补充没有的范围段数据
            allRange = data.map((item, index) => {
                return chartNodes.map(s => {
                    const temp = costRange[index].indexOf(s)
                    if (temp !== -1) {
                        return item.data[temp]
                    } else {
                        return {
                            "range_level": s,
                            "active_role": "0",
                            "stock_total": "0",
                            "stock_avg": 0
                        }
                    }
                })
            })

            tableData = tableConfig.parse({
                elem: '#table1',
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
                    item.minWidth = index === 0 ? 180 : 100
                }
            })

            // 设置二维表头
            chartNodes.forEach((item, index) => {
                // 追加数据的第一行表头
                mainCols.push({
                    field: 'total',
                    title: `${item}`,
                    colspan: 3,
                    align: 'center',
                    minWidth: 100
                })

                // 追加数据的第二行表头
                subCols.push({
                    field: 'stock_total' + index,
                    title: `活跃角色总存量`,
                    align: 'center',
                    minWidth: 100
                }, {
                        field: 'active_role' + index,
                        title: `活跃角色数`,
                        align: 'center',
                        minWidth: 100
                    }, {
                        field: 'stock_avg' + index,
                        title: `平均存量`,
                        align: 'center',
                        minWidth: 100
                    })
            })

            // 拼接到tableData中
            allRange.forEach((data, index) => {
                data.forEach((item, num) => {
                    tableData.data[index]['stock_total' + num] = item.stock_total
                    tableData.data[index]['active_role' + num] = item.active_role
                    tableData.data[index]['stock_avg' + num] = item.stock_avg
                })
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

            tempParams = util.objParseQuery(params)

            window.open('/special/stock/gongxian-stock?' + tempParams)
        })

    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()