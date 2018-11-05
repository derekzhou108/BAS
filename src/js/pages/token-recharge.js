/**
 * 充值额度用户数分布
 */

(function (scope = {}) {

    scope.dataInit = function (params, nodes) {
        let data, chartData, tableData

        api.goldPay(params).then(res => {
            _.ErrorMsg(res)

            if (!res.data || !res.data.length) return false

            data = res.data

            let thead = ['日期', '系统平台', '服务器', '常规渠道'] //  表头文本
            let chartTitle = '充值额度用户数'
            let chartNodes = [] // 柱状图x轴node
            let chartValue = [] // 柱状图x轴node数据
            let mainCols //一维表头
            let subCols //二维表头
            let costRange = [] // 对应子项数组
            let allRange = [] // 所有二级表数组

            let mainData = data.map((item, index) => {
                // 创建每条子项数组
                costRange.push([])
                item.data.forEach(range => {
                    // 填充x轴node
                    const tempRange = range.pay_range
                    if (!chartNodes.includes(tempRange)) {
                        chartNodes.push(tempRange)
                    }
                    costRange[index].push(tempRange)
                })
                // 公用数据
                const { date, platform_name, server_name, channel_name } = item
                return { date, platform_name, server_name, channel_name }
            })

            // 排序
            chartNodes.sort(function (a, b) {
                return a.split('-')[0] - b.split('-')[0]
            })

            // 补充没有的范围段数据
            allRange = data.map((item, index) => {
                return chartNodes.map(s => {
                    const temp = costRange[index].indexOf(s)
                    if (temp !== -1) {
                        return item.data[temp]
                    } else {
                        return {
                            "pay_range": s,
                            "pay_user": "0",
                            "pay_amount": 0
                        }
                    }
                })
            })

            tableData = tableConfig.parse({
                elem: '#table1',
                fixed: thead.length,
                data: mainData,
                thead
            })


            // console.log(mainData,thead,tableData)
            mainCols = tableData.cols[0] //一维表头
            subCols = tableData.cols[1] = [] //二维表头

            // 设置前4列的格式
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
                    title: `[${item}]`,
                    colspan: 2,
                    align: 'center',
                    minWidth: 100
                })

                // 追加数据的第二行表头
                subCols.push({
                    field: 'pay_user' + index,
                    title: '人数',
                    align: 'center',
                    minWidth: 100
                }, {
                        field: 'pay_amount' + index,
                        title: '金额',
                        align: 'center',
                        minWidth: 100
                    })
            })


            // 拼接到tableData中
            allRange.forEach((data, index) => {
                chartValue.push([])
                data.forEach((item, num) => {
                    tableData.data[index]['pay_user' + num] = item.pay_user
                    tableData.data[index]['pay_amount' + num] = item.pay_amount
                    // 填充图表数据
                    chartValue[index].push(item.pay_user)
                })
            })

            // 图表Legend
            let legend = data.map(item => item.date)

            // 图表数据
            let chartSeries = data.map((item, index) => {
                return {
                    name: item.date,
                    data: chartValue[index]
                }
            })

            chartData = chartConfig.yBar({
                legend: legend,
                xData: chartNodes,
                series: chartSeries
            })
            chartConfig.render('chart1', chartData)
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

            window.open('/basic/gold/pay?' + tempParams)
        })

    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()