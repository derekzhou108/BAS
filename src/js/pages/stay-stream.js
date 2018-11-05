/*----------
*  实时流水
----------*/

(function (scope = {}) {

    scope.constractDate = [] //新增对比日期
    scope.newChartData = []

    scope.dataInit = function (params, nodes) {
        let data, chartData, tableData,
            today = util.getToday(),
            unSelectedDays = [],
            self = this

        scope.getRealTimePay = function () {
            api.stayPay(params).then(res => {

                _.ErrorMsg(res)
                if ((Array.isArray(res.data) && !res.data.length) || Object.values(res.data).some(item => !item.length)) return false

                data = res.data

                //  表头文本
                let thead = ['日期', '系统平台', '常规渠道', '服务器', '流水收入（元）']

                // 图表数据
                let chartSeries1 = data.chart.map(item => {
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
                let chartLegend = data.chart.map((item) => item.date)

                unSelectedDays = util.removeByValue(chartLegend, today)

                let chartData1 = chartConfig.line({
                    title: '流水',
                    legend: chartLegend,
                    unSelected: unSelectedDays,
                    xData: data.chart[0].interval,
                    interval: 11,
                    series: chartSeries1
                })

                let chartData2 = chartConfig.line({
                    title: '累计流水',
                    legend: chartLegend,
                    unSelected: unSelectedDays,
                    xData: data.chart_total[0].interval,
                    interval: 22,
                    series: chartSeries2
                })

                chartConfig.render('chart1', chartData1)
                chartConfig.render('chart2', chartData2)

                tableData = tableConfig.parse({
                    elem: '#table1',
                    data: data.table,
                    thead
                })
                tableConfig.render(tableData)

                return true
            }).then(res => {
                // 调用下载Excel方法
                self.downloadExcel(params, res)
            })
        }
        this.getRealTimePay();
        _.TIMER = setInterval(() => {
            this.getRealTimePay();
        }, _.time);
        $(".icon-refresh").on("click", (() => this.getRealTimePay()))
    }

    //对比时段
    scope.addOneDate = function (elem = "#addDate") {
        let laydate = layui.laydate,
            value = util.getToday(),
            _this = this
        laydateRender()

        function laydateRender() {
            const laydateConfig = {
                elem,
                value,
                max: 0,
                btns: ['confirm'],
                format: "yyyy-MM-dd",
                done(value, date) {
                    // 如果选择是“今日”或是“昨日”或者已选日期则不重新渲染
                    if (_this.constractDate.some(item => value === item)) return
                    _this.constractDate.push(value)
                    _this.chartInit(value)
                }
            }
            laydate.render(laydateConfig)
        }
    }

    scope.chartInit = function (date = '') {

        let defaultConfig = { // 数据公共配置
            type: "line",
            areaStyle: {
                normal: {
                    opacity: 0.25
                }
            },
            smooth: true,
            label: {}
        }
        let startEnd = {
            start_date: date,
            end_date: date
        }
        let params = _.getCommonParams(startEnd);
        api.realTimePay(params).then((res) => {
            let addChartData = Object.assign(defaultConfig, {
                name: date,
                data: res.data.chart.data
            })

            scope.newChartData.push(addChartData);
            let chartData1 = chartConfig.line({
                legend: scope.constractDate,
                xData: res.data.chart.interval,
                interval: 11,
                series: scope.newChartData
            })
            chartConfig.render('chart1', chartData1)
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

            window.open('/basic/realtime/pay?' + tempParams)
        })

    }

    scope.init = (obj => {
        _.dataReload(obj)
        // obj.addOneDate()
    })(scope)
})()