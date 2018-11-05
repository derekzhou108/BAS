/**
 * 玩家任务完成情况
 */

(function (scope = {}) {

    scope.dataInit = function (params, nodes) {
        let data, chartData, tableData

        api.getUserTask(params).then(res => {
            _.ErrorMsg(res)

            if (!res.data || !res.data.length) return false

            data = res.data

            //  表头文本
            let thead = ['日期', '系统平台', '服务器', '任务类型', '任务ID', '任务名称', '接取玩家数', '完成玩家数', '完成率']

            tableData = tableConfig.parse({
                elem: '#table1',
                data,
                thead
            })

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

            tempParams = util.objParseQuery(params)

            window.open('/special/user/task?' + tempParams)
        })

    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()