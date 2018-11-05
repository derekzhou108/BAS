/*----------
*  实时注册在线监控
----------*/

(function (scope = {}) {

    scope.constractDate = []; //新增对比日期
    scope.newChartData = [];
    // scope.datePoint= true //是否是时间点选择器

    scope.dataInit = function (params) {
        let data

        scope.getRealTime = function () {
            api.realRegisterMonitor(params).then(res => {

                _.ErrorMsg(res);

                if (!res.data || !res.data.list || !res.data.list.length) return false

                data = res.data;

                //  深复制拷贝-用于处理数据
                this.renderChart(lodash.cloneDeep(data));
                this.renderTable(lodash.cloneDeep(data));

                return true

            })
        };
        this.getRealTime();
        _.TIMER = setInterval(() => {
            this.getRealTime();
        }, _.time);

        $(".icon-refresh").on("click", (() => this.getRealTime()));
    };

    scope.renderChart = (asynData) => {
        // 渲染图表
        let chartData,
            totalNum = [], //累计注册人数数据
            curNum = [], //在线人数数据
            targetNum = [], //预设导量人数数据
            interval = asynData.data_head

        asynData.list[0] && asynData.list[0].data.map(item => {
            totalNum.push(item.all_role_create)
            curNum.push(item.now_role_active)
            targetNum.push(item.target_role_create)
        })

        chartData = chartConfig.lineAndBar({
            legend: ['在线人数', '累计注册人数', '预设导量人数'],
            title: {
                text: '实时注册在线监控',
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
                    name: '人数',
                    max: 'dataMax',
                    min: 0,
                    boundaryGap: [0.2, 0.2]
                },
            ],
            interval: 11,
            series:
                [{
                    name: '预设导量人数',
                    type: 'line',
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    data: targetNum
                },
                {
                    name: '在线人数',
                    type: 'line',
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    data: curNum
                },
                {
                    name: '累计注册人数',
                    type: 'line',
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    data: totalNum
                }],
        })

        chartConfig.render('chart1', chartData)
    };

    scope.renderTable = (asynData) => {
        //  表头文本
        let thead = { date: "日期", platform_name: "系统平台", server_name: "服务器", all_role_create: "累计注册人数", target_role_create: "预设导量人数", now_role_active: "当前在线人数" };
        let lastTime = asynData.data_head.pop()
        let curData = asynData.list[0].data.find(item => item.window_end === lastTime)
        let renderData = Object.assign({}, asynData.list[0], curData)
        let tableData = tableConfig.parseNewHead({
            elem: "#table1",
            data: [renderData],
            thead
        });
        tableConfig.render(tableData);
    };


    scope.init = (obj => {
        _.dataReload(obj);
    })(scope);
})();