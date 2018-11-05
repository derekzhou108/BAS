/**
 * 玩家行为跟踪
 */

(function (scope = {}) {

    scope.dataInit = function (params, nodes) {
        let data, tableData

        api.getUserActTrack(params).then(res => {

            _.ErrorMsg(res)

            if (!res.data || !res.data.list || !res.data.list.length) return false

            data = res.data

            //  表头文本
            let thead = ['查询日期', '系统平台', '渠道', '广告渠道', '激活设备数', '注册设备数', '创角设备数', '注册率', '创角率']

            tableData = tableConfig.parse({
                elem: '#table1',
                data: data.list,
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
      
                // 刷新参数对象
                if (!isExistData) return

                params = Object.assign({}, params, { export: 1, nonce:"11972", timestamp:"1534844078820",sign: "66c0501741a8486b7a8cb43e94c3bc8a"    })

                tempParams = util.objParseQuery(params)

                window.open('/special_v2/user/general-player-track?' + tempParams)
          
        })
    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()