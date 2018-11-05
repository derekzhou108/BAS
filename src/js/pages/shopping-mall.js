/*----------
*  商城销售情况
----------*/

(function (scope = {}) {
    scope.curTab = { name: '', index: 0 }
    scope.dataInit = function (params, nodes, filterStorage) {
        let data, tableData,
            tabChartTable = $('#tabChartTable'),
            layFilter = tabChartTable.attr('lay-filter'),
            element = layui.element;

        api.getShopList(params).then(res => {

            _.ErrorMsg(res)

            if (!res.data || !res.data.length) return

            data = res.data
            res['curTab'] = this.curTab.name
            tabChartTable.html(template('tplTabContentShop', res))

            if (!data || !data.length) return

            let shopType = util.getProperties(data, 'shop_type'), // 获取接口所需参数'shop_type'
                shopName = util.getProperties(data, 'shop_name'),
                charts = tabChartTable.find('.chart'),
                tables = tabChartTable.find('.data-table'),
                selects = tabChartTable.find('.custom-select'),
                self = this

            function toSort(shop_type) {
                let param = Object.assign(params, {
                    shop_type
                })
                return api.shopSale(param)
            }

            //根据类型获取数据
            function fecthData(type, typeIndex) {

                toSort(type).then(res => {

                    // 表头字段
                    const thead = ['日期', '系统平台', '服务器', '势力', '物品类型', '物品名称', '销售数量', '购买角色数', '销售总金额']

                    _.ErrorMsg(res, typeIndex)

                    if (!res.data || !res.data.length) return false

                    data = res.data

                    // 获取后台返回日期范围数据
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
                    tableData = tableConfig.parse({
                        elem: '#' + tables[typeIndex].id,
                        data,
                        thead
                    })

                    tableConfig.render(tableData)

                    return true

                }).then(res => {
                    // 调用下载Excel方法
                    self.downloadExcel(params, res)
                })
            }

            //默认获取第一个tab类型
            fecthData(self.curTab.name || shopType[0], self.curTab.index)

            //点击tab切换并且根据type请求数据
            element.on('tab(shopping)', function (ele) {
                let select = $(this).data('type')
                self.curTab.name = select
                self.curTab.index = ele.index
                fecthData(select, ele.index)

            });
        })

        chartConfig.tabResizeChart(layFilter)

    }

    // 渲染指定日期图
    scope.renderChart = ({selectDate, chartEle, renderChartData}) => {
        let chartData
        // 限定比率 -- 小于该值绘图归为->其他
        const ratio = 0.01
        let ratioData = []
        let ratioObj = { 'name': '其他', value: 0 }
        // console.log(selectDate,renderChartData)

        // 处理选中日期数据，并计算该天总销售
        const currentDate = selectDate
        let valueForDate = 0
        let dataForDate = renderChartData.filter(item => {
            if (item.date === currentDate) {
                valueForDate += item.total_money
                return true
            }
        })

        // chart使用 - 并处理其他小于比率的数据
        let dataForChart = dataForDate.filter(item => {
            if ((item.total_money / valueForDate) >= ratio) {
                return true
            } else {
                ratioData.push(item.total_money)
                return false
            }
        })

        // 计算合并的其他项总数据
        const reducer = (accumulator, currentValue) => accumulator + currentValue
        ratioObj.value = ratioData.length ? ratioData.reduce(reducer) : 0

        /* ----- 渲染图表数据  -----*/
        // 需要根据日期来显示
        // 图表Legend
        let legend = dataForChart.map(item => {
            return item.prop_name
        })
        let legendType = 'scroll'

        let series = dataForChart.map(item => {
            return {
                name: item.prop_name,
                value: item.total_money
            }
        })

        // 数值不为0则追加至chart数据
        if (ratioObj.value) {
            series.push(ratioObj)
            legend.push(ratioObj.name)
        }

        chartData = chartConfig.pie({
            name: '销售总金额',
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
            let shop_type = $('#tabChartTable').find('.layui-tab-title .layui-this').data('type')
            let tempParams = {}


            params.shop_type = shop_type

            if (!isExistData) return


            params = Object.assign({}, params, {
                export: 1
            })

            tempParams = util.objParseQuery(params)

            window.open('/special/shop/shop-sale?' + tempParams)
        })

    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()