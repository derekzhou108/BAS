
(function(root) {
    root.chartConfig = {
        parse(option) {
            const { data, thead } = option
            let chartData = []
            let fields = Object.keys(data[0])

            // 这里将json格式转换为ECharts所需格式
            fields.forEach((item, index) => chartData[item] = { title: thead[index], value: [] })
            data.forEach((item, index) => Object.keys(item).forEach((k, j) => chartData[k].value.push(item[k])))

            return chartData
        },

        /**
         * 渲染eChart
         * @param  chartId(String)  '图表ID名称'
         * @param  option (Obj) '图表配置'
         */
        render(chartId, option) {
            let Chart = echarts.init(document.getElementById(chartId))
            // 设置true --> 清屏重新绘制
            Chart.setOption(option, true)
            Chart.resize();
            return Chart
        },

        /**
         * 选项卡切换重绘Chart
         * @param filterName:筛选器（lay-filter）值(String)
         * @param cb: 回调（Function）
         */
        tabResizeChart(filterName, cb) {
            let { element, table } = layui, Chart
            element.on("tab(" + filterName + ")", (data) => {

                table.init(filterName)

                cb instanceof Function && cb()
                let chart = $(data.elem).find('.chart')
                if (!chart.length) return
                let getId = chart.eq(data.index).attr('id')
                Chart = echarts.init(document.getElementById(getId))
                Chart.resize()
            })
        },

        /**
         * 曲线图
         * @param option.title:图表名
         * @param option.legend:折线名称，(Array)
         * @param option.xData :X轴坐标对象, (Array)
         * @param option.series: 具体数据，数组包含多个对象(Array)
         * @param option.isPercent:是否是百分比显示
         * @param option.unSelected: //默认关闭不显示的
         */
        line(option) {
            option = option || {}
            if (!Array.isArray(option.legend) ||
                !Array.isArray(option.xData) ||
                !Array.isArray(option.series)
            ) {
                throw Error("Some type of parameter is not Array,Please fix it")
            }

            const seriesConfig = { // 数据公共配置
                type: "line",
                areaStyle: { normal: { opacity: 0.25 } },
                smooth: true,
                label: option.isPercent ? { // 判断是否是百分比
                    normal: {
                        formatter: `{c}%`
                    }
                } : {}
            }

            const series = option.series.map((item, index) => {
                if (option.isPercent) {
                    // 如果是百分比则 将data都转换为整型
                    item.data = item.data.map(item => parseFloat(item))
                }
                return Object.assign(item, seriesConfig, { "strak": "总量" + index })
            })

            //默认关闭不显示的
            const unSelected = !option.unSelected ? {} : (function() {
                let hideValues = {}
                option.unSelected.forEach(item => hideValues[item] = false)
                return hideValues
            })()

            const chartConfig = {
                title: {
                    text: option.title
                },
                tooltip: {
                    trigger: "axis",
                    formatter(params) {
                        // 如果是百分比显示则格式化
                        params.length = series.length
                        let date = params[0].name,
                            html = ''
                        params.forEach(item => {
                            html += `${item.marker}${item.seriesName}: ${item.value}${option.isPercent ?'%':''}<br/>`
                        })
                        return `${date}<br/>${html}`
                    }
                },
                toolbox: {
                    saveAsImage: {
                        show: false
                    }
                },
                legend: {
                    data: option.legend,
                    type:'scroll',
                    selected: unSelected,
                    width: '70%'
                },
                grid: {
                    left: "2%",
                    right: "2%",
                    bottom: "3%",
                    containLabel: true
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
                },
                xAxis: {
                    max: option.xData.length,
                    type: "category",
                    boundaryGap: false,
                    data: option.xData,
                    minInterval: 1,
                    axisTick: {
                        alignWithLabel: true
                    },
                    axisLabel: {
                        //X轴刻度配置
                        interval: option.interval //0：表示全部显示不间隔；auto:表示自动根据刻度个数和宽度自动设置间隔个数
                    }
                },
                yAxis: {
                    type: "value",
                    max: option.isPercent ? 100 : option.yMax,
                    axisLabel: {
                        formatter: `{value} ${ option.isPercent ? '%':'' }`
                    }
                },
                series: series
            }
            return chartConfig
        },

        /**
         * 横向的柱状图
         * @param option.title:图表名
         * @param option.legend:折线名称，(Array)
         * @param option.xData :y轴坐标对象, (Array)
         * @param option.series: 具体数据，数组包含多个对象(Array)
         */
        xBar(option) {
            option = option || {}
            if (!Array.isArray(option.legend) ||
                !Array.isArray(option.yData) ||
                !Array.isArray(option.series)
            ) {
                throw Error("Some type of parameter is not Array,Please fix it")
                return
            }

            const seriesConfig = {
                type: 'bar',
                barWidth: '15%',
            }

            const series = option.series.map((item, index) => Object.assign(item, seriesConfig))

            const config = {
                title: {
                    text: option.title
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "shadow"
                    }
                },
                legend: {
                    data: option.legend || [],
                    type:'scroll'
                },
                grid: {
                    left: "3%",
                    right: "4%",
                    bottom: "3%",
                    containLabel: true
                },
                xAxis: {
                    type: "value",
                    boundaryGap: [0, 0.01]
                },
                yAxis: {
                    type: "category",
                    data: option.yData
                },
                series: option.series
            }

            return config
        },

        /**
         * 纵向柱状图
         * @param option.title:图表名
         * @param option.legend:折线名称，(Array)
         * @param option.xData :y轴坐标对象, (Array)
         * @param option.series: 具体数据，数组包含多个对象(Array)
         * @param option.unSelected: //默认关闭不显示的
         */
        yBar(option) {
            if (!Array.isArray(option.legend) ||
                !Array.isArray(option.xData) ||
                !Array.isArray(option.series)
            ) {
                throw Error("Some type of parameter is not Array,Please fix it")
                return
            }

            const seriesConfig = {
                type: 'bar',
                // barWidth: '2%',
            }

            const series = option.series.map(item => Object.assign(item, seriesConfig))

            //默认关闭不显示的
            const unSelected = !option.unSelected ? {} : (function () {
                let hideValues = {}
                option.unSelected.forEach(item => hideValues[item] = false)
                return hideValues
            })()

            const config = {
                title: {
                    text: option.title
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "shadow"
                    }
                },
                legend: {
                    data: option.legend || [],
                    selected: unSelected,
                    type:'scroll'
                    
                },
                grid: {
                    left: "3%",
                    right: "4%",
                    bottom: "3%",
                    containLabel: true
                },
                xAxis: {
                    type: "category",
                    boundaryGap: [0, 0.01],
                    data: option.xData,
                    axisTick: {
                        alignWithLabel: true
                    }
                },
                yAxis: {
                    type: "value",
                    max: option.yMax
                },
                series
            }

            return config
        },

        /**
         * 饼图
         * @param option.title:图表名
         * @param option.legend:折线名称，(Array)
         * @param option.legendType:折线类型，(String)
         * @param option.xData :y轴坐标对象, (Array)
         * @param option.series: 具体数据，数组包含多个对象(Array)
         */
        pie(option) {
            if (!Array.isArray(option.legend) || !Array.isArray(option.series)) {
                throw Error("Some type of parameter is not Array,Please fix it")
                return
            }

            const config = {
                title: {
                    text: option.title,
                    subtext: "",
                    x: "center"
                },
                tooltip: {
                    trigger: "item",
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
                },
                legend: {
                    orient: "vertical",
                    top: '40',
                    left: "right",
                    type: option.legendType || '',
                    data: option.legend
                },
                series: [{
                    name: option.name || "",
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '60%'],
                    data: option.series,
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            }

            return config
        },

        /**
         * 折线和饼图
         * @param option.title:图表名
         * @param option.legend:折线名称，(Array)
         * @param option.xData :x轴坐标对象, (Array)
         * @param option.yData :y轴坐标对象, (Array)
         * @param option.series: 具体数据，数组包含多个对象(Array)
         */
        lineAndBar(option) {
            if (!Array.isArray(option.legend) || !Array.isArray(option.series)) {
                throw Error("Some type of parameter is not Array,Please fix it")
                return
            }
            const config = {
                title : option.title,
                legend: [{
                    x : 'center',
                    y : 'bottom',
                    data: option.legend,
                    type:'scroll'
                }],
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        // 坐标轴指示器，坐标轴触发有效
                        type: "line" // 默认为直线，可选为：'line' | 'shadow'
                    }
                    
                },
                grid: {
                    left: "2%",
                    right: "3%",
                    bottom: "10%",
                    containLabel: true
                },
                xAxis: option.xData,
                yAxis: option.yData,
                series: option.series
            }

            return config
        }

    }
})(window)