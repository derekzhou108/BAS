
(function (root) {
	root._ = {
		container: $("#containerContent"), //内容外层
		time: 300000, //实时类定时5分钟刷新一次
		exclude: ['ad_channel_id', "channel_id"], //不需要前端手动添加的汇总的白名单筛选器

		/**
         * 报错信息
         * res:接口JSON (obj)
         */
		ErrorMsg(res, index) {
			const ErrorCode = 10000; //接口约定错误返回码
			let content = this.container.find(".layui-tab-content");
			let resCode = res.code; //返回结果错误码
			let resData = res.data; //返回结果数据对象
			let _this = this;

			//数据为空的逻辑
			function dataClear() {
				let charts, tables;
				let msgText = "该时间段暂无数据！";
				let tempTip = `<p class="tip"><i class="layui-icon layui-icon-face-cry"></i>${msgText}</p>`;
				let tempEle = content.addClass("empty");

				if (index || index === 0) {
					charts = _this.container.find(".chart").eq(index);
					tables = _this.container.find(".layui-table-view").eq(index);
					tempEle.find(".layui-tab-item").eq(index).append(tempTip);
				} else {
					charts = _this.container.find(".chart");
					tables = _this.container.find(".layui-table-view");
					tempEle.append(tempTip);
					layer.msg(msgText, {
						time: 1000
					});
				}

				// 清空图表和表格
				charts.each((index, item) => echarts.init(document.getElementById(item.id)).clear());
				tables.remove();
			}

			if (!resCode !== ErrorCode && !resData) {
				layer.msg(res.msg, {
					time: 1000
				});
				return;
			}
			// 数据是数组类型
			else if (Array.isArray(resData) && !resData.length) {
				dataClear();
				return;
			}
			// 数据是对象类型
			else if (!Array.isArray(resData) && Object.values(resData).some(item => !item.length)) {
				dataClear();
				return;
			} else {
				content.removeClass("empty");
				return;
			}

		},


		/**
         * 弹出指标说明
         */
		tipRender() {
			let tipBtn = $("#tipBtn");
			let tipName = tipBtn.data("tip");
			let title = tipBtn.text();
			if (!tipName || tipName.includes("@")) return;
			let data;
			let content = "";

			tipBtn.addClass("show").on("click", function () {
				let tbodyHtml = "";

				api.getTipList().then(res => {

					data = res.data[tipName];
					if (Array.isArray(data)) {
						data.forEach((item) => {
							tbodyHtml += `<tr><td>${item.title}</td><td>${item.formula}</td><td>${item.desc}</td></tr>`;
						});
					} else {
						let {
							list,
							text
						} = data;

						list.forEach((item) => {
							tbodyHtml += `<tr><td>${item.title}</td><td>${item.formula}</td><td>${item.desc}</td></tr>`;
						});
						let tabs = Array.from($("#tabChartTable").find("li"));
						tabs.forEach((item) => {
							tbodyHtml += `<tr><td>${$(item).text() + text.title}</td><td>${text.formula}</td><td>${text.desc}</td></tr>`;
						});
					}

					content = `<table class="layui-table">
                                  <colgroup> <col width="300"> <col width="300"> <col> </colgroup>
                                  <thead> <tr> <th>字段</th> <th>统计逻辑</th> <th>计算说明</th> </tr> </thead>
                                  <tbody> ${tbodyHtml} </tbody>
                               </table>`;

					layer.open({
						content,
						title,
						area: ["1120px", "500px"],
						yes() { // 确认按钮回调
							layer.closeAll();
						}
					});
				});
			});

		},


		/**
         * 日期控件渲染以及添加事件
         * @param {日期对象参数} dateParam
         * 
         * 
         */
		dateRender(dateParam) {
			// --------变量参数-------------	

			let pickDate = util.getStorage("pickDate") || {},
				preWeekDay = util.getPreWeekDay(),
				storageDate = util.hasStorage("pickDate") ? util.getStorage("pickDate") : {},
				multi_date = storageDate.multi_date || preWeekDay; //多选日期

			// --------方法-------------	
			let method = {
				// 多选日期初始化
				multiDate: function () {
					new Kalendae(document.getElementById("multi_date"), {
						months: 1,
						mode: "multiple",
						// dayOutOfMonthClickable: true,
						selected: multi_date,
						subscribe: {
							"date-clicked": function (date) {
							},
							'change': function () {
								pickDate["multi_date"] = util.removeAllSpace(this.getSelected());
								$("#multi-input").text(pickDate["multi_date"]);
								$("#multi-input").attr('title', pickDate["multi_date"]);
								util.setStorage("pickDate", pickDate);
							}
						}
					});
					//点击筛选框隐藏显示日期插件
					$(document).on("click", function (e) {
						var target = $(e.target);
						if (target.closest(".date").length == 0) {
							$("#multi_date").hide();
						}
					});

					$("#multi-input").parent(".date").click(() => {
						$("#multi_date").show();
					});

				},
				// 单选日期初始化
				singleDate: function (el, value, callback) {
					let laydate = layui.laydate,
						array = [], //多选日期筛选器记录
						timeOption = {}, //时间类型控件配置
						dateConfig = {} //所有时间筛选器公用配置

					//如果为时间选择器则添加配置

					if (el === '#selected_time') {
						timeOption['type'] = 'time',
							timeOption['format'] = 'HH:00'
					}

					dateConfig = Object.assign({},
						{
							elem: el,
							value,
							"btns": ["now", "confirm"],
							done(value) {
								callback instanceof Function && callback(value, array);
							}
						},
						timeOption
					)

					laydate.render(dateConfig);
				},

				init: function () {
					// 时间控件逐个绑定layui事件
					dateParam.data.forEach(item => {
						if (item.id === "multi_date") { 	//多选初始化
							this.multiDate()
						} else { //单选初始化
							this.singleDate("#" + item.id, item.date, function (v) {
								$("#" + item.id).attr('title', v);
								pickDate[item.id] = v;
								util.setStorage("pickDate", pickDate);
							}
							);
						}

					}
					);
				}
			}


			method.init()
		},

		/**
         * 日期控件内容
         *
         */
		dateTemplate() {

			// --------变量参数-------------	

			let searchWrap = $("#searchWrap"); //顶部查询外盒
			if (!searchWrap.length) return;
			let dateId = searchWrap.data("date").toString(), //筛选日期
				dateWrap = searchWrap.find(".date-select-wrap"), //日期盒子
				preWeekDay = util.getPreWeekDay(),
				today = util.getToday(),
				dateType = lodash.includes(dateId, "@@") ? [] : dateId.split(","), //传入条件筛选类型转换为数组
				curHour = new Date().getHours() + ':00',
				storageDate = util.hasStorage("pickDate") ? util.getStorage("pickDate") : {},
				start_date = storageDate.start_date || preWeekDay, //开始日期（日期段）
				end_date = storageDate.end_date || today, //结束日期（日期段）
				selected_date = storageDate.selected_date || today, //日期点
				multi_date = storageDate.multi_date || preWeekDay, //多选日期
				stat_date = storageDate.stat_date || today, //统计日期
				selected_time = storageDate.selected_time || curHour, //时间点默认当前小时
				statisticalDate = util.getStorage("statisticalRange") || {},
				dateParam = {
					data: []
				};

			// --------方法-------------

			// 根据传过来的日期类型,存储不同的对象
			dateType.forEach(id => {
				switch (id) {
					case "0": // 开始
						dateParam.data.push({
							title: "开始时间：",
							id: "start_date",
							date: start_date
						});
						break;
					case "1": // 结束
						dateParam.data.push({
							title: "结束时间：",
							id: "end_date",
							date: end_date
						});
						break;
					case "2": // 结束
						dateParam.data.push({
							title: "对比时段：",
							id: "end_date",
							date: end_date
						});
						break;
					case "3": // 单个时间查询
						dateParam.data.push({
							title: "统计时间：",
							id: "selected_date",
							date: selected_date
						});
						break;
					case "4": // 注册日期可多选
						dateParam.data.push({
							title: "注册时间：",
							id: "multi_date",
							date: multi_date
						});
						break;
					case "5": // 统计日期
						dateParam.data.push({
							title: "统计时间：",
							id: "stat_date",
							date: stat_date
						});
						break;
					case "6": // 时间日期
						dateParam.data.push({
							title: "",
							id: "selected_time",
							date: selected_time
						});
						break;
				}
			});

			// 日期模块添加内容
			dateWrap.html(template("tplDate", dateParam));

			// -------------render------------------
			return dateParam
		},

		/**
         * 初始化日期控件
         * 
         */
		dateInit() {
			let dateParam = this.dateTemplate();
			this.dateRender(dateParam)
		},


		/**
         * 定制控件渲染以及添加事件
         * 
         */
		customRender() {

			layui.use(["form", "formSelects"], () => {
				const {
					formSelects
				} = layui;

				let searchWrap = $("#searchWrap"),
					_this = this,
					multiItem = searchWrap.find(".multi-select-wrap").find(".layui-inline"), //筛选盒子
					appList = util.getStorage("appList") || [], // 当前游戏列表
					appId = util.getStorage("appId") || [], // 当前已选游戏ID
					filterStorage = util.getStorage("filterStorage") || [{ "label": "系统平台：", type: "platform_name", list: [] }], //子筛选器存储的值
					maxSelect = multiItem.data('maxselect').toString() || "" //所有筛选器最大选择数

				//判断页面是否传了maxselect筛选最大参数，如果存在系统筛选器默认选择前maxSelect个已选数据
				if (maxSelect) {
					appId = (appId.split(',')).slice(0, maxSelect)
				}


				//all选项为游戏列表默认展示汇总
				appList.unshift({ app_id: "all", app_name: "汇总", selected: true });



				// 将storage存的游戏列表匹配下拉
				if (appId !== null && (appId || appId.length)) {
					appList.forEach((item) => item.selected = appId.includes(item.app_id));
				}

				// 渲染游戏下拉
				formSelects.render({
					name: "appList", //xm-select的值
					max: maxSelect,
					on(data, arr, value, selected) { //监听数据变化

						// 将已选的值存入缓存中                 
						appId = arr.length ? arr.map(item => item.val).join(",") : "";
						util.setStorage("appId", appId);

						//如果不存在最大选择数，则all选项和其他选项互斥
						if (!maxSelect) {
							let dom = $("#selectGame").find(".layui-anim")
							let selectDom = dom.find(".xm-select-this")
							if (value.val === "all" && selected) {
								selectDom.not("[lay-value='all']").trigger("click");
							} else if (value.val !== "all" && selected) {
								selectDom.closest("[lay-value='all']").trigger("click");
							}
						}

						// 将已选的值塞入filterStorage子筛选器缓存中
						let selectName = arr.filter(it => it.val !== "all");
						filterStorage.forEach(item => {
							if (item.type === "platform_name") {
								item.list = selectName;
							}
						});
						util.setStorage("filterStorage", filterStorage);

						//刷新页面
						window.location.reload()

					},
					maxTips: function (arr, val, max) {
						layer.msg(`选择不能超过${max}条`, { icon: 2 })
					},
					data: {
						arr: appList,
						name: "app_name", //定义name的key, 默认name
						val: "app_id" //定义val的key, 默认val
					}
				});

				// 渲染筛选下拉
				Array.from(multiItem).forEach((item) => {
					let type = $(item).data("restype"); //与后台返回筛选字段相匹配
					let label = $(item).find("label").html(); //筛选器名称
					let renderName = $(item).data("type")

					filterStorage.push({ label, type, list: [] }); //根据筛选器数目增加子筛选器对象
					formSelects.delete(renderName, true); //清除已渲染的筛选器

					formSelects.render({
						name: renderName,
						max: maxSelect,
						on(data, arr, value, selected) {

							//如果不存在最大选择数，则all选项和其他选项互斥
							if (!maxSelect) {
								let selectDom = $(item).find(".layui-anim .xm-select-this")
								if (value.val === "all" && selected) {
									selectDom.not("[lay-value='all']").trigger("click");
								} else if (value.val !== "all" && selected) {
									selectDom.closest("[lay-value='all']").trigger("click");
								}
							}


							pushSubFilter(arr)

						},
						maxTips: function (arr, val, max) {
							layer.msg(`选择不能超过${max}条`, { icon: 2 })
						}
					});

					// 将已选的值塞入filterStorage 
					function pushSubFilter(arr) {
						arr = arr.filter(it => it.val !== "all");
						filterStorage.forEach(storageItem => {
							if (storageItem.type === $(item).data("restype")) {
								storageItem.list = arr;
							}
						});
						util.setStorage("filterStorage", filterStorage);
					}

					pushSubFilter(formSelects.value($(item).data("type")))

				});

			});
		},

		/**
		 * 定制控件内容
		 */

		customTemplate() {

			// --------变量参数-------------	
			let searchWrap = $("#searchWrap"); //顶部查询外盒
			if (!searchWrap.length) return;

			let multiId = searchWrap.data("filter").toString() //筛选条件
				, maxSelect = searchWrap.data("maxselect") //筛选器的最大选择器
				, removeAll = searchWrap.data("removeall") //筛选器是否去除汇总
				, multiType = multiId.length > 1 ? multiId.split(",") : [multiId.toString()] //传入条件筛选类型转换为数组
				, removeAllArray = lodash.includes(removeAll, "@@") ? '' : removeAll.split(",") //传入条件筛选类型转换为数组
				, multiTemp = ""
				, _this = this
				, multiWrap = searchWrap.find(".multi-select-wrap"); //筛选盒子


			const params = {
				app_id: util.getStorage("appId"),
				project_id: util.getStorage("proId")
			}
			const filterParam = [
				{
					id: "1",
					title: "服务器",
					type: "server_id",
					resType: "server_name",
				},
				{
					id: "2",
					title: "常规渠道",
					type: "channel_id",
					resType: "channel_name",

				},
				{
					id: "3",
					title: "广告渠道",
					type: "ad_channel_id",
					resType: "ad_channel_name",

				},
				{
					id: "4",
					title: "势力",
					type: "camp_type",
					resType: "camp_type",

				},
				{
					id: "5",
					title: "物品名称",
					type: "prop_id",
					resType: "prop_name",

				},
				{
					id: "6",
					title: "代币类型",
					type: "daibi_money_type",
					resType: "daibi_money_type",

				},
				{
					id: "7",
					title: "代币类型",
					type: "daibi_money_type",
					resType: "daibi_money_type",

				},
				{
					id: "8",
					title: "礼品等级",
					type: "select_id",
					resType: "select_name",

				},
				{
					id: "9",
					title: "计费点",
					type: "goods_id",
					resType: "goods_name",

				},
				{
					id: "10",
					title: "常规渠道",
					type: "channel_id",
					resType: "channel_name",
					selectRadio: "xm-select-radio"
				},
			]

			// --------方法-------------	
			let method = {
				//渲染下拉筛选的逻辑 resType与后台返回的字段名字相匹配
				toSort: function (type) {
					switch (type) {
						case "1": // 服务器
							return api.filterServer(params);
							break;
						case "2": // 常规渠道
							return api.filterChannel(params);
							break;
						case "3": // 广告渠道
							return api.filterAdChannel(params);
							break;
						case "4": // 势力
							return api.filterCampList(params);
							break;
						case "5": // 物品名称
							return api.filterPropList(params);
							break;
						case "6": // 代币类型-商城
							return api.filterShopGongxianList(params);
							break;
						case "7": // 代币类型-存量
							return api.filterStockGongxianList(params);
							break;
						case "8": // 礼品等级
							return api.filterGiftList(params);
							break;
						case "9": // 计费点
							return api.filterChargingPoint(params);
							break;
						case "10": // 常规渠道单选
							return api.filterChannel(params);
							break;
						default:
							layer.msg("筛选参数类型错误");
							break;
					}
				},

				// 遍历渠道筛选
				init: function () {
					return Promise.all(multiType.map(item => method.toSort(item))).then(resArr => {

						resArr.forEach((res, index) => {
							const ErrorCode = 10000; //接口约定错误返回码
							if (res.code !== ErrorCode) {
								layer.msg(filterParam[index].title + "信息获取失败！");
								return;
							}
						});



						// 将静态字段title和type,并入接口数据中
						multiType.forEach((k, j) => resArr[j] = Object.assign(resArr[j], filterParam[k - 1]));

						// 拼接模板,因返回的数据有可能出现重复，所有以selec_id为标识进行去重，并且把存在汇总的权限放在第一个选择列表中
						resArr.forEach((item, index) => {

							let isAll = false

							if (_this.exclude.indexOf(item.type) == -1) {
								item.data.unshift({ select_id: 'all', name: "汇总" })
							} else {
								item.data = lodash.filter(item.data, (item) => {
									if (item.select_id === 'all') {
										isAll = true
									}
									return item.select_id !== 'all'
								})

								if (isAll && !removeAllArray[index]) {
									item.data.unshift({ select_id: 'all', name: "汇总" })
								}
							}

							multiTemp += template("tplMulti", item);

						});
						
						multiWrap.html(multiTemp);
					})
				}
			}

			return method.init()
		},

		/**
         * 初始化定制控件
         * 
         */
		customInit() {
			return this.customTemplate().then(() => {
				this.customRender();
			})
		},

		/**
         * 初始化所有控件
         * 
         */
		initAll() {
			this.tipRender()
			this.dateInit()
			return this.customInit()
		},


		/**
         * 获取定制类筛选器参数
         * @param {需要合并覆盖的对象} obj
         */
		getFilterParams(obj = {}) {

			let formSelects = layui.formSelects,
				_this = this,
				filterDom = $(".request-filter"); //获取所有过滤器

			if (!filterDom || !filterDom.length) return;

			//点击查询按钮时如果过滤器没有选择任何内容则数据请求为all除了白名单筛选器，需默认重新渲染下拉展示第一个
			filterDom.each((index, item) => {
				let type = $(item).data("type");
				let typePram = formSelects.value(type);
				if (typePram.length) {
					obj[type] = typePram.map(k => k.val).join(",")
				} else if (!typePram.length && _this.exclude.indexOf(type) == -1) {
					obj[type] = "all"
					formSelects.render({ name: type });
				} else {
					obj[type] = ""
				}

			});

			return obj;


		},



		/**
         *  统一筛选参数拼接
         * @return {start_date:"2018-01-01",end_date:"2018-01-07"，project_id:5 .....}
         * @param {需要合并覆盖的对象} obj
         */
		getCommonParams(obj = {}) {

			let preWeekDay = util.getPreWeekDay(), //上周日期
				filterParams = this.getFilterParams(), //获取筛选器选择的值
				today = util.getToday(), //今天日期
				curHour = new Date().getHours() + ':00', //当前小时取整
				storageDate = util.hasStorage("pickDate") ? util.getStorage("pickDate") : {},
				start_date = storageDate.start_date || $("#date_start").text() || preWeekDay, //查询起始时间
				end_date = storageDate.end_date || $("#date_end").text() || today, //查询结束时间
				multi_date = storageDate.multi_date || $(".multi_date").text() || preWeekDay,//注册时间
				stat_date = storageDate.stat_date || $("#stat_date").text() || today,//统计时间
				selected_date = storageDate.selected_date || $("#selected_date").text() || today, //查询时间点
				selected_time = storageDate.selected_time || curHour, //时间点默认当前小时
				project_id = util.getStorage("proId") || "", //项目ID
				app_id = util.getStorage("appId") || ""// 游戏ID

			// 除动态筛选器返回的参数
			let tmpParams = {
				project_id,
				app_id,
				start_date,
				end_date,
				selected_date,
				multi_date,
				stat_date,
				selected_time,
				hour: selected_time,
				export: "0",
			};

			//如果存在filterParams则说明筛选器已渲染完成
			return Object.assign({}, tmpParams, filterParams, obj);
		},

		/**
         *  页面数据联动与重载(入口方法)
         *  @param {obj} 调用对象
         */
		dataReload(obj) {
			let _this = this,
				filterStorage = util.getStorage("filterStorage");

			// 刷新或者进入新的页面清除除系统平台的其他筛选器缓存值
			if (filterStorage) {
				filterStorage = filterStorage.filter(item => item.type === "platform_name");
				util.setStorage("filterStorage", filterStorage);
			}

			function reload(filterStorage) {
				// 每次重载数据时，清除实时类定时器
				if (_.TIMER) {
					clearInterval(_.TIMER);
				}
				//刷新当前页面的所有数据
				let params = _this.getCommonParams();
				let {
					start_date,
					end_date
				} = params;
				let nodes = util.getBetweenDateScope(start_date, end_date);
				// DOM-ready
				$(function () {
					obj.dataInit(params, nodes, filterStorage);
				});


			}


			// 追加计算说明
			let countDescHtml = `<div class="count-desc">
                                    <span class="count-desc-title">计算说明：</span>
                                    <span>1. sdk平台数据每天02:00计算完成；</span>
                                    <span>2. 游戏内数据每天03:00计算完成；</span>
                                    <span>3. 实时数据5分钟更新1次，延迟为10分钟。</span>
                                </div>`;
			let tabContent = $(".layui-tab-content").not(".no-countDesc");
			tabContent.append(countDescHtml);

			//初始化筛选器和数据
			this.initAll().then(multiTemp => {
				reload(filterStorage)
			})

			// 点击查询按钮刷新数据
			let searchBtn = $("#searchBtn");
			searchBtn.on("click", () => {
				reload(util.getStorage("filterStorage"));
			});
		}

	}
})(window);