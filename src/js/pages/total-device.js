/*----------
*  运营总况（设备）
----------*/

(function (scope = {}) {

    scope.dataInit = function (params, nodes) {
        let data, chartData, tableData

        api.generalDevice(params).then(res => {
            _.ErrorMsg(res)

            if (!res.data || !res.data.length) return false

            data = res.data

            // 让x轴节点以有效数据数量对齐
            if (nodes.length !== data.length) {
                nodes = data.reverse().map(item => item.date.substring(0, 10))
            }

            //  表头文本
            let thead = ['日期', '系统平台', '常规渠道', '服务器', '新有效注册设备数', '总有效注册设备数', '有效活跃设备数', '流水收入（元）', '付费设备数', '付费设备ARPU', '活跃设备ARPU', '付费渗透率', '消费代币金额', '平均在线时长', 'PCU', 'ACU', '次日留存率', '3日留存率', '7日留存率', '14日留存率']

            chartData = chartConfig.parse({
                data,
                thead
            })

            tableData = tableConfig.parse({
                elem: '#table1',
                fixed: 4,
                data: data.reverse(),
                thead
            })

            // 图表使用
            const {
                new_device,
                active_device,
                pay_device,
                total_money
            } = chartData

            let chartData1 = chartConfig.line({
                legend: [new_device.title, active_device.title, pay_device.title],
                xData: nodes,
                series: [{
                    name: new_device.title,
                    data: new_device.value
                }, {
                    name: active_device.title,
                    data: active_device.value
                }, {
                    name: pay_device.title,
                    data: pay_device.value
                }]
            })

            let chartData2 = chartConfig.line({
                legend: [total_money.title],
                xData: nodes,
                series: [{
                    name: total_money.title,
                    data: total_money.value
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

            window.open('/basic/general/general-device?' + tempParams)
        })

    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()