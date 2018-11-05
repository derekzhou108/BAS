; (function (scope = {}) {
    scope.logIn = (function () {
        // 获取参数token存储到cookie
        let token = util.getQueryString('session')
        if (token) {
            $.removeCookie('Bi-Admin-Token')
            $.cookie('Bi-Admin-Token', token, {
                expires: 2,
                path: '/' 
            })
        }
    })()

    // 登出注销
    scope.logOut = (function () {
        let logOut = $("#logOut"), //退出按钮
            token = $.cookie('Bi-Admin-Token'),
            logOutPort = `/site/logout?token=${token}`;
        logOut.on("click", () => {
            layer.confirm("确定要退出登录吗？", {
                btn: ["确定", "取消"] //按钮
            }, () => {
                util.clearStorage();
                $.removeCookie('Bi-Admin-Token')
                location.href = logOutPort
            });
        });
    })();
})()


