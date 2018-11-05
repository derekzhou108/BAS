/**
 * 玩家VIP等级分布
 */

(function (scope = {}) {

    scope.dataInit = function (params, nodes, filterStorage) {
        let data, chartData, tableData, element = layui.element


        api.getPayVIP(params).then((res) => {

            _.ErrorMsg(res)

            if (!res.data || !res.data.list || !res.data.list.length) return false

            data = util.headSort(res.data)   
            
            let renderChartData = util.subFilterRender({filterStorage, data, scope, isPie:true })

            //渲染表格

            this.renderTable(lodash.cloneDeep(data))
            //渲染图表默认展示第一个数据
            this.renderChart({renderChartData})
            //渲染图表中的快捷日期选项
            // this.renderChartSelector(renderChartData)
            return true

        }).then(res => {
            // 调用下载Excel方法
            this.downloadExcel(params, res)
        })



    }

    // scope.renderChartSelector = (asynData) => {
    //     // 获取后台返回日期范围数据
    //     let dateRange = $.unique(asynData.list.map(item => item.date)),
    //         tabChartTable = $('#tabChartTable'),
    //         selects = tabChartTable.find('.custom-select'),
    //         renderTpl = template('tplRenderDate', dateRange), // 绘制数据日期显示
    //         self = scope

    //     // 绑定日期选择事件-重新绘制图
    //     selects.html(renderTpl).on('change', 'select', function (e) {
    //         let sourceData = lodash.cloneDeep(asynData)
    //         const val = $(this).val()
    //         util.filter(sourceData.list,item => item.date === val)
    //         self.renderChart(sourceData)
    //     })

    // }

    scope.renderChart = ({renderChartData}) => {
        let sourceData = (renderChartData.list.length && renderChartData.list[0].data) || []
        let legendType = 'scroll',
            legend,
            series,
            chartData

        legend = sourceData.map(item => `VIP${item.vip_level}`)
        series = sourceData.map(item => {
            return {
                name: `VIP${item.vip_level}`,
                value: item.active_role,
            }
        })

        chartData = chartConfig.pie({
            name: '玩家VIP等级分布',
            legend,
            legendType,
            series
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
            thead[`grade${item}`] = `${item}级`;
        })

        asynData.list.forEach(listItem => {
            listItem.data.forEach((dataItem) => {
                listItem[`grade${dataItem.vip_level}`] = dataItem.active_role
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
                    title: '活跃角色数',
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

            window.open('/special_v2/pay/vip-player-distribution?' + tempParams)


        })
    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()