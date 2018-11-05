/*----------
*  实时综合报表（小时）
----------*/

(function (scope = {}) {

    scope.constractData = [] //新增对比日期
    // scope.datePoint= true //是否是时间点选择器

    scope.dataInit = function (params, nodes) {
        let data
        // 调用接口获取页面图表和表格数据
        scope.getRealTimeReport = function () {
            api.realTimeHourReport(params).then(res => {

                _.ErrorMsg(res)

                if (!res.data || !res.data.list || !res.data.list.length) return false

                data = res.data

                //数据存在开始渲染图表和表格内容
                this.render(data)

                return true

            }).then(res => {
                // 调用下载Excel方法
                this.downloadExcel(params, res)
            })
        }

        // 按规定时间刷新数据
        this.getRealTimeReport()
        _.TIMER = setInterval(() => {
            this.getRealTimeReport();
        }, _.time);
        $(".icon-refresh").on("click", (() => { this.getRealTimeReport() }))
    }

    //渲染图标和表格
    /**
     * 
     * 
     * @param {string} data //图表和表格的数据
     */
    scope.render = (data) => {


        let chartData,
            tableData,
            unSelectedDays = [],
            streamData = [], //充值总数数据
            registerData = [], //新增注册帐号数据
            PaidUserData = [], //新增付费账号数数据
            interval = [] //x轴坐标值

        data.list.map(item => {
            streamData.push(item.total_money)
            registerData.push(item.total_user)
            PaidUserData.push(item.pay_user)
            interval.push(item.window_start)

        })
        // 渲染图表
        let chartData1 = chartConfig.lineAndBar({
            legend: ['充值总数', '新增注册帐号', '新增付费账号数'],
            title: {
                text: '小时实时数据报表',
                left: 'center'
            },
            // unSelected: unSelectedDays,
            xData: [
                {
                    type: 'category',
                    boundaryGap: true,
                    data: interval
                },
            ],
            yData: [
                {
                    type: 'value',
                    scale: true,
                    name: '流水（元）',
                    max: 'dataMax',
                    min: 0,
                    boundaryGap: [0.2, 0.2]
                },
                {
                    type: 'value',
                    scale: true,
                    name: '人数',
                    max: 'dataMax',
                    min: 0,
                    boundaryGap: [0.2, 0.2]
                }
            ],
            interval: 11,
            series:
                [{
                    name: '充值总数',
                    type: 'bar',
                    xAxisIndex: 0,
                    yAxisIndex: 1,
                    data: streamData
                },
                {
                    name: '新增注册帐号',
                    type: 'line',
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    data: registerData
                },
                {
                    name: '新增付费账号数',
                    type: 'line',
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    data: PaidUserData
                }],
        })

        chartConfig.render('chart1', chartData1)


        // 渲染表格

        let tbodyData = util.deepClone(data.list),  // 深复制拷贝-用于表格处理数据
            thead = {date:'日期', platform_name:'系统平台', channel_name:'常规渠道', server_name:'服务器', window_start:'时间（小时）', total_user:'新增有效账号数', pay_user:'新增付费账号数', total_money:'流水收入（元）'} //  表头文本


        tableData = tableConfig.parseNewHead({
            elem: '#table1',
            data: tbodyData,
            thead,

        })

        tableConfig.render(tableData)
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

            params = Object.assign({}, params, { export: 1, nonce: "11972", timestamp: "1534844078820", sign: "66c0501741a8486b7a8cb43e94c3bc8a" })

            // 参数对象转url参数
            tempParams = util.objParseQuery(params)

            window.open('/basic_v2/real-time/stat-by-hour?' + tempParams)

        })
    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()