/*----------
*  主页面
----------*/

(function (scope) {
	scope = scope || {};
	scope.defaultRouter = 'total-account-sdk' //默认进入的页面
	// 页面重定向方法
	scope.redirect = () => {
		// 检测有没有proId，没有则说明没有选择游戏，需跳转到index页面
		if(!util.getStorage("proId")){
			location.href="/dist/"
		}
	
		let fileName = location.hash.replace('#', ""),
			sideBarWrap = $("#sideBarWrap"),
			path = fileName && sideBarWrap.find('.' + fileName).data('path'),
			navigation = path ? path.split("|") : ""


		//如果不存在hash则默认跳转到默认页面
		if (!fileName) {
			location.hash = scope.defaultRouter; return
		}

		//左侧导航栏加上选中样式
		sideBarWrap.find(".layui-nav-item").removeClass("layui-nav-itemed").filter($('.' + fileName).parents(".layui-nav-item")).addClass("layui-nav-itemed");
		sideBarWrap.find(".sub-item").removeClass("layui-this").filter($('.' + fileName)).addClass("layui-this");

		//渲染上侧面包屑导航
		scope.renderNavigation(navigation);

		//动态渲染右侧内容
		let htmlSrc = `../dist/${fileName}.html`, // 判断入日报或者自定义页面
			scriptSrc = `<script src="../dist/js/pages/${fileName}.js"></script>`; //当前地址栏页面名称
		util.loadHtml(htmlSrc, scriptSrc, _.container);

	};

	// 填充侧边栏
	scope.sildeNavInit = (function () {
		let element = layui.element,
			form = layui.form,
			data = {},
			// 获取功能块DOM高度
			sideBarWrap = $("#sideBarWrap"), //侧边栏
			systemConfigure = $("#configure-system"), //右侧菜单
			topH = $(".top-wrapper").outerHeight(), //top栏的高度
			headH = $(".header-wrapper").outerHeight(), // head栏的高
			footH = $("#footer").outerHeight(), //底部栏高度
			bodyH = $(document).height(), //页面高度
			sideBarH = bodyH - (topH + headH + footH); //侧边栏高度

		api.getMenu().then(res => {
			_.ErrorMsg(res);

			data = res.data || [];

			const len = data.length; //数组长度
			const splice = 7; //分割节点
			let systemData = lodash.remove(data, function (item) {
				return item.label === 'system'
			});

			data.generalList = formatSlide(data.slice(0, splice)); //共性
			data.specialList = formatSlide(data.slice(splice, len)); //特性
			data.total = data.slice();

			// 将json格式转换为侧边栏UI格式
			function formatSlide(arr) {
				return arr.map(item => {
					return {
						module: [{
							iconName: "menu",
							moduleTitle: item.label,
							dataTitle: item.url,
							subModule: item.items.map(sub => {
								return {
									dataTitle: sub.url.replace('/dist/', ""),
									subModuleName: sub.label,
									// dataUrl: sub.url.includes("dist") ? "" : sub.url,
								};
							})
						}]
					};
				});
			}

			// 渲染侧边栏
			sideBarWrap.html(template("tmpFillSildeNav", data)).height(sideBarH);
			systemConfigure.html(template("configureSystem", systemData[0]))
			// debugger;

			//重新渲染
			element.init();
			form.render("select", "search-box");

			if (('onhashchange' in window) && ((typeof document.documentMode === 'undefined') || document.documentMode == 8)) {
				// 浏览器支持onhashchange事件
				window.onhashchange = scope.redirect;  // TODO，对应新的hash执行的操作函数
			}

			scope.redirect()

			//搜索框选中跳转
			form.on("select(search-input)", ele => {
				let url = ele.value.replace('/sub/dist/', "");
				location.hash = url

			});
		});
	})();

	//顶部导航渲染
	scope.renderNavigation = (path = []) => {
		let navObject = {};
		navObject["path"] = path;
		let breadcrumbWrap = $("#breadcrumbWrap");
		breadcrumbWrap.html(template("breadcrumb", navObject));

	};
	// 渲染项目下拉列表
	scope.renderProInit = ((function () {

		let selectProjectWrap = $("#selectProjectWrap");
		let proName = util.getStorage("proName"); // 项目名称
		let element = layui.element;
		let data;

		api.getIndex().then(res => {
			_.ErrorMsg(res);

			data = res.data;

			selectProjectWrap.html(template("tplSelectProList", data));

			selectProjectWrap.find(".current-project").text(proName);

			element.init();

			selectProjectWrap.find(".item").on("click", function () {

				let appList = $(this).data("info");
				let proName = $(this).data("name");
				let proId = $(this).data("pid");

				// 存入该项目名称
				util.setStorage("proName", proName);

				// 存入该项目ID
				util.setStorage("proId", proId);

				// 存入该项目下的游戏列表
				util.setStorage("appList", appList);

				location.href = "/dist/home.html";
			});
		});
	}))();

	// 字典配置
	scope.dictionaries = (function () {

		let element = layui.element

		// 固定选项卡
		let templateData = {
			data: [
				{ key: 'server', val: '区服' },
				{ key: 'channel', val: '渠道' },
				{ key: 'ad_channel', val: '广告渠道' },
				{ key: 'pay_goods_type', val: '充值商品' },
				{ key: 'goods_type', val: '商城商品' },
				{ key: 'money_type', val: '货币类型' },
				{ key: 'money_reason', val: '货币操作原因' },
				{ key: 'prop_reason', val: '道具操作原因' },
				{ key: 'shop_type', val: '商品类型' },
				{ key: 'task_type', val: '任务类型' },
				{ key: 'activity_type', val: '活动类型' },
				{ key: 'step_type', val: '新手引导步骤' },
				{ key: 'money_type_stock', val: '存量货币映射' },
			]
		}
		let dialogContent = template('dialogDictionary', templateData)


		// 点击字典开始初始化
		$("#configure-system").on("click", "#dictionary", () => {

			const { table } = layui
			let data = { type: 'serverTable', list: [{ id: '10000', val: '6元礼包' }, { id: '10001', val: '30元礼包' }] }
			let thead = { index: '编号', id: 'ID', name: '名称' }
			let cols = [
				[
					{ field: 'index', title: '编号', align: 'center', sort: 'true' },
					{ field: 'id', title: 'ID', align: 'center', sort: 'true' },
					{ field: 'name', title: '名称', edit: 'text', align: 'center' },
				]
			]
			let curType = templateData.data[0].key
			let curIndex = 0
			let dotDom


			//弹出模态框
			layer.open({
				type: 1
				, title: '字典配置' //不显示标题栏
				, closeBtn: 1
				, area: ['1300px', '500px']
				, shade: 0.8
				, id: 'LAY_layuipro' //设定一个id，防止重复弹出
				, btnAlign: 'c'
				, moveType: 1 //拖拽模式，0或者1
				, content: dialogContent
			});


			//点击tab切换并且根据type请求数据
			element.on('tab(dictionary)', function (ele) {
				let type = $(this).data('type')
				curType = type
				curIndex = ele.index
				fecthData()
			});



			// 表格数据加载以及渲染
			function fecthData() {
				let project_id  = util.getStorage("proId")
				api.getConfList({ project_id, type: curType }).then(res => {
					// 获取异步数据
					let asynData = res.data.list,
						tempData = [],
						tempId = []

					//渲染表
					renderTable(asynData)
					dotDom.hide()
					//行内操作工具事件监听
					table.on(`tool(table${curIndex})`, function (obj) {
						let layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
						let curIndex = obj.data.index - 1;
						if (layEvent === 'del') { //删除
							layer.confirm('真的删除行么', function (index) {
								asynData.splice(curIndex, 1)
								renderTable(asynData)
								layer.close(index);
							});
						}
					})

					table.on(`edit(table${curIndex})`, function (obj) {
						let data = obj.data, //得到修改后的值
							id = (data.id).toString(),
							name = (data.name).toString(),
							tempItem = `id=${id}&name=${name}`,
							findIndex = tempId.indexOf(id)

						if (findIndex == -1) {
							tempId.push(id)
							tempData.push(tempItem)
						} else {
							tempData.splice(findIndex, 1, tempItem)
						}
						let dotDom = $("#LAY_layuipro").find(".layui-badge-dot")
						dotDom.show()

					});

					//表头左侧操作工具事件监听
					table.on(`toolbar(table${curIndex})`, function (obj) {

						switch (obj.event) {
							case 'add':
								asynData.push({ index: asynData.length + 1, id: '', val: '' })
								renderTable(asynData)
								dotDom.show()
								layer.msg('添加成功');
								break;
							case 'upload':
								parseFile();
								break;
							case 'save':
								api.updateConfList({ project_id: 6, type: curType, modify_conf: tempData.join('|') })
								dotDom.hide()
								layer.msg('保存成功');
								break;
						};
					})

					//搜索
					$("#LAY_layuipro").on("click", "#searchBtn", function () {
						let searchVal = $(this).closest(".tableSearch").find("#searchVal").val();
						let data = searchVal ? asynData.filter(item => item.id == searchVal) : asynData
						renderTable(data)
					})

					//解析上传文件
					function parseFile() {
						$(".layui-table-tool").on('change', '#excel-file', function (e) {
							let obj = e.target;

							if (!obj.files) {
								return;
							}
							let wb;//读取完成的数据
							let rABS = false; //是否将文件读取为二进制字符串
							let f = obj.files[0];
							let reader = new FileReader();
							let persons = []

							reader.onload = function (e) {
								var data = e.target.result;
								if (rABS) {
									wb = XLSX.read(btoa(fixdata(data)), {//手动转化
										type: 'base64'
									});
								} else {
									wb = XLSX.read(data, {
										type: 'binary'
									});
								}
								//wb.SheetNames[0]是获取Sheets中第一个Sheet的名字
								//wb.Sheets[Sheet名]获取第一个Sheet的数据
								persons = JSON.stringify(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]));
								// 根据表面替换相应的名称
								let regx = ''
								lodash.forEach(thead, function (value, key) {
									regx = new RegExp('"' + value + '"', 'ig')
									persons = persons.replace(regx, '"' + key + '"')
								});
								let datalist = JSON.parse(persons) || []
								renderTable(datalist)
								dotDom.show()
							};

							if (rABS) {
								reader.readAsArrayBuffer(f);
							} else {
								reader.readAsBinaryString(f);
							}

							function fixdata(data) { //文件流转BinaryString
								var o = "",
									l = 0,
									w = 10240;
								for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
								o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
								return o;
							}
						});
					}

					//渲染表格
					function renderTable(data) {

						//重置index编号
						data.forEach((obj, index) => {
							obj['index'] = index + 1
						})
						//渲染table表
						table.render(
							{
								elem: `#LAY_layuipro #table${curIndex}`,
								cols,
								data,
								loading: true,
								toolbar: '#headBar',
								page: true,
								limit: 20,
								id: `table${curIndex}`

							}
						)

						dotDom = $("#LAY_layuipro").find(".layui-badge-dot")

					}


				})

			}

			fecthData()

		})


	})()

	scope.init = (obj => {
		/**
         * 注册下拉模块，挂载到全局对象layui（仅能调用一次）
         * ---定义拓展模块的路径---
         */
		// layui.config({
		//     base: './lib/layui/'
		// }).extend({
		//     formSelects: 'formSelects-v3'
		// })
	})(scope);
})();