/*----------
*  实时在线账号
----------*/

(function (scope = {}) {

    scope.constractDate = []; //新增对比日期
    scope.newChartData = [];
    // scope.datePoint= true //是否是时间点选择器

    scope.dataInit = function (params) {
        let data

        scope.getRealTime = function () {
            api.realTimeOnLine(params).then(res => {

                _.ErrorMsg(res);

                if (!res.data || !res.data.list || !res.data.list.length) return false

                data = res.data;

                //  深复制拷贝-用于处理数据
                this.renderChart(lodash.cloneDeep(data));
                this.renderTable(lodash.cloneDeep(data));

                return true

            }).then(res => {
                // 调用下载Excel方法
                this.downloadExcel(params, res)
            })
        };
        this.getRealTime();
        _.TIMER = setInterval(() => {
            this.getRealTime();
        }, _.time);

        $(".icon-refresh").on("click", (() => this.getRealTime()));
    };

    scope.renderChart = (asynData) => {
        let today = util.getToday();
        let chartLegend = [];
        let xData = [];
        let unSelectedDays = util.removeByValue(chartLegend, today);

        // 图表数据
        let chartSeries = asynData.list.map((item,index) => {
            let seriesData = [];
            chartLegend.push(item.date);
            seriesData = item.data.map(DataItem => DataItem.online_user)
            if(index === 0 ){
                xData = item.data.map(xDataitem => xDataitem.window_end)
            }
            return {
                name: item.date,
                data: seriesData
            };
        });
        let chartData = chartConfig.line({
            title: "实时在线",
            legend: chartLegend,
            unSelected: unSelectedDays,
            xData,
            interval: 11,
            series: chartSeries
        });
        chartConfig.render("chart1", chartData);
    };

    scope.renderTable = (asynData) => {
        //  表头文本
        let thead = { date: "日期", platform_name: "系统平台", channel_name: "常规渠道", server_name: "服务器", max_online: "最高在线", min_online: "最低在线" };

        asynData.data_head.forEach(item => {
            let curTime = item.replace(/:/g, "")
            thead[`cur${curTime}`] = item;
            asynData.list.forEach(listItem => {
                listItem.data.forEach(dataItem => {
                    if (dataItem.window_end === item) {
                        listItem[`cur${curTime}`] = dataItem.online_user
                    }
                })
            })
        })
        let tableData = tableConfig.parseNewHead({
            elem: "#table1",
            fixed: 6,
            data: asynData.list,
            thead
        });
        tableConfig.render(tableData);
    };

    // 点击下载Excel
    scope.downloadExcel = (params, isExistData) => {
        // 先解绑再绑定，防止多此重复绑定
        $("#downExcel").unbind("click").on("click", function () {

            let tempParams = {}

            if (!isExistData) return

            params = Object.assign({}, params, { export: 1, nonce: "11972", timestamp: "1534844078820", sign: "66c0501741a8486b7a8cb43e94c3bc8a" })

            // 参数对象转url参数
            tempParams = util.objParseQuery(params);

            window.open("/basic_v2/real-time/online-flow?" + tempParams);

        });
    };

    scope.init = (obj => {
        _.dataReload(obj);
    })(scope);
})();