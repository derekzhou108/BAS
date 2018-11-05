/*----------
*  实时注册
----------*/

(function (scope = {}) {
    scope.dataInit = function (params, nodes) {
        let data, chartData, tableData,
            today = util.getToday(),
            unSelectedDays = [],
            self = this
        scope.getRealTimeRegister = function () {
            api.stayRegister(params).then(res => {
                _.ErrorMsg(res)

                if ((Array.isArray(res.data) && !res.data.length) || Object.values(res.data).some(item => !item.length)) return false

                data = res.data

                //  表头文本
                let thead = ['日期', '系统平台', '常规渠道', '服务器', '当前累计注册']

                // 图表数据
                let chartSeries1 = data.chart.map((item) => {
                    return {
                        name: item.date,
                        data: item.data
                    }
                })
                let chartSeries2 = data.chart_total.map((item, index) => {
                    return {
                        name: data.chart[index].date,
                        data: item.data
                    }
                })

                // 图表Legend
                let chartLegend = data.chart.map((item) => {
                    return item.date
                })
                unSelectedDays = util.removeByValue(chartLegend, today)

                tableData = tableConfig.parse({
                    elem: '#table1',
                    data: data.table,
                    thead
                })

                let chartData1 = chartConfig.line({
                    title: '注册',
                    legend: chartLegend,
                    unSelected: unSelectedDays,
                    xData: data.chart[0].interval,
                    interval: 11,
                    series: chartSeries1
                })

                let chartData2 = chartConfig.line({
                    title: '累计注册',
                    legend: chartLegend,
                    unSelected: unSelectedDays,
                    xData: data.chart_total[0].interval,
                    interval: 22,
                    series: chartSeries2
                })

                chartConfig.render('chart1', chartData1)
                chartConfig.render('chart2', chartData2)
                tableConfig.render(tableData)

                return true
            }).then(res => {
                // 调用下载Excel方法
                self.downloadExcel(params, res)
            })
        }
        this.getRealTimeRegister()

        _.TIMER = setInterval(() => {
            this.getRealTimeRegister();
        }, _.time);

        $(".icon-refresh").on("click", (() => this.getRealTimeRegister()))
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

            window.open('/basic/realtime/register?' + tempParams)
        })
    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()