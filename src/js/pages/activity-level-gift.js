/**
 * 各玩法参与情况
 */

(function (scope = {}) {

    scope.dataInit = function (params, nodes) {
        let data, tableData

        api.getActivityGiftLevel(params).then(res => {
            _.ErrorMsg(res)

            if (!res.data || !res.data.length) return false

            data = res.data

            //  表头文本
            let thead = ['日期', '系统平台', '服务器', '势力', '等级条件', '可领取礼包角色数', '已领取礼包角色数', '礼包领取率']

            tableData = tableConfig.parse({
                elem: '#table1',
                data,
                thead
            })

            let cols = tableData.cols[0]

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

            window.open('/special/activity/gift-level?' + tempParams)
        })
    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()