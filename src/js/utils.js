
(function (root) {
	root.util = {
		/***
         * 将某段html代码段载入指定的标签容器内
         * @param html 需要load的代码段(String/url)
         * @param scriptSrc js脚本(String/url)
         * @param elem JQdom目标元素 (Object)
         */
		loadHtml(html, scriptSrc, $elem) {
			$.ajaxSetup({
				cache: false
			});

			$elem.empty().load(html, function () {
				// 页面切换时，清除实时类定时器
				if (_.TIMER) {
					clearInterval(_.TIMER);
				}
				_.container.append(scriptSrc);
				// _.init();
			});
		},
		/**
         * 计算字数长度并返回，区别中英文
         * 中文：占两个字节
         * 英文：一个字节
         * @param str (String)
         * @returns len (Number)
         */
		gblen(str) {
			let len = 0;
			const temp = String(str) || "";
			for (let i = 0; i < temp.length; i++) {
				if (temp.charCodeAt(i) > 127 || temp.charCodeAt(i) == 94) {
					len += 2;
				} else {
					len++;
				}
			}
			return len;
		},
		/**------------------------------------------------------------
         *              ******** 对象处理 *********
         * -----------------------------------------------------------*/

		/**
         *  对象深拷贝，改变引用指向
         * @param {需要拷贝的对象} obj
         * @returns
         */
		deepClone(obj) {
			// let proto = Object.getPrototypeOf(obj)
			// return Object.assign({}, Object.create(proto), obj)
			return JSON.parse(JSON.stringify(obj));
		},

		/**------------------------------------------------------------
         *              ******** 日期时间处理 *********
         * -----------------------------------------------------------*/

		/**
         * 将时间戳转换为时间格式
         * @returns 返回格式 'yy-mm-dd'
         */
		timestampToTime(timestamp, hasTime = true) {
			if (!timestamp) return;
			let date = new Date(timestamp * 1000),
				Y = date.getFullYear(),
				M = util.padTime(date.getMonth() + 1),
				D = util.padTime(date.getDate()),
				h = date.getHours() + ":",
				m = date.getMinutes() + ":",
				s = date.getSeconds();
			return hasTime ? Y + "-" + M + "-" + D + h + m + s : Y + "-" + M + "-" + D;
		},

		/**
         * 日期或时间戳转星期
         * @returns 返回格式 '星期一'
         */
		dateToWeek(dateString) {
			let date;

			if (dateString !== null || typeof dateString !== "undefined") {
				date = new Date();
			} else {
				let dateArray = dateString.split("-");
				date = new Date(dateArray[0], parseInt(dateArray[1] - 1), dateArray[2]);
			}
			return "星期" + "日一二三四五六".charAt(date.getDay());
		},
		/**
         * 比较两个日期大小
         * @param {any} d1  较晚的日期 "2007-2-2 7:30"
         * @param {any} d2  较早的日期"2007-1-31 8:30"
         * @returns Boolean
         */
		compareDate(d1, d2) {
			d1 = new Date(d1.replace(/-/g, "'/"));
			d2 = new Date(d2.replace(/-/g, "'/"));
			return d1 > d2;
		},
		/**
         * 获取今天的日期
         * @returns 返回格式 'yy-mm-dd'
         */
		getToday() {
			let day = new Date();
			day.setTime(day.getTime());
			return day.getFullYear() + "-" + this.padTime((day.getMonth() + 1)) + "-" + this.padTime(day.getDate());
		},
		/**
         * 获取上一周的日期
         * @returns 返回格式 'yy-mm-dd'
         */
		getPreWeekDay() {
			let now = new Date(),
				oneWeekTime = 7 * 24 * 60 * 60 * 1000,
				lastWeekDay = new Date(now - oneWeekTime);
			return lastWeekDay.getFullYear() + "-" + this.padTime((lastWeekDay.getMonth() + 1)) + "-" + this.padTime(lastWeekDay.getDate());
		},
		/**
         * 获取两个日期范围
         * @param start: 开始时间(string:“2018-11-11”)
         * @param start: 结束时间(string:“2018-11-15”)
         * @returns 返回包含起止日期之间的所有日期的数组
         */
		getBetweenDateScope(start, end) {
			let unixStart = output(start),
				unixEnd = output(end),
				oneDay = 24 * 60 * 60 * 1000,
				arr = [];

			if (unixStart > unixEnd) {
				layer.msg("目标日期不得晚于当前日期", {
					icon: 8
				});
			}
			for (let i = unixStart; i <= unixEnd;) {
				arr.push(new Date(parseInt(i)).format());
				i += oneDay;
			}

			function output(date) {
				let dt = date.split("-"),
					newDate = new Date();
				return Date.parse(date);
			}
			return arr;
		},
		/**
         * 获取倒推两个时间段的日期
         * @param count  指定几天之间
         * @param startDate  开始日期，默认是“今天”
         * @returns targetDay:"2018-01-01", today:"2018-01-12"
         */
		getDateRange(count, startDate) {
			if (isNaN(count)) return;
			startDate = startDate ? startDate : this.getToday();
			let today = new Date(startDate),
				targetDay = new Date(),
				oneDay = 24 * 60 * 60 * 1000;
			today.setTime(today.getTime());
			targetDay.setTime(targetDay.getTime() - (oneDay * (count - 1)));
			today = today.format();
			targetDay = targetDay.format();
			return {
				today,
				targetDay
			};
		},

		/**
         * [ 根据传入的参数Number，获取指定之前几个月的跨度，返回一个包含每个月所有日期的二维数组]
         * @param  {[Number]} number [数字]
         * @param  {[String]} date   [可选，日期（'2018-02-20'）]
         * @return {[Array]}
         */
		getPreMonth(number = 0, date) {
			const result = [],
				tempDate = date || new Date().format();

			for (let i = 0; i <= number; i++) {
				const newDate = new Date(tempDate.replace(/\d+$/g, "1")),
					unixTemp = newDate.setMonth(newDate.getMonth() - i),
					tempArr = this.getMonthStartEnd(new Date(unixTemp).format()),
					{
						firstDay,
						lastDay
					} = tempArr;

				result.push(this.getBetweenDateScope(firstDay, lastDay));
			}

			if (number > 0) {
				result.shift();
			}

			return result;
		},
		/**
         * 获取倒推几周的每个礼拜一和礼拜日
         * @param count 传入几周就返回几周，默认是上一周
         * @returns 返回数组
         */
		getPreWeeks(count = 1) {
			if (!count) return;
			let thisWeek = 8, // 因为包含"今天"，所以第一周算8天
				monday, sunday,
				days = [],
				lastWeekDays = [];

			for (let i = 0; i < count; i++) {
				days.push(thisWeek + 7 * i);
			}
			lastWeekDays = days.map(item => this.getDateRange(item).targetDay);
			lastWeekDays = lastWeekDays.map(item => {
				return ({
					monday,
					sunday
				} = this.getWeekStartEnd(item));
			});
			return lastWeekDays;
		},
		/**
         * 获取当月的第一天和最后一天
         * @param {string} [date='2018-01-01']  传入日期
         * @returns {firstDay, lastDay}  第一天和最后一天
         */
		getMonthStartEnd(date) {
			if (!date) return;
			var firstDay = new Date(date), // 第一天
				lastDay = new Date(date); // 最后一天

			firstDay.setDate(1);
			lastDay.setMonth(lastDay.getMonth() + 1);
			lastDay.setDate(0);

			firstDay.setTime(firstDay.getTime());
			lastDay.setTime(lastDay.getTime());

			firstDay = firstDay.format();
			lastDay = lastDay.format();
			return {
				firstDay,
				lastDay
			};
		},

		/**
         * 获取当前周的礼拜一和礼拜日
         * @param {string} [date='2018-01-01']  传入日期
         * @returns  { monday, sunday } 礼拜一和礼拜日
         */
		getWeekStartEnd(date = "2018-01-01") {
			if (!date) return;
			let now = new Date(date),
				nowTime = now.getTime(),
				day = now.getDay(),
				oneDayTime = 24 * 60 * 60 * 1000,
				MondayTime = nowTime - (day - 1) * oneDayTime,
				SundayTime = nowTime + (7 - day) * oneDayTime,
				monday = new Date(MondayTime), // 礼拜一
				sunday = new Date(SundayTime); // 礼拜日
			monday.setTime(monday.getTime());
			sunday.setTime(sunday.getTime());

			monday = monday.format();
			sunday = sunday.format();
			return {
				monday,
				sunday
			};
		},

		/**
         * 根据数据获取想要推到的日期点
         * @param {string} [date='2018-01-01']  传入日期
         * @param {number} [number='2018-01-01']  传入日期
         * @return  
         */

		getPredata(date, number) {
			let day = new Date(date);
			day.setDate(day.getDate() - number);
			let s = day.format("yyyy-MM-dd");
			return s;
		},

		/**
         * 十位补零
         * @param num (Number)
         * @returns
         */
		padTime(num) {
			return num = num < 10 ? "0" + num : num;
		},

		/**------------------------------------------------------------
         *              ******** 字符串处理 *********
         * -----------------------------------------------------------*/
		objParseQuery(param, key, encode) {
			if (param === null) return "";
			let paramStr = "";
			let t = typeof (param);
			if (t === "string" || t === "number" || t === "boolean") {
				paramStr += "&" + key + "=" + ((encode == null || encode) ? encodeURIComponent(param) : param);
			} else {
				for (let i in param) {
					let k = key == null ? i : key + (param instanceof Array ? "[" + i + "]" : "." + i);
					paramStr += this.objParseQuery(param[i], k, encode);
				}
			}
			return paramStr;
		},
		/**
         * 获取url中"?"符后的字串
         * @param    参数名 (String)
         * @returns  参数值
         */
		getQueryString(name) {
			let url = location.search,
				theRequest = {};
			if (url === "") return;
			if (url.indexOf("?") != -1) {
				let str = url.substr(1),
					strs = str.split("&");
				for (let i = 0; i < strs.length; i++) {
					theRequest[strs[i].split("=")[0]] = decodeURI(
						strs[i].split("=")[1]
					);
				}
			}
			return theRequest[name];
		},
		/**
         * 获取url地址文件的名称
         * @param name 参数名 (String)
         * @returns 参数值
         */
		getFileName(name) {
			if (typeof name !== "string") return;
			return name.split("/").pop().replace(/.html$/gi, "").split(".")[0];
		},
		/**
         * 获取url参数
         * @param name 参数名 (String)
         * @returns 参数值
         */
		request(param) {
			let url = location.href,
				j,
				paraString = url.substring(url.indexOf("?") + 1, url.length).split("&"),
				paraObj = {};
			for (let i = 0; j = paraString[i]; i++) {
				paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(
					j.indexOf("=") + 1,
					j.length
				);
			}
			let returnValue = paraObj[param.toLowerCase()];
			return typeof returnValue !== "undefined" ? returnValue : "";
		},

		/**
         * 获取随机字符串，返回两种结果[单个字符串或者指定长度的数组，内含随机数]
         * @param len  字符串长度(Number) 默认32
         * @param length 数组长度(Number)
         * @returns 'aAaa123'或者['aAa111','bBb111']
         */
		getRadomString(len = 32, length) {
			let chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
				pwd = "";
			for (let i = 0; i < len; i++) {
				pwd += chars.charAt(Math.floor(Math.random() * chars.length));
			}
			if (length) { //如果带二参，返回为数组
				let arr = [];
				for (let j = 0; j < length; j++) {
					arr.push(util.getRadomString(len));
				}
				return arr;
			}
			return pwd;
		},

		/**------------------------------------------------------------
         *              ******** 数组处理 *********
         * -----------------------------------------------------------*/

		/**
         * 从指定数组里拿到每个对象的指定属性，返回数组
         * @param arr  一个数组(Array)   [{key1:'aaa',key2:'bbb'},{key1:'AAA',key2:'BBB'}]
         * @param prop  指定属性(String) ['key1']
         * @returns (Array)  ['aaa','AAA']
         */
		getProperties(arr, prop) {
			if (!Array.isArray(arr) || typeof prop !== "string") return;
			return arr.map(item => item[prop]);
		},
		// lastElemTo
		/**
         * 将需要的数组数据塞入对应key值
         * @param keys  对象的key值(Array)   ["aaa", "bbb"]
         * @param values 对象的value值(Array)    [ [111, 222], [333, 444] ]
         * @returns [{a:111,b:222},{a:333,b:444}]
         */
		mergeToObj(keys, values) {
			if (keys.length !== values.length) return;
			return values.map(val => keys.reduce((obj, key, i) => [obj[key] = val[i], obj][1], {}));
		},
		/**
         * 将需要的数组数据塞入对应key值
         * @param keys  对象的key值(Array)      ["aaa", "bbb"]
         * @param values 对象的value值(Array)  [[1000, 3000, 245], [123, 422, 555]]
         * @returns [{ aaa: 1000, bbb: 123 }, { aaa: 3000, bbb: 422 }, { aaa: 245, bbb: 555 }]
         */
		mergeObj(keys, values) {
			let obj = {},
				len = keys.length || values.length;
			for (let i = 0; i < len; i++) {
				obj[keys[i]] = values[i];
			}

			function toArr(obj) {
				let temp = [];
				for (let k in obj) {
					let t = obj[k];
					for (let i = 0; i < t.length; i++) {
						if (!temp[i]) temp[i] = {};
						let o = temp[i];
						o[k] = t[i];
					}
				}
				return temp;
			}
			return toArr(obj);
		},

		/**
         * 将数组各项转为大写
         * @param  arr 数组(Array)  ['aaa','bbbb','cc']
         * @returns 转换为大写['AAA','BBBB','CC']
         */
		arrToUpper(arr) {
			if (!Array.isArray(arr) || !arr.every(item => typeof item === "string")) return;
			return arr.map(item => item.toUpperCase());
		},
		/**
         * 获取数组元素的每个属性值
         * @param  arr 数组(Array)
         * @returns 元素属性['aa','bb','cc']
         */
		getDataProperties(arr, prop) {
			if (!Array.isArray(arr)) {
				arr = Array.from(arr);
			}
			return arr.map(item => item.getAttribute(`data-${prop}`));
		},
		/**
         * 返回两个数组之间的差异
         * “从b创建Set , 然后使用Array.filter() on 只保留a b中不包含的值.”
         * @param {需要传入的数组a} a
         * @param {需要传入的数组b} b
         * @return 返回一个数组，包含差异值
         * Example: difference([1,2,3], [1,2,4]) -> [3]
         */
		difference(a, b) {
			const s = new Set(b);
			return a.filter(x => !s.has(x));
		},
		/**
         *  返回两个数组中存在的元素的列表。
         * @param {需要传入的一数组} a
         * @param {需要传入的二数组} b
         * Example: intersection([1,2,3], [4,3,2]) -> [2,3]
         */
		intersection(a, b) {
			const s = new Set(b);
			return a.filter(x => s.has(x));
		},
		/**
         * 将数组各项转为小数
         * @param  arr 数组(Array)  [11,123,4345]
         * @param  keepCount(Number) 保留小数点位数
         * @returns 转换为大写['11.00%','123.00%','434.00%']
         */
		arrToFloat(arr, keepCount = 2) {
			if (!Array.isArray(arr) || !arr.every((item) => !isNaN(item))) return;
			return arr.map(item => item.toFixed(keepCount) + "%");
		},

		/**
         * 生成指定范围随机数，返回数组
         * @param min 最小数(Number)
         * @param max 最大数(Number)
         * @param length 数组长度 (Array)
         * @returns  [11,2562,133,11142]
         */
		getRadomNum(min, max, length) {
			let arr = [],
				num = i = 0;
			while (i < length) {
				num = Math.floor(Math.random() * (max - min + 1)) + min;
				arr.push(num);
				i++;
			}
			return arr;
		},

		/**
         * 使用循环的方式判断一个元素是否存在于一个数组中
         * @param {Object} arr 数组
         * @param {Object} value 元素值
         */
		isInArray(arr, value) {
			for (let i = 0; i < arr.length; i++) {
				if (value === arr[i]) {
					return true;
				}
			}
			return false;
		},

		removeByValue(arr, val) {
			let temp = [];
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] != val) {
					temp.push(arr[i]);
				}
			}
			return temp;
		},

		/**------------------------------------------------------------
         *              ******** Storage处理 *********
         * -----------------------------------------------------------*/

		/**
         * 存入
         * @param key 设置指定key值
         * @param val 设置指定value值
         */
		setStorage(key, val) {
			localStorage.setItem(key, JSON.stringify(val));
		},

		/**
         * 获取
         * @param key 指定key值
         * @returns  {any}
         */
		getStorage(key) {
			let storageVal = localStorage.getItem(key);
			storageVal = storageVal === "undefined" ? "" : JSON.parse(storageVal);
			return storageVal;
		},

		/**
         * 判断是否有指定key值的Storage对象
         * @param key 指定key值
         * @param val 如果没有返回指定的key值则可以自定义默认值，不设置则返回布尔值
         * @returns  {any}
         */
		hasStorage(key, val) {
			if (!val) {
				return !Object.is(this.getStorage(key), null);
			}
			return this.getStorage(key) ? this.getStorage(key) : val;
		},

		/**
         * 移除指定key值的Storage对象
         * @param key 移除指定key值
         */
		removeStorage(key) {
			localStorage.removeItem(key);
		},

		/**
         * 清空所有的Storage
         */
		clearStorage() {
			localStorage.clear();
		},

		/**
         * 清除字符串中间空格
         */
		removeAllSpace(str) {
			return str.replace(/\s+/g, "");
		},

		/**
		 * chart数据补0
		 * @param {请求的数据} data 
		 * @param {data.list.data中的表头名称*} key 
		 * @param {data.list.data中的内容值*} value 
		 * @returns {chartSeries} 
		 */
		supplement(data, key, value) {

			return data.list.map((item) => {

				let payData = {}
				data.data_head.forEach(tItem => {
					payData[tItem] = 0
				})

				item.data.forEach(dItem => {
					if (data.data_head.indexOf(dItem[key]) !== -1) {
						payData[dItem[key]] = dItem[value]
					}
				})

				return {
					name: item.date,
					data: Object.values(payData)
				}

			})
		},
		/**
		 * 
		 * @param {最小值} lowerValue 
		 * @param {最大值} upperValue 
		 */
		randomFrom(lowerValue, upperValue) {
			return Math.floor(Math.random() * (upperValue - lowerValue + 1) + lowerValue);
		},

		/**
		 * 头部数据排序
		 */
		headSort(data) {
			if (data.data_head && Array.isArray(data.data_head) && data.data_head.length > 0) {
				data.data_head.sort((a, b) => {
					return parseInt(a) - parseInt(b)
				})
			}
			return data
		},
		// 改变原数组的filter
		filter(a, f) {
			for (var i = a.length; i--; f(a[i]) || a.splice(i, 1));
		},


		/**
		 * 动态渲染子筛选器
		 * @param {父级筛选器筛选的条件集合} filterStorage 
		 * @param {数据源} data
		 * @param {当前页面对象} scope  
		 * @param {tab类型} curType 
		 * @param {是否为饼状图} isPie  
		 * @param {需要渲染的chart的id} chartEle 
		 * @param {需要渲染的子筛选器的id} filterEle 
		 * 
		 */
		subFilterRender({ filterStorage = {}, data = [], scope = {}, curType = '', isPie = false, chartEle = 'chart', filterEle = 'subFilter-warp' }) {
			if (!data) return
			let sourceData = lodash.cloneDeep(data)
			let renderChartData = sourceData.list || sourceData

			let defaultFilter = {}  //存储所有过滤器的筛选条件


			// 清空已存在的子筛选器
			$("#" + filterEle).empty()

			// 如果存在filterStorage说明已选择除汇总的其他项
			if (filterStorage) {

				//获取筛选中选择的第一个条件作为默认
				filterStorage.forEach(item => {
					if (!!item.list.length) {
						defaultFilter[item.type] = item.list[0]
					}
				})

				//根据defaultFilter的对象进行遍历筛选
				$.each(defaultFilter, (key, val) => {
					util.filter(renderChartData, temp => {
						if ((val.name).indexOf(temp[key]) != -1 || (val.val).indexOf(temp[key]) != -1) {
							return true
						}
						return false
					}
					)

				})

				//渲染子筛选器 
				this.subRender({ filterStorage, data, scope, curType, isPie, chartEle, filterEle })

			}

			return sourceData


		},
		subRender({ filterStorage, data, scope, curType, isPie, chartEle, filterEle }) {
			let renderTpl = '',
				form = layui.form,
				conditions = {};

			// 如果图表是饼状图
			if (isPie) {
				let dateIndex,
					dataList = data.list || data,
					dateArray = $.unique(dataList.map(item => item.date)),
					dateArrayObject = dateArray.map(item => { return { name: item, val: item } })

				$.each(filterStorage, (key, val) => {
					if (val['type'] === 'date') {
						dateIndex = key
					}
				})
				if (!dateIndex) {
					filterStorage.push({ label: '日期：', list: dateArrayObject, type: 'date' })
				} else {
					filterStorage.splice(dateIndex, 1, { label: '日期：', list: dateArrayObject, type: 'date' })
				}
			}

			// 渲染子筛选器
			filterStorage = filterStorage.filter(item => item.list.length > 0)
			renderTpl = template('subFileter', filterStorage.reverse())
			$('#' + filterEle).html(renderTpl)
			form.render('select', 'subFileter')

			//单子筛选器选择后对所选的筛选条件进行遍历筛选
			form.on('select(subSelect)', () => {
				let dom = $("#" + filterEle).find(".width"),
					sourceData = lodash.cloneDeep(data),
					selectDate = '',
					renderChartData = sourceData.list || sourceData
				//将选择的筛选项存入对象中
				dom.each((index, item) => {
					let type = $(item).find('select').attr('name')
					let text = $(item).find('dl .layui-this').text()
					let value = $(item).find('dl .layui-this').attr('lay-value')
					conditions[type] = { name: text, val: value }
					if(type === 'date'){
						selectDate = value
					}
				})

				//根据conditions对象进行遍历筛选
				$.each(conditions, (key, val) => {
					util.filter(renderChartData, temp => {
						if ((val.name).indexOf(temp[key]) != -1 || (val.val).indexOf(temp[key]) != -1) {
							return true
						}
						return false
					}
					)
				})

				//饼状图传入日期参数
		
				scope.renderChart({ renderChartData: sourceData, curType, chartEle, selectDate })

			})

		}
	};

	/**
     *   日期扩展方法，将时间戳转换日期格式 "yyyy-mm-dd"
     */
	Date.prototype.format = function () {
		let Y = this.getFullYear(),
			M = util.padTime(this.getMonth() + 1),
			D = util.padTime(this.getDate());
		return Y + "-" + M + "-" + D; // 返回日期
	};

	/**
     *   数组扩展方法，删除数组指定值
     * @param val 指定删除的值
     */
	Array.prototype.remove = function (val) {
		if (!Array.isArray(this) || (typeof val !== "number" && typeof val !== "string")) return;

		let temp = [];
		temp.push([...this]);
		temp.splice(temp.findIndex(item => item === val), 1);
		return [...temp];
	};

})(window);