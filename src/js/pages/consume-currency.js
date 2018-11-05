/*----------
*  消耗情况
----------*/

(function (scope = {}) {
    scope.curTab = {name:'',index:0}
    scope.dataInit = function (params, nodes, filterStorage) {
        let data,
            tableData,
            asyncHeads,
            tabChartTable = $('#tabChartTable'),
            layFilter = tabChartTable.attr('lay-filter'),
            element = layui.element;

        api.getMoneyList(params)
            .then(res => {
                _.ErrorMsg(res)

                if (!res.data || !res.data.length) return

                data = res.data
                res['curTab'] = this.curTab.name
                tabChartTable.html(template('tplTabContentConsume', res))
                // }).then(() => {
                if (!data || !data.length) return

                let moneyType = util.getProperties(data, 'money_type'), // 获取接口所需参数'money_type'
                    charts = tabChartTable.find('.chart'),
                    tables = tabChartTable.find('.data-table'),
                    selects = tabChartTable.find('.custom-select'),
                    self = this

                function toSort(money_type) {
                    let param = Object.assign(params, {
                        money_type
                    })
                    return api.moneyCost(param)
                }

                function fecthData(type, typeIndex) {
                    toSort(type).then(res => {

                        // 表头字段
                        // const prefixThead = ['日期', '系统平台', '服务器', '势力', '今日总消耗']
                        // let theads = moneyType.map(() => [...prefixThead])


                        _.ErrorMsg(res, typeIndex)

                        // 数据列表与表头字段
                        data = res.data.list
                        asyncHeads = res.data.label

                        if ((Array.isArray(res.data) && !res.data.length) || !data) return false

                        // // 深复制拷贝-用于表格处理数据
                        let tempData = util.deepClone(data)

                        // // 获取后台返回日期范围数据
                        // let dateRange = []
                        // data.forEach(item => {
                        //     if (!dateRange.includes(item.date)) {
                        //         dateRange.push(item.date)
                        //     }
                        // })

                        // // 绘制数据日期显示
                        // let renderTpl = template('tplRenderDate', dateRange)
                        // // 绑定日期选择事件-重新绘制图
                        // selects.eq(typeIndex).html(renderTpl).on('change', 'select', function (e) {
                        //     const val = $(this).val()
                        //     // 注意这里需要保存循环的数据
                        //     self.renderSelectDate(val, charts[typeIndex].id, data)
                        // })
                        let renderChartData = util.subFilterRender({filterStorage, data, scope, isPie:true, filterEle:'subFilter-warp'+typeIndex,chartEle:charts[typeIndex].id})
                        /* ----- 默认渲染返回第一条日期数据图------ */
                        self.renderChart({selectDate:data[0].date, chartEle:charts[typeIndex].id, renderChartData})

                        /* ----- 渲染表格数据  -----*/
                        tempData.forEach(item => {
                            item.data.forEach((k, j) => {
                                item[k.reason_id] = k.total_num
                            })
                        })

                        tableData = tableConfig.parseHead({
                            elem: '#' + tables[typeIndex].id,
                            thead: asyncHeads,
                            data: tempData,
                            fixed: 5
                        })

                        tableConfig.render(tableData)

                        return true

                    }).then(res => {
                        // 调用下载Excel方法
                        self.downloadExcel(params, res)
                    })
                }



             //默认获取第一个tab类型
              fecthData(self.curTab.name || moneyType[0], self.curTab.index)

                //点击tab切换并且根据type请求数据
                element.on('tab(consume)', function (ele) {
                    let select = $(this).data('type')
                    self.curTab.name = select
                    self.curTab.index = ele.index
                    fecthData(select, ele.index)

                });

            })

        chartConfig.tabResizeChart(layFilter)

        // 调用下载Excel方法
        this.downloadExcel(params)
    }

    // 渲染指定日期图
    scope.renderChart = ({selectDate, chartEle, renderChartData}) => {
        let chartData
        // 限定比率 -- 小于该值绘图归为->其他
        const ratio = 0.01
        let ratioData = []
        let ratioObj = { 'name': '其他', value: 0 }

        // 处理选中日期数据
        const currentDate = selectDate
        let dataForDate = renderChartData.filter(item => item.date === currentDate)

        // chart使用 - 注意这里取第一个数据，并处理其他小于比率的数据
        let dataForChart = dataForDate.map(item => {
            return item.data.filter(k => {
                if ((k.total_num / item.all_num) >= ratio) {
                    return true
                } else {
                    ratioData.push(k.total_num)
                    return false
                }
            })
        }).shift()

        // 计算合并的其他项总数据
        const reducer = (accumulator, currentValue) => accumulator + currentValue
        ratioObj.value = ratioData.length ? ratioData.reduce(reducer) : 0

        /* ----- 渲染图表数据  -----*/
        let legend = dataForChart.map(item => {
            return item.reason_name
        })
        let legendType = 'scroll'
        let series = dataForChart.map(item => {
            return {
                name: item.reason_name,
                value: item.total_num
            }
        })

        // 数值不为0则追加至chart数据
        if (ratioObj.value) {
            series.push(ratioObj)
            legend.push(ratioObj.name)
        }

        chartData = chartConfig.pie({
            name: '消耗情况',
            legend,
            legendType,
            series
        })

        chartConfig.render(chartEle, chartData)
    }

    // 点击下载Excel
    scope.downloadExcel = (params, isExistData) => {

        // 先解绑再绑定，防止多此重复绑定
        $('#downExcel').unbind("click").on('click', function () {
            let money_type = $('#tabChartTable').find('.layui-tab-title .layui-this').data('type')
            let tempParams = {}

            params.money_type = money_type
            if (!isExistData) return


            params = Object.assign({}, params, {
                export: 1
            })

            tempParams = util.objParseQuery(params)
 
            window.open('/special/cost/money-cost?' + tempParams)
        })

    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()