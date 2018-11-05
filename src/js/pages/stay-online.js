/*----------
*  实时在线
----------*/

(function (scope = {}) {

    scope.constractData = [] //新增对比日期

    scope.dataInit = function (params, nodes) {
        let data, chartData, tableData, today = util.getToday(),
            unSelectedDays = [],
            self = this
        scope.getRealTimeOnLine = function () {
            // 添加上结束时段
            // params.end_date = params.start_date

            api.stayOnLine(params).then(res => {

                _.ErrorMsg(res)

                if ((Array.isArray(res.data) && !res.data.length) || Object.values(res.data).some(item => !item.length)) return false

                data = res.data

                //  表头文本
                let thead = ['日期', '系统平台', '常规渠道', '服务器', '当前在线', '最高在线', '最低在线']

                let chartSeries = data.chart.map((item) => {
                    return { name: item.date, data: item.data }
                })
                let chartLegend = data.chart.map((item) => item.date)
                unSelectedDays = util.removeByValue(chartLegend, today)

                let chartData1 = chartConfig.line({
                    legend: chartLegend,
                    unSelected: unSelectedDays,
                    xData: data.chart[0].interval,
                    interval: 11,
                    series: chartSeries
                })

                chartConfig.render('chart1', chartData1)

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

        this.getRealTimeOnLine()
        _.TIMER = setInterval(() => {
            this.getRealTimeOnLine();
        }, _.time);
        $(".icon-refresh").on("click", (() => { this.getRealTimeOnLine() }))


    }

    //对比时段
    scope.compareTime = function (elem = "#addDate") {
        let laydate = layui.laydate,
            value = util.getToday(),
            today = util.getToday(),
            yestoday = util.getDateRange(2).targetDay,
            _this = this
        laydateRender()

        // 刷新数据
        $('#refrash').on('click', () => {
            this.chartInit()
        })

        function laydateRender() {
            const laydateConfig = {
                elem,
                value,
                max: 0,
                format: "yyyy-MM-dd",
                done(value, date) {
                    // 如果选择是“今日”或是“昨日”或者已选日期则不重新渲染
                    if (value === today || value === yestoday || _this.constractData.some(item => value === item.title)) return
                    _this.chartInit(value)
                }
            }
            laydate.render(laydateConfig)
        }
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

            window.open('/basic/realtime/online?' + tempParams)
        })

    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()