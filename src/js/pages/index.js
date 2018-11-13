/*----------
*  着陆页[项目游戏列表]
----------*/
;
(function (scope) {
    scope = scope || {}

    // 项目游戏表格渲染
    scope.tableInit = function () {
        let projectListWrap = $('#projectListWrap')
        let selectProListWrap = $('#selectProListWrap')

        api.getIndex().then(res => {
            _.ErrorMsg(res)
            // 清空Storage
            util.clearStorage()

            let data = res.data
            let { element } = layui

            // 渲染项目列表
            selectProListWrap.html(template('tplSelectProList', data))
            projectListWrap.html(template('tplProjectList', data)).show()

            element.init()

            // 点击项目列表，将所选项目的信息存入storage
            projectListWrap.on('click','.item', function () {
                setInfo(this)
            })
            selectProListWrap.on('click','.item', function () {
                setInfo(this)
            })

            // 存入一些信息至Storage
            function setInfo(obj) {
                let appList = $(obj).data('info')
                let proName = $(obj).data('name')
                let proId = $(obj).data('pid')

                if (!appList.length) {
                    // layer.msg('该项目下暂无游戏')
                    layer.msg('该游戏缺少appList参数')
                    return false
                }

                // 存入该项目名称
                util.setStorage('proName', proName)

                // 存入该项目ID
  
                util.setStorage('proId', proId)

                // 存入该项目下的游戏列表
                util.setStorage('appList', appList)

                //默认选择汇总
                util.setStorage('appId', 'all')

                location.href = "/dist/home.html"
            }
        })


    }

    scope.init = ((obj) => {
        obj.tableInit()
    })(scope)
})()