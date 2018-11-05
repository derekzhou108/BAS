/**
 * 流失用户等级分布
 */

(function (scope = {}) {
	scope.dataInit = function (params) {
		let data

		// 删除不必要查询参数
		delete params.start_date
		delete params.end_date
		
		api.getUserGradeDistribution(params).then(res => {

			_.ErrorMsg(res);

			if (!res.data || !res.data.list || !res.data.list.length) return false;

			data = res.data;

			// 渲染表格
			this.renderTable(util.deepClone(data))

			return true
		}).then(res => {
            // 调用下载Excel方法
            this.downloadExcel(params, res)
        })
	};

	scope.renderTable = asynData => {

		let thead = { date: "注册日期", stat_date: "统计日期", platform_name: '系统平台', channel_name: "常规渠道", server_name: "服务器", lose_day: "第几天流失" } //  表头文本
		let groupData = [] //对数据进行时间分组

		let group = asynData.list.map(item => {
			return {
				date: item.date,
				stat_date: item.stat_date,
				platform_name: item.platform_name,
				server_name: item.server_name,
				channel_name: item.channel_name
			}

		})
		group = lodash.uniqWith(group,lodash.isEqual);
		group.forEach(groupItem => {
			let temp = []
			asynData.list.forEach(item => {
				if (item.date === groupItem.date
					&& 
					item.channel_name === groupItem.channel_name
					&& 
					item.platform_name === groupItem.platform_name
					&&
					item.server_name === groupItem.server_name
					&&
					item.stat_date === groupItem.stat_date
				) {
					temp.push(item)
				}
			})
			temp.sort((a, b) => {
				return a.lose_day - b.lose_day
			})

			temp.forEach((tempItem, index) => {
				if (index > 0) {
					tempItem.date = ''
					tempItem.stat_date = ''
					tempItem.platform_name = ''
					tempItem.channel_name = ''
					tempItem.server_name = ''
				}
			})
			groupData = groupData.concat(temp)


		})

		asynData.data_head.forEach((item) => {
			thead[`level${item}`] = `等级${item}`;

		})

		groupData.forEach((listItem) => {
			listItem.data.forEach(dataItem => {
				listItem[`level${dataItem.role_level}`] = dataItem.lose_role
			})
		})



		let tableData = tableConfig.parseNewHead({
			elem: "#table1",
			data: groupData,
			fixed: 4,
			thead
		});

		tableData.cols[0].forEach(item => {
			item.sort = false;
		});
		tableConfig.render(tableData);
	}
	// 点击下载Excel

	scope.downloadExcel = (params, isExistData) => {
        // 先解绑再绑定，防止多此重复绑定
        $('#downExcel').unbind("click").on('click', () => {

			let tempParams = {}

            if (!isExistData) return

            params = Object.assign({}, params, { export: 1, nonce: "11972", timestamp: "1534844078820", sign: "66c0501741a8486b7a8cb43e94c3bc8a" })

            // 参数对象转url参数
            tempParams = util.objParseQuery(params)

            window.open('/special_v2/user/lose-player-distribution?' + tempParams)


        })
    }

	scope.init = (obj => {
		_.dataReload(obj);
	})(scope);
})();