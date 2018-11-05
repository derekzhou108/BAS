/*----------
*  运营活动参与情况
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
                tables = tabChartTable.find('.data-table'),
                self = this

            function toSort(shop_type) {
                let param = Object.assign(params, {
                    activity_type:shop_type
                })
                return api.getActivityJoin(param)
            }

            //根据类型获取数据
            function fecthData(type, typeIndex) {

                toSort(type).then(res => {

                    // 表头字段
                    const thead = {date:'日期', platform_name:'系统平台', channel_name:'渠道',server_name:"服务器",activity_role:'活跃角色数',join_role:'参与活动人数',join_ratio:'参与率',total_cost_money:'累计消费金额'}

                    _.ErrorMsg(res, typeIndex)

                    if (!res.data || !res.data.list || !res.data.list.length) return false

                    data = res.data

                    /* ----- 默认渲染返回第一条日期数据图------ */

                   

                    /* ----- 渲染表格数据  -----*/
                    
                    tableData = tableConfig.parseNewHead({
                        elem: '#' + tables[typeIndex].id,
                        data: data.list,
                        thead
                    })

                    tableConfig.render(tableData)

                    return true

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


    }


    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()