/**
 * 下载渠道用户
 */

(function (scope = {}) {

    scope.dataInit = function (params, nodes) {
        let data, tableData

        api.channelWeek(params).then(res => {
            _.ErrorMsg(res)

            if (!res.data || !res.data.length) return false

            data = res.data

            //  表头文本
            let thead = ['自然周', '时间段', '系统平台', '常规渠道', '渠道活跃用户数', '渠道新增账户数', '渠道回流账户数', '渠道流失账户数', '渠道流失率']

            tableData = tableConfig.parse({
                elem: '#table1',
                data,
                thead
            })

            let cols = tableData.cols[0]

            // 设置第二列的最小宽度
            cols[1].minWidth = 180

            // 设置最后一列使用tpl模板
            cols[cols.length - 1].templet = '#loseRatio'

            tableConfig.render(tableData)

            return true
        }).then(res => {
            // 调用下载Excel方法
            this.downloadExcel(params, res)
        })
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

            window.open('/basic/channel/channel-week?' + tempParams)

        })
    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()