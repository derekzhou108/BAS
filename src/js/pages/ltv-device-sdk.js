/*----------
*  ltv平台设备
----------*/

(function (scope = {}) {
    scope.curTab = { name: '', index: 0 }
    scope.dataInit = function (params, nodes) {
        let data, tableData
        const LTV_TYPES = ['ltv', 'pay'], //类型
            element = layui.element,
            self = this


        function toSort(type) {
            let param = Object.assign({}, params, {
                type
            })
            return api.ltvAdChannel(param)
        }
        function fecthData(type, typeIndex) {
            toSort(type).then(res => {

                _.ErrorMsg(res, typeIndex)

                if (!res.data || !res.data.length) return false

                data = res.data

                //  表头文本
                let thead = ['日期', '系统平台', '常规渠道', '广告渠道', '新注册设备数', typeIndex === 0 ? '平均价值' : '汇总付费']
                let theadLen = thead.length
                let tableId = $('.data-table')[typeIndex].id //表格ID
                let ltvDays = Object.keys(data[0]).filter((item, index) => index > theadLen - 1).map((item, j) => typeIndex === 0 ? `LTV${j + 1}` : (j === 0 ? `当日付费` : `${1 + j}日付费`))

                thead = [...thead, ...ltvDays]

                tableData = tableConfig.parse({
                    elem: '#' + tableId,
                    fixed: theadLen,
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
        fecthData(self.curTab.name || LTV_TYPES[0], self.curTab.index)

        //点击tab切换并且根据type请求数据
        element.on('tab(operationAll)', function (ele) {
            let select = $(this).data('type')
            self.curTab.name = select
            self.curTab.index = ele.index
            fecthData(select, ele.index)

        });
    }

    // 点击下载Excel
    scope.downloadExcel = (params, isExistData) => {
        // 先解绑再绑定，防止多此重复绑定
        $('#downExcel').unbind("click").on('click', function () {

            let type = $('#tabChartTable').find('.layui-tab-title .layui-this').data('type')

            let tempParams = {}

            if (!isExistData) return

            params.type = type

            params = Object.assign({}, params, {
                export: 1
            })

            // 参数对象转url参数
            tempParams = util.objParseQuery(params)

            window.open('/basic/ltv/ltv-ad?' + tempParams)

        })
    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()