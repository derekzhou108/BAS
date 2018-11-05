/**
 * 各玩法参与情况
 */

(function (scope = {}) {

    scope.dataInit = function (params, nodes) {
        let data, tableData

        api.getPlayMethods(params).then(res => {
            _.ErrorMsg(res)

            if (!res.data || !res.data.length) return false

            data = res.data


            //  表头文本
            let thead = { date: '日期', platform_name: '系统平台', server_name: '服务器', play_id: "玩法ID", can_join_role: '活跃且具有资格的人数', join_role: '参与人数', join_ratio: '参与率', join_avg: '平均参与次数' }

            tableData = tableConfig.parseNewHead({
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

            // 参数对象转url参数
            tempParams = util.objParseQuery(params)

            window.open('/special/game/game-join?' + tempParams)
        })
    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()