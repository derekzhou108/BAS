/**
 * 各服务器留存数据（有效帐号）
 */

(function (scope = {}) {

    scope.dataInit = function (params, nodes, filterStorage) {
        let data, element = layui.element


        api.stayServer(params).then((res) => {

            _.ErrorMsg(res)

            if (!res.data || !res.data.list || !res.data.list.length) return false

            data = util.headSort(res.data)

            this.renderTable(lodash.cloneDeep(data))


            return true
        })
    }



    scope.renderTable = (asynData) => {

        let thead = { date: '日期', platform_name: '系统平台', server_name: '服务器', new_user_role:"新增有效帐号数"},//  表头文本
            tableData; //表格渲染的config

        //与固定表头联合
        asynData.data_head.forEach((item) => {
            thead[`num${item}`] = `${item}`;
        })

        asynData.list.forEach(listItem => {
            listItem.data.forEach((dataItem) => {
                listItem[`num${dataItem.number}`] = dataItem.retention_ratio
            })

        })

        //转化成表格渲染的格式数据
        tableData = tableConfig.parseNewHead({
            elem: '#table1',
            data: asynData.list,
            thead
        })

        tableConfig.render(tableData)
    }



    scope.init = (obj => {
        _.dataReload(obj)
    })(scope)
})()