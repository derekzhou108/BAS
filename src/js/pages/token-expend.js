/**
 * 消耗额度用户数分布
 */

(function (scope = {}) {
    scope.curTab = { name: '', index: 0 }
    scope.dataInit = function (params, nodes, filterStorage) {
        let data, element = layui.element, self = this
        const TOKEN_TYPES = ['money','grade'] //类型
        function toSort(type) {
            let param = Object.assign({}, params, {
                type
            })

            return api.goldCost(param)
        }
        function fecthData(type) {

            toSort(type).then(res => {
                _.ErrorMsg(res)

      
                //后台有些地方使用新接口导致字段不一致
                if (type === 'money') {
                    if (!res.data || !res.data.length) { return false }
                    else {
                        data = res.data
                    }
                } else {
                    if (!res.data || !res.data.list || !res.data.list.length) { return false }
                    else {
                        data = res.data.list
                    }
                }

                //子筛选器
            
                let renderChartData = util.subFilterRender({filterStorage, data, scope, type})

                //开始渲染图表
                self.renderChart({renderChartData, type})
                self.renderTable(data, type)
                return true
            }).then(res => {
                // 调用下载Excel方法
                self.downloadExcel(params, res)
            })
        }
        //默认获取第一个tab类型
        fecthData(self.curTab.name || TOKEN_TYPES[0], self.curTab.index)


        //点击tab切换并且根据type请求数据
        element.on('tab(operationAll)', function (ele) {
            let select = $(this).data('type')
            self.curTab.name = select
            self.curTab.index = ele.index
            fecthData(select)

        });
    }

    scope.renderChart = function ({renderChartData, curType}) {
        let chartData
        let chartTitle = '消耗额度用户数'
        let chartNodes = [] // 柱状图x轴node
        let chartValue = [] // 柱状图x轴node数据
        let costRange = [] // 对应子项数组
        let allRange = [] // 所有二级表数组

        renderChartData.map((item, index) => {
            // 创建每条子项数组
            costRange.push([])
            item.data.forEach(range => {
                // 填充x轴node
                const tempRange = curType === 'money' ? range.cost_range : range.range_level
                if (!chartNodes.includes(tempRange)) {
                    chartNodes.push(tempRange)
                }
                costRange[index].push(tempRange)
            })
        })
        // 排序
        chartNodes.sort(function (a, b) {
            return a.split('-')[0] - b.split('-')[0]
        })

        // 补充没有的范围段数据
        allRange = renderChartData.map((item, index) => {
            return chartNodes.map(s => {
                const temp = costRange[index].indexOf(s)
                if (temp !== -1) {
                    return item.data[temp]
                } else {
                    let curOject = {
                        "cost_user": "0",
                        "cost_amount": 0
                    }
                    if (curType === 'money') {
                        curOject = Object.assign({}, { "cost_range": s }, curOject)
                    } else {
                        curOject = Object.assign({}, { "range_level": s }, curOject)
                    }
                    return curOject
                }
            })
        })

        // 拼接到tableData中
        allRange.forEach((renderChartData, index) => {
            chartValue.push([])
            renderChartData.forEach((item, num) => {
                // 填充图表数据
                chartValue[index].push(item.cost_user)
            })
        })

        // 图表Legend
        let legend = renderChartData.map(item => item.date)

        // 图表数据
        let chartSeries = renderChartData.map((item, index) => {
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
    }
    scope.renderTable = function (data, curType) {

        if (!data) return;

        let tableData
        let thead = ['日期', '系统平台', '服务器', '常规渠道', '消费用户数', '平均消费次数', '平均消费额'] //  表头文本


        let mainCols // 一维表头
        let subCols // 二维表头
        let costRange = [] // 对应子项数组
        let allRange = [] // 所有二级表数组
        let chartNodes = [] // 柱状图x轴node
        let mainData = data.map((item, index) => {
            // 创建每条子项数组
            costRange.push([])
            item.data.forEach(range => {
                // 填充x轴node
                const tempRange = curType === 'money' ? range.cost_range : range.range_level
                if (!chartNodes.includes(tempRange)) {
                    chartNodes.push(tempRange)
                }
                costRange[index].push(tempRange)
            })
            // 公用数据
            const { date, platform_name, server_name, channel_name, cost_user, cost_avg_times, cost_avg_amount } = item
            return { date, platform_name, server_name, channel_name, cost_user, cost_avg_times, cost_avg_amount }
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
                    let curOject = {
                        "cost_user": "0",
                        "cost_amount": 0
                    }
                    if (curType === 'money') {
                        curOject = Object.assign({}, { "cost_range": s }, curOject)
                    } else {
                        curOject = Object.assign({}, { "range_level": s }, curOject)
                    }
                    return curOject
                }
            })
        })

        tableData = tableConfig.parse({
            elem: '#table1',
            fixed: thead.length,
            data: mainData,
            thead
        })


        mainCols = tableData.cols[0] //一维表头
        subCols = tableData.cols[1] = [] //二维表头

        // 设置前7列的格式
        mainCols.forEach((item, index) => {
            if (index < thead.length) {
                item.rowspan = 2
                item.fixed = 'left'
                item.minWidth = index === 0 ? 180 : 120
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
                field: 'cost_user' + index,
                title: '人数',
                align: 'center',
                minWidth: 100
            }, {
                    field: 'cost_amount' + index,
                    title: '金额',
                    align: 'center',
                    minWidth: 100
                })
        })

        // 拼接到tableData中
        allRange.forEach((data, index) => {
            data.forEach((item, num) => {
                tableData.data[index]['cost_user' + num] = item.cost_user
                tableData.data[index]['cost_amount' + num] = item.cost_amount
            })
        })

        tableConfig.render(tableData)

    }

    // 点击下载Excel
    scope.downloadExcel = (params, isExistData) => {

        // 先解绑再绑定，防止多此重复绑定
        $('#downExcel').unbind("click").on('click', function () {

            let type = $('#tabChartTable').find('.layui-tab-title .layui-this').data('type')

            let tempParams = {}

            let url = ''

            params.type = type

            if (!isExistData) return

            params = Object.assign({}, params, { export: 1, nonce: "11972", timestamp: "1534844078820", sign: "66c0501741a8486b7a8cb43e94c3bc8a" })

            tempParams = util.objParseQuery(params)

            if (type === 'money') {
                url = '/basic/gold/cost?'
            } else {
                url = '/basic_v2/gold/cost-about-level?'
            }
            window.open(url + tempParams)

        })

    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()