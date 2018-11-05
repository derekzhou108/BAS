/**
 * 玩家实名认证跟踪
 */

(function (scope = {}) {

    scope.dataInit = function (params, nodes, filterStorage) {
        let data, element = layui.element


        api.getUserRealNameTrack(params).then((res) => {

            _.ErrorMsg(res)

            if (!res.data || !res.data.list || !res.data.list.length) return false

            data = util.headSort(res.data)
            
            this.renderTable(lodash.cloneDeep(data))


            return true
        }).then(res => {
            // 调用下载Excel方法
            this.downloadExcel(params, res)
        })
    }



    scope.renderTable = (asynData) => {

        let thead = { date: '日期', platform_name: '系统平台', channel_name: '广告渠道', click_times: '实名认证调起次数', click_user: '实名认证调起人数', finish_user: '实名认证完成人数' },//  表头文本
            tableData; //表格渲染的4aaa4sconfig

        //转化成表格渲染的格式数据
        tableData = tableConfig.parseNewHead({
            elem: '#table1',
            data: asynData.list,
            thead
        })

        tableConfig.render(tableData)
    }

    // 点击下载Excel
    scope.downloadExcel = (params, isExistData) => {
        // 先解绑再绑定，防止多此重复绑定
        $('#downExcel').unbind("click").on('click', function () {

            let tempParams = {}

            if (!isExistData) return

            params = Object.assign({}, params, { export: 1, nonce: "11972", timestamp: "1534844078820", sign: "66c0501741a8486b7a8cb43e94c3bc8a" })

            // 参数对象转url参数
            tempParams = util.objParseQuery(params)

            window.open('/special_v2/user-v2/player-certification-track?' + tempParams)

        })
    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()