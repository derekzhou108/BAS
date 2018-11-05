/*----------
*  运营总况（渠道）
----------*/

(function (scope = {}) {

    scope.dataInit = function (params, nodes) {
        let data, chartData, tableData

        api.generalAccountSDK(params).then(res => {
            _.ErrorMsg(res)

            if (!res.data || !res.data.length) return false

            data = res.data

            // 让x轴节点以有效数据数量对齐
            if (nodes.length !== data.length) {
                nodes = data.reverse().map(item => item.date.substring(0, 10))
            }

            //  表头文本
            let thead = {date:'日期', platform_name:'系统平台', channel_name:'常规渠道', ad_channel_name:'广告渠道', new_user:'新注册账号数', total_new_user:'总新增账号数', active_user:'活跃账号数', total_money:'流水收入（元）', pay_times:'付费账号数', pay_user_arpu:'付费账号ARPU', active_user_arpu:'活跃账号ARPU', user_pur:'付费渗透率', avg_ontime:'平均在线时长', pcu:'PCU', acu:'ACU', retention_user_1:'次日留存率', retention_user_3:'3日留存率', retention_user_7:'7日留存率', retention_user_14:'14日留存率'}
            

            chartData = chartConfig.parse({ data, thead })

            tableData = tableConfig.parseNewHead({
                elem: '#table1',
                fixed: 4,
                data: data.reverse(),
                thead
            })


            // 图表使用
            const { active_user, total_money, new_user, pay_times } = chartData

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
    scope.downloadExcel = (params, isExistData)  => {

        // 先解绑再绑定，防止多此重复绑定
        $('#downExcel').unbind("click").on('click', function () {

            let tempParams = {}

            if (!isExistData) return

            params = Object.assign({}, params, { export: 1 })

            // 参数对象转url参数
            tempParams = util.objParseQuery(params)

            window.open('/basic/general/general-account-sdk?' + tempParams)
        })

    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()