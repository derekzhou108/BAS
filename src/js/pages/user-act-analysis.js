/**
 * 玩家滚服行为分析
 */

(function(scope = {}) {

    scope.dataInit = function(params, nodes) {
        let data, tableData
 
        api.getUserActAnalysis(params).then(res => {
      
            _.ErrorMsg(res)
            
            if (!res.data || !res.data.list || !res.data.list.length) return false

            data = res.data
       
            //  表头文本
            let thead = ['查询日期', '系统平台', '渠道', '服务器', '新增用户数', '活跃用户数', '滚服新增用户数', '滚服新增用户占比', '滚服活跃用户数','滚服活跃用户占比','滚服用户流水收入','滚服活跃用户付费人数','滚服活跃用户付费渗透率','滚服用户ARPU','滚服用户ARPPU']

            tableData = tableConfig.parse({
                elem: '#table1',
                data:data.list,
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

                params = Object.assign({}, params, { export: 1, nonce:"11972", timestamp:"1534844078820",sign: "66c0501741a8486b7a8cb43e94c3bc8a"    })

                tempParams = util.objParseQuery(params)

                window.open('/special_v2/user/analysis-of-roll?' + tempParams)
    
        })
    }

    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()