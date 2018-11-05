
(function (root) {
	root.api = {
		post(url, data) {
			let def = $.Deferred(); //一个工厂函数，这个函数返回一个链式实用对象，用返回对象方法来在回调队列中注册多个回调， 调用回调队列，传递任何同步或异步函数的成功或失败状态。
			$.post(url, data).then(res => {
				if (res.code && res.code === 10003 && res.data && res.data.redirect_url) {
					window.location.href = res.data.redirect_url;
				}
				def.resolve(res);
			});
			return def;
		},
		get(url, data) {
			let def = $.Deferred();
			$.get(url, data).then(res => {
				if (res.code && res.code === 10003 && res.data && res.data.redirect_url) {
					window.location.href = res.data.redirect_url;
				}
				def.resolve(res);
			});
			return def;
		},
		jsonp(url, data) {
			let def = $.Deferred();
			let baseUrl = "";
			$.ajax({
				url: baseUrl + url,
				type: "get",
				dataType: "jsonp",
				jsonp: "callback",
				data: data
			}).then(res => {
				if (res.code === 10000) {
					def.resolve(res);
				} else {
					layer.alert(res.msg);
					def.reject(res);
				}
			});
			return def;
		},
		/**
         * 首页
         *
         * @param {any} params
         * @returns
         */
		getIndex() {
			return this.get("/system_v2/common/project-list");
		},

		/**
         * 侧边栏
         */
		getMenu(params) { //首页,（包含项目列表和游戏列表）
			return this.get("/system_v2/common/menu-list", params);
		},
		/**
         * 游戏列表
         *  */
		getAppList() { //游戏列表
			return this.get("/system/app/list");
		},
		getMoneyList(params) { //货币列表
			return this.get("/system/money/list", params);
		},
		getMoneyStockList(params) { //存量货币列表
			return this.get("/system/money-stock/list", params);
		},
		getShopList(params) { //商城列表
			return this.get("/system/shop/list", params);
		},

		/**
         * 筛选模块(具有下拉传参功能)
         */
		filterPlatform(params) { // 系统平台列表
			return this.get("/system/app/one", params);
		},
		filterServer(params) { //服务器列表
			return this.get("/system/server/list", params);
		},
		filterChannel(params) { //渠道列表
			return this.get("/system_v2/common/channel-list", params);
		},
		filterAdChannel(params) { //广告渠道列表
			return this.get("/system_v2/common/ad-channel-list", params);
		},
		filterPropList(params) { //物品列表
			return this.get("/system_v2/common/goods-list", params);
		},
		filterCampList(params) { //势力筛选
			return this.get("/system/camp/list", params);
		},
		filterShopGongxianList(params) { //贡献商城代币列表
			return this.get("/system/money/gongxian-list", params);
		},
		filterStockGongxianList(params) { //贡献币存量列表
			return this.get("/system/money-stock/gongxian-list", params);
		},
		filterGiftList(params) { //礼品等级
			return this.get("/system/gift/list", params);
		},
		filterChargingPoint(params) {
			return this.get("/system_v2/common/goods-list", params);
		},
		/**
         * 总况模块
         */
		generalAccount(params) { //账号
			return this.get("/basic/general/general-account", params);
		},
		generalDevice(params) { //设备
			return this.get("/basic/general/general-device", params);
		},
		generalAccountSDK(params) { //渠道
			return this.get("/basic/general/general-account-sdk", params);
		},
		generalDeviceSDK(params) { //运营总况（设备，平台数据）
			return this.get("/basic_v2/general/general-device-sdk", params);
		},

		/**
         * 流水收入模块
         */
		ltvAccount(params) { //有效账号
			return this.get("/basic/ltv/ltv-user", params);
		},
		ltvAccountSDK(params) { //账号
			return this.get("/basic_v2/ltv/ltv-sdk-user", params);
		},
		ltvDevice(params) { //设备
			return this.get("/basic/ltv/ltv-device", params);
		},
		ltvAdChannel(params) { //广告渠道
			return this.get("/basic/ltv/ltv-ad", params);
		},
		/**
         * 实时类模块
         */
		realTimePay(params) {//实时流水
			return this.get("/basic_v2/real-time/cost-flow", params);
		},
		realTimeOnLine(params) { //实时在线（账号）
			return this.get("/basic_v2/real-time/online-flow", params);

		},
		getOnlineRole(params) { //实时在线（角色）
			return this.get("/basic_v2/real-time-v2/online-role-flow", params);
		},
		realTimeRegister(params) { //实时注册
			return this.get("/basic_v2/real-time/register-flow", params);
		},
		realTimeHourRegister(params) { //实时每小时注册
			return this.get("/basic/realtime/hour-register", params);
		},

		realTimeHourReport(params) {  //实时综合报表（小时）
			return this.get("/basic_v2/real-time/stat-by-hour", params);
		},

		realTimeMinuteReport(params) { //实时综合报表（分钟）
			return this.get("/basic_v2/real-time/stat-by-minute", params);
		},

		realKeyHour(params) { //每小时关键数据
			return this.get("/basic_v2/user/analysis-of-user", params);
		},

		realRegisterMonitor(params) { //实时注册在线监控
			return this.get("/basic_v2/real-time-v2/data-monitor", params);
		},


		/**
         * 用户模块
         */
		stayAccount(params) { //留存跟踪（账号）
			return this.get("/basic/stay/stay-user", params);
		},
		stayDevice(params) { //留存跟踪（设备）
			return this.get("/basic/stay/stay-device", params);
		},
		stayUserSDK(params) { //玩家留存跟踪（账号，平台数据）
			return this.get("/basic/stay/stay-user-sdk", params);
		},
		stayDeviceSDK(params) { //玩家留存跟踪（设备，平台数据）
			return this.get("/basic/stay/stay-device-sdk", params);
		},
		stayPay(params) {//流水跟踪
			return this.get("/basic/realtime/pay", params);
		},
		stayOnLine(params) { //在线用户跟踪
			return this.get("/basic/realtime/online", params);
		},
		stayRegister(params) { //注册跟踪
			return this.get("/basic/realtime/register", params);
		},
		stayServer(params) { //各服务器留存数据（有效帐号）
			return this.get("/basic_v2/stay/stay-user", params);
		},
		stayChannel(params) { //各渠道留存数据（帐号）
			return this.get("/basic_v2/stay/stay-user-sdk", params);
		},
		/**
         * 渠道模块
         */
		channelWeek(params) { //下载渠道用户
			return this.get("/basic/channel/channel-week", params);
		},
		channelRigister(params) { //注册用户代币
			return this.get("/basic/channel/channel-register", params);
		},
		channelLogin(params) { //登录用户代币
			return this.get("/basic/channel/channel-active", params);
		},

		/**
         * 代币用户模块
         */
		goldPay(params) { //充值额度分布
			return this.get("/basic/gold/pay", params);
		},
		goldCost(params) { //消费额度分布
			if (params.type === "money") {
				return this.get("/basic/gold/cost", params);
			} else {
				return this.get("/basic_v2/gold/cost-about-level", params);
			}

		},
		/**
         * 产出模块
         */
		moneyProduct(params) { //货币产出情况
			return this.get("/special/product/money-product", params);
		},
		propProduct(params) { //物品产出情况
			return this.get("/special/product/prop-product", params);
		},
		/**
         * 消耗模块
         */
		moneyCost(params) { //货币消耗情况
			return this.get("/special/cost/money-cost", params);
		},
		propCost(params) { //物品消耗情况
			return this.get("/special/cost/prop-cost", params);
		},
		/**
         * 商城模块
         */
		shopSale(params) { //销售情况
			return this.get("/special/shop/shop-sale", params);
		},
		shopDbSale(params) { //贡献商城销售情况
			return this.get("/special/shop/daibi-shop-sale", params);
		},

		/**
         * 存量模块
         */
		getStok(params) { //存量情况
			return this.get("/special/stock/stock", params);
		},
		getGongxcianStok(params) { //贡献币情况
			return this.get("/special/stock/gongxian-stock", params);
		},
		/**
         * 玩法模块
         */
		getPlayMethods(params) { //玩法参与情况
			return this.get("/special/game/game-join", params);
		},
		/**
         * 用户玩家模块
         */
		getUserActiveLevel(params) { //活跃玩家等级分布
			return this.get("/special/user/active-level", params);
		},
		// getUserActiveLevel(params) { //每天流失用户等级分布
		//     // return this.get('', params)
		// },
		getUserPaid(params) { //付费用户数据情况
			return this.get("/special/user/pay", params);
		},
		getUserProfession(params) { //玩家职业情况
			return this.get("/special/user/profession", params);
		},
		getUserTask(params) { //玩家任务完成情况
			return this.get("/special/user/task", params);
		},
		getUserEquipmentStrengthen(params) { //玩家装备强化等级
			return this.get("/special/user/equipment-strengthen", params);
		},
		getUserEquipmentGem(params) { //玩家装备宝石等级
			return this.get("/special/user/equipment-gem", params);
		},
		getUserEquipmentAdvanced(params) { //玩家装备进阶等级
			return this.get("/special/user/equipment-advanced", params);
		},
		getUserLoseAct(params) { //玩家流失最后操作
			return this.get("/special/user/lose-act", params);
		},
		getUserActTrack(params) { //玩家行为跟踪
			return this.get("/special_v2/user/general-player-track", params);
		},
		getUserActAnalysis(params) { //玩家滚服行为分析
			return this.get("/special_v2/user/analysis-of-roll", params);
		},
		getUserGradeDistribution(params) { //流失用户等级分布
			return this.get("/special_v2/user/lose-player-distribution", params);
		},
		getUserTimeDistribution(params) { //流失用户时间分布
			return this.get("/special_v2/user-v2/lose-user-level", params);
		},
		getUserRealNameTrack(params) { //玩家实名认证跟踪
			return this.get("/special_v2/user-v2/player-certification-track", params);
		},
		getUserSharedTrack(params) { //玩家分享行为跟踪
			return this.get("/special_v2/user/share-player-track", params);
		},

		/**
         * 活动模块
         */
		getActivityMonthCard(params) { //月卡开通情况
			return this.get("/special/activity/month-card", params);
		},
		getActivityGift(params) { //每日礼包购买情况
			return this.get("/special/activity/gift-buy", params);
		},
		getActivityGiftLevel(params) { //冲等级礼包领取情况
			return this.get("/special/activity/gift-level", params);
		},
		getActivityJoin(params) { //运营活动参与情况
			return this.get("/special_v2/activity/join-data", params);
		},

		/**
         * 付费模块
         */
		getPayActAnalysis(params) { //玩家付费行为分析
			return this.get("/special_v2/pay/analysis-of-payment", params);
		},
		getPayProcessTrack(params) { //玩家充值过程跟踪
			return this.get("/special_v2/pay/player-recharge-track", params);
		},
		getPayVIP(params) { //玩家VIP等级分布
			return this.get("/special_v2/pay/vip-player-distribution", params);
		},
		getPayFirstCharge(params) { //玩家首充等级分布
			return this.get("/special_v2/pay/first-charge-distribution", params);
		},

		/**
        * Mock数据
        */
		getTipList() {
			return this.get("mock/tips.json");
		},
		/**
        * 字典
        */
		getConfList(params) {
			return this.get("/system_v2/common/conf-list", params);
		},

		updateConfList(params) {
			return this.post("/system_v2/common/set-conf", params);
		},

	};


	let index;
	let doc = $(document);

	doc.ajaxSend((event, xhr, options) => {

		//头部增加token
		let token = $.cookie('Bi-Admin-Token');
		xhr.setRequestHeader("Login-Type", 'kaiser')
		xhr.setRequestHeader("X-Token", token)
			

		//增加验签
		let nonce = "",
			timestamp = (new Date()).getTime().toString(),
			sign = "",
			addRequest = "";
		for (let i = 0; i < 5; i++) {
			nonce += util.randomFrom(1, 9);
		}

		let md5String = [timestamp, nonce].sort((a, b) => {
			let length = a.length > b.length ? a.length : b.length
			let i = 0
			while (i < length) {
				if (a[i] != b[i]) {
					return b[i] - a[i]
				}
				i++;
			}
			return b - a
		})

		sign = $.md5(md5String.join(""));
		addRequest = "nonce=" + nonce + "&timestamp=" + timestamp + "&sign=" + sign;
		options.url += options.url.indexOf("?") === -1 ? "?" + addRequest : "&" + addRequest;
	});

	doc.ajaxStart(() => {
		index = layer.load();
	});

	doc.ajaxStop(() => {
		layer.close(index);
		index = null;
	});

	doc.ajaxError((res) => {
		layer.msg("请求错误");
	});
})(window);