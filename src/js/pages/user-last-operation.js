/**
 * 流失玩家最后操作
 */

(function (scope = {}) {

    scope.dataInit = function (params, nodes) {
        let data, tableData

        api.getUserLoseAct(params).then(res => {
            _.ErrorMsg(res)

            if (!res.data || !res.data.length) return false

            data = res.data

            //  表头文本
            let thead = ['查询日期', '系统平台', '服务器', '流失等级', '步骤ID', '步骤名称', '间接项目ID', '间接项目名称', '角色数']

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

            window.open('/special/user/lose-act?' + tempParams)
        })

    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()