/**
 * 玩家首充等级分布
 */

(function (scope = {}) {

    scope.dataInit = function (params, nodes, filterStorage) {
        let data, element = layui.element


        api.getPayFirstCharge(params).then((res) => {

            _.ErrorMsg(res)


            if (!res.data || !res.data.list || !res.data.list.length) return false

            data = util.headSort(res.data)

            let renderChartData = util.subFilterRender({filterStorage, data, scope})
            // //渲染表格

            this.renderTable(lodash.cloneDeep(data))
            //渲染图表默认展示第一个数据
            this.renderChart({renderChartData})

            return true
        }).then(res => {
            // 调用下载Excel方法
            this.downloadExcel(params, res)
        })
    }



    scope.renderChart = ({renderChartData}) => {
        let xData = renderChartData.data_head.map(item => `等级${item}`)
        let legend = renderChartData.list.map(item => item.date)
        let chartSeries = util.supplement(renderChartData, 'role_level', 'pay_role');
        let chartData = chartConfig.yBar({
            legend: legend,
            xData,
            series: chartSeries
        })
        chartConfig.render('chart1', chartData)
    }


    scope.renderTable = (asynData) => {

        let thead = { date: '日期', platform_name: '系统平台', channel_name: '常规渠道', server_name: '服务器' },//  表头文本
            theadLength = Object.keys(thead).length,
            tableData, //表格渲染的config
            mainCols, //一维表头
            subCols //二维表头

        //与固定表头联合
        asynData.data_head.forEach((item) => {
            thead[`level${item}`] = `等级${item}`;
        })
        asynData.list.forEach(listItem => {
            listItem.data.forEach((dataItem) => {
                listItem[`level${dataItem.role_level}`] = dataItem.pay_role
            })

        })

        //转化成表格渲染的格式数据
        tableData = tableConfig.parseNewHead({
            elem: '#table1',
            data: asynData.list,
            thead
        })
        mainCols = tableData.cols[0] //一维表头
        subCols = tableData.cols[1] = [] //二维表头

        // 设置一维表表头
        mainCols.forEach((item, index) => {

            if (index < theadLength) {
                item.rowspan = 2
                item.fixed = 'left'
                item.align = 'center',
                    item.minWidth = index === 0 ? 180 : 120
            } else {
                item.colspan = 1
                item.align = 'center'
                item.minWidth = 150
                item.sort = false
                // 设置二维表头
                subCols.push({
                    field: item.field,
                    title: '首充付费人数',
                    align: 'center',
                    sort: true,
                    minWidth: 150
                })
                delete item.field
            }
        })
        tableConfig.render(tableData)
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
            
            window.open('/special_v2/pay/first-charge-distribution?' + tempParams)

        })
    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()