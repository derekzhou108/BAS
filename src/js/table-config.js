;
(function (root) {
    root.tableConfig = {

        /**
         *  拼接表格的col里的公共属性，将表头替换到对应的th中
         * @param {数据} option.data
         * @param {表头内容} option.thead
         * @returns
         */
        parse(option) {

            const { data, thead, cols, colField } = option

            // 公共参数
            const baseCol = { sort: true, align: 'center' }
            let fields = colField || Object.keys(data[0])

            option.cols = cols || [fields.map((field, index) => {

                // 处理表格cell最小宽，根据表头中英文字数来控制，并处理第一项日期宽180
                const len = util.gblen(thead[index])
                const lenWidth = thead[index] === '日期' ? '180' : (len > 12 ? len * 10 : len <= 3 ? len * 30 : len * 18)
                return Object.assign({}, { field, title: thead[index], minWidth: lenWidth }, baseCol)
            })]
            return option
        },

        /**
         *  处理后台返回的完整表头数据
         * @param {表头内容} option.thead
         * @returns
         */
        parseHead(option) {

            const { thead } = option

            // 公共参数
            const baseCol = { sort: true, align: 'center' }

            option.cols = [thead.map(item => {
                const key = Object.keys(item)[0]
                const val = Object.values(item)[0]
                // 处理表格cell最小宽，根据表头中英文字数来控制，并处理第一项日期宽180
                const len = util.gblen(val)
                const lenWidth = val === '日期' ? '180' : (len > 12 ? len * 10 : len * 18)
                return Object.assign({}, { field: key, title: val, minWidth: lenWidth }, baseCol)
            })]

            return option
        },

        /**
         *  拼接后台传过来的表头，并按指定字段顺序加入数据
         * @param {表头内容} option.thead
         * @param {表数据} option.data
         * 
         * @returns
         */
        parseNewHead(option) {
            const { thead, cols, data } = option
            // 公共参数
            const baseCol = { sort: true, align: 'center' }
            option.cols = []
            option.cols[0] = []
            $.each(thead,(field,title) => {
                // 处理表格cell最小宽，根据表头中英文字数来控制，并处理第一项日期宽180
                const len = util.gblen(title)
                const lenWidth = title === '日期' ? '180' : (len > 12 ? len * 10 : len <= 3 ? len * 30 : len * 18)
                let item = Object.assign({}, { field, title, minWidth: lenWidth }, baseCol)
                option.cols[0].push(item)
            })
            return option
        },

        render(option) {
            const { table } = layui
            const { elem, data, cols, fixed } = option

            if (fixed) {
                // 判断是否有固定列并且是否是一维表头
                let firstCols = cols.length === 1 ? cols : cols[0]
                for (let i = 0; i < firstCols.length; i++) {
                    for (let j = 0; j < fixed; j++) {
                        firstCols[i][j] = Object.assign({}, firstCols[i][j], { 'fixed': 'left' })
                    }
                }
            }

            const tableOptions = {
                elem,
                data,
                cols,
                page: true,
                limit: 20,
                loading: true,
                even: true,
                toolbar: true 
            }

            table.render(tableOptions)
        },

        /**
         * 表格数据封装转换
         * @param tableData.enableDate (Boolean) //是否开启首列日期，默认开启
         * @returns
         */
        parseTableData(tableData) {
            let enableDate = typeof tableData.enableDate === 'undefined' ? true : tableData.enableDate, //默认开启首列日期
                baseCol = { sort: true, align: 'center' }, //col 公共属性:排序和居中
                baseColDate = { field: 'date', title: '日期' }, // 日期的公共属性
                nodes = _.dateRange.nodes,
                arr = [],
                // cols=[],
                // data=[]
                cols = tableData.data.map((item, index) => {
                    return Object.assign({ field: tableData.fields[index], 'title': tableData.titles[index] }, baseCol)
                }),
                data = util.mergeObj(tableData.fields, tableData.values)

            if (enableDate) {
                // 如果有首列日期就填充日期列对象
                arr.push(Object.assign(baseColDate, baseCol))
                cols = [...arr, ...cols]
                data = data.map((item, index) => Object.assign({ date: nodes[index] }, item))
            }

            data = data.reverse()

            return { cols, data }
        },

        /**
         * 将接口的二维数组表格数据转换为表格
         * @param {String} tableId 表格ID
         * @param {Array} titles  表格头部 ["消费点", "道具类型", "购买次数", "购买总量", "虚拟币总价值", "消耗次数", "消耗总数", "货币名称"]
         * @param {Array} data  表格数据 [[a:111,b:222,c:333],[a:444,b:555,c:666],[a:777,b:888,c:999]]
         * @param {Boolean} enableDate  是否开启日期
         */
        mergeTableData(tableId, titles, data, enableDate = true) {
            let values = {},
                tableData
            data.forEach((item, i) => {
                for (let j in data[i]) {
                    if (values[j] !== undefined) {
                        values[j] += data[i][j] + ","
                    } else {
                        values[j] = data[i][j] + ","
                    }
                }
            })

            Object.values(values).forEach((item, index) => {
                values[index] = item.substring(0, item.length - 1).split(',')
            })

            data = titles.map((item, index) => {
                return {
                    title: titles[index],
                    value: values[index]
                }
            })

            tableConfig.tableInit({
                tableId,
                titles,
                data,
                enableDate
            })
        },

        /**
         *  基本表格
         * @param chartData(Object)
         * chartData必须是{tableId:'table1',data:{title:"",value:[]}}格式
         */
        tableInit(option) {
            let data = option.data,
                enableDate = option.enableDate,
                cols,
                elem
            if (!data || data.some(item => typeof item === undefined)) return
            option.titles = util.getProperties(data, 'title') || []
            option.values = util.getProperties(data, 'value') || []
            option.fields = util.getRadomString(6, data.length)

            //  将日期与数据行数对比，取较小的行数，规避日期或者数据行数不对称
            if (enableDate) {
                if (_.dateRange.nodes.length > option.values[0].length) {
                    option.values.forEach(items => {
                        _.dateRange.nodes.length = items.length
                    })
                } else {
                    option.values.forEach(items => {
                        items.length = _.dateRange.nodes.length
                    })
                }
            }

            let parseOption = this.parseTableData(option)
            data = enableDate ? parseOption.data : parseOption.data.reverse()
            cols = [parseOption.cols]
            elem = "#" + option.tableId

            this.baseConfig(elem, data, cols)
        }
    }
})(window)