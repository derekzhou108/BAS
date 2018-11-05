/**
 * 下载渠道登录用户代币
 */

(function (scope) {
    scope = scope || {}

    scope.dataInit = function (params, nodes) {
        let data, chartData, tableData

        api.channelLogin(params).then(res => {

            _.ErrorMsg(res)

            if (!res.data || !res.data.length) return false

            data = res.data

            //  表头文本
            let thead = ['日期', '系统平台', '常规渠道', '渠道活跃账号数', '充值总额', '充值账号数', '充值ARPU', '总充值次数', '平均充值额/次', '付费渗透率', '消耗总额', '消耗账号数', '消耗ARPU', '总消耗次数', '平均消耗额/次', '消耗渗透率']


            // 让x轴节点以有效数据数量对齐
            if (nodes.length !== data.length) {
                nodes = data.map(item => item.date.substring(0, 10))
            }

            chartData = chartConfig.parse({
                data,
                thead
            })

            tableData = tableConfig.parse({
                elem: '#table1',
                fixed: 3,
                data,
                thead
            })

            const {
                pay_arpu,
                gold_arpu,
                pay_total,
                gold_total
            } = chartData

            let chartData1 = chartConfig.line({
                legend: [pay_arpu.title, gold_arpu.title],
                xData: nodes,
                series: [{
                    name: pay_arpu.title,
                    data: pay_arpu.value
                }, {
                    name: gold_arpu.title,
                    data: gold_arpu.value
                }]
            })

            let chartData2 = chartConfig.line({
                legend: [pay_total.title, gold_total.title],
                xData: nodes,
                series: [{
                    name: pay_total.title,
                    data: pay_total.value
                }, {
                    name: gold_total.title,
                    data: gold_total.value
                }]
            })

            chartConfig.render('chart1', chartData1)
            chartConfig.render('chart2', chartData2)
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

            params = Object.assign({}, params, {
                export: 1
            })

            // 参数对象转url参数
            tempParams = util.objParseQuery(params)

            window.open('/basic/channel/channel-active?' + tempParams)

        })
    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()