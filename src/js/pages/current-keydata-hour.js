/**
 * 每小时关键数据

 */

(function (scope = {}) {

    scope.dataInit = function (params, nodes) {
        let data, tableData
        api.realKeyHour(params).then(res => {

            _.ErrorMsg(res)


            if (!res.data || !res.data.list || !res.data.list.length) return false

            data = res.data

            //  表头文本
            let thead = {
                date: '查询日期',
                platform_name: '系统平台',
                channel_name: '渠道',
                hour: '小时',
                new_user: '累计新增',
                active_user: '累计活跃',
                retention2: '累计次日留存',
                retention3: '3日留存',
                retention4: '4日留存',
                retention5: '5日留存',
                retention6: '6日留存',
                retention7: '7日留存',
                pay_user: '累计充值账号',
                pay_pur: '累计充值渗透率',
                pay_amount: '累计充值金额',
                pay_arpu: '累计充值ARPU',
                active_arpu: '累计活跃ARPU'

            }
            tableData = tableConfig.parseNewHead({
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

            if (!isExistData) return

            params = Object.assign({}, params, { export: 1, nonce: "11972", timestamp: "1534844078820", sign: "66c0501741a8486b7a8cb43e94c3bc8a" })

            tempParams = util.objParseQuery(params)

            window.open('/basic_v2/user/analysis-of-user?' + tempParams)

        })
    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()