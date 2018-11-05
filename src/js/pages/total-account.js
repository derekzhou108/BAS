/*----------
*  运营总况（账户）
----------*/

(function (scope = {}) {

    scope.dataInit = function (params, nodes) {
        let data, chartData, tableData

        api.generalAccount(params).then(res => {
            _.ErrorMsg(res)

            if (!res.data || !res.data.length) return false

            data = res.data

            // 让x轴节点以有效数据数量对齐
            if (nodes.length !== data.length) {
                nodes = data.reverse().map(item => item.date.substring(0, 10))
            }

            //  表头文本
            let thead = ['日期', '系统平台', '常规渠道', '服务器', '新有效注册账号数', '总有效注册账号数', '有效活跃账号数', '流水收入（元）', '付费账号数', '付费账号ARPU', '活跃账号ARPU', '付费渗透率', '消费代币金额', '平均在线时长', 'PCU', 'ACU', '次日留存率', '3日留存率', '7日留存率', '14日留存率']

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
                active_user,
                total_money,
                new_user,
                pay_times
            } = chartData

            let chartData1 = chartConfig.line({
                legend: [new_user.title, active_user.title, pay_times.title],
                xData: nodes,
                series: [{
                    name: new_user.title,
                    data: new_user.value
                }, {
                    name: active_user.title,
                    data: active_user.value
                }, {
                    name: pay_times.title,
                    data: pay_times.value
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

            window.open('/basic/general/general-account?' + tempParams)
        })

    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()