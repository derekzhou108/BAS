/**
 * 各玩法参与情况
 */

(function (scope = {}) {

    scope.dataInit = function (params, nodes) {
        let data, tableData

        api.getUserPaid(params).then(res => {
            _.ErrorMsg(res)

            if (!res.data || !res.data.length) return false

            data = res.data

            //  表头文本
            let thead = {date:'日期', platform_name:'系统平台', server_name:'服务器', camp_name:'势力', uid:'玩家账号', role_id:'角色ID', role_name:'角色名', role_occupation:'玩家所在帮派名称', vip_level:'玩家等级', war_value:'玩家战力', accumulate_money:'玩家累计充值金额', yesterday_money:'玩家昨日充值金额',login_interval_day:"未登陆天数",pay_interval_day:"未充值天数"}

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

            tempParams = util.objParseQuery(params)

            window.open('/special/user/pay?' + tempParams)
        })

    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()