//环境变量 dev开发环境 pro产品，默认开发
const ENV = process.env.NODE_ENV;
const DEV = ENV === "dev";

/***********
Root 目录(默认打开目录)
************/
const DEST = "dist";

/***********
Gulp 依赖
************/
const gulp = require("gulp");
const autoprefixer = require("gulp-autoprefixer"); //自动添加浏览器前缀
const babel = require("gulp-babel"); // es6转es5
const buffer = require("vinyl-buffer");
const cleanCss = require("gulp-clean-css"); //压缩css
const concat = require("gulp-concat"); //合并js
const connect = require("gulp-connect"); //本地服务器 自动刷新
const del = require("del"); //删除文件
const fileinclude = require("gulp-file-include"); //导入html公共部分
const htmlMin = require("gulp-htmlmin"); //压缩html
const imageMin = require("gulp-imagemin"); //压缩图片
const sass = require("gulp-sass"); // 编译sass
const notify = require("gulp-notify"); //通知消息
const plumber = require("gulp-plumber"); //错误不终止watch
const proxy = require("http-proxy-middleware"); //本地服务器代理
const pump = require("pump");
const runSequence = require("run-sequence"); //同步执行gulp任务
const rev = require("gulp-rev-append"); // 添加版本号
const sourcemaps = require("gulp-sourcemaps"); //启用sourcemaps
const spritesmith = require("gulp.spritesmith"); //合并雪碧图
const uglify = require("gulp-uglify"); // 压缩js
const vinylPaths = require("vinyl-paths"); // 压缩js



// 删除dist目录
if (DEV) { del.sync([DEST]); }

//编译sass
gulp.task("sass", cb => {
	pump([
		gulp.src("src/scss/main.scss"),
		sourcemaps.init(),
		plumber({ //错误不终止并给出提示
			errorHandler: notify.onError("Error: <%= error.message %>")
		}),
		sass().on("error", sass.logError),
		autoprefixer({
			browsers: ["last 5 versions"], //向下兼容到IE8
			cascade: false //是否美化属性值 默认：true
		}),
		sourcemaps.write("maps"),
		gulp.dest("dist/css"),
		connect.reload()
	], cb);
});

//编译JS
gulp.task("es", cb => {
	// 手动按序执行js
	let src = "src/js",
		sequenceFiles = [
			`${src}/utils.js`,
			`${src}/api.js`,
			`${src}/format.js`,
			`${src}/chart-config.js`,
			`${src}/table-config.js`,
			`${src}/common.js`,
			`${src}/login.js`,
			
		];

	pump([ //压缩编译公共模块
		gulp.src(sequenceFiles),
		plumber({
			//错误不终止并给出提示
			errorHandler: notify.onError("Error: <%= error.message %>")
		}),
		babel({
			presets: ["env"]
		}),
		concat("bundle.min.js"), //合并
		gulp.dest("dist/js")
	]);
	pump([ //压缩业务模块
		gulp.src("src/js/pages/*.js"),
		plumber({
			//错误不终止并给出提示
			errorHandler: notify.onError("Error: <%= error.message %>")
		}),
		babel({
			presets: ["env"]
		}),
		gulp.dest("dist/js/pages"),
		connect.reload()
	], cb);
});

//雪碧图 图片的名字为a.png 对应的类为.icon-a
gulp.task("sprite", cb => {
	const option = {
		imgName: "img/sprite.png", // 生成的图片名
		cssName: "scss/_sprite.scss", // 生成的css文件名
		padding: 10, // 图标之间的距离
		algorithm: "binary-tree", // 图标的排序方式
		cssTemplate: "src/scss/handlebarsInheritance.scss.handlebars" // sprite输出模板
	};

	pump([
		gulp.src("src/img/sprite/**/*.png"),
		spritesmith(option),
		gulp.dest("src"),
		connect.reload()
	], cb);
});

//迁移文件
gulp.task("copyStatic", cb => {
	pump([ //迁移第三方引用的库或插件
		gulp.src("src/lib/**"),
		gulp.dest("dist/lib")
	]);

	pump([ //迁移图片
		gulp.src("src/img/*.{png,jpg,gif,ico}"),
		gulp.dest("dist/img"),
		connect.reload()
	]);

	pump([ //迁移mock数据
		gulp.src("src/mock/*.json"),
		gulp.dest("dist/mock"),
		connect.reload()
	], cb);
});

// 删除include文件
gulp.task("clean:include", cb => {
	pump([
		gulp.src("dist/include"),
		vinylPaths(del)
	]);
});

//导入html公共部分
gulp.task("fileinclude", cb => {
	pump([
		gulp.src("src/**/*.html"),
		fileinclude({
			prefix: "@@",
			basepath: "@file"
		}),
		gulp.dest("dist"),
		connect.reload()
	], cb);
});


//  启动本地服务 并解决跨域
var target = 'http://dev.dc.kaiser.com.cn'
gulp.task("server", () => {
	const option = {
		host: "10.10.20.176", //本地host，默认为“localhost”
		port: 9003, //端口
		root: "./", //根指向
		livereload: true, //自动刷新
		middleware(connect, opt) { //中间件配置
			// let prefix = ['/system', '/basic', '/special'],
			//     // 开发环境： 8239
			//     // 测试环境： 8605
			//     config = { //代理配置
			//         target: 'http://10.10.40.33:' + 8605, //跨域指向
			//         changeOrigin: true
			//     }
			// return prefix.map(item => proxy(item, config))
			return [
				proxy("/basic_v2", {
					target,
					changeOrigin:true
				}),
				proxy("/special_v2", {
					target,
					changeOrigin:true
				}),
				proxy("/system_v2",  {
					target,
					changeOrigin:true
				}),
				proxy("/system",  {
					target: "http://10.10.40.33:8605",
					changeOrigin:true
				}),
				proxy("/special", {
					target: "http://10.10.40.33:8605",
					changeOrigin:true
				}),
				proxy("/basic", {
					target: "http://10.10.40.33:8605",
					changeOrigin:true
				})
      
			];
		}
	};

	connect.server(option);
});


// 监听热更新
gulp.task("watcher", () => {
	gulp.watch("src/js/**/*", ["es"]);
	gulp.watch("src/scss/**/*", ["sass"]);
	gulp.watch("src/img/sprite/**/*", ["sprite"]);
	gulp.watch("src/**/*.html", ["fileinclude", "clean:include"]);
	gulp.watch(["src/lib/**", "src/img/**","src/mock/**"], ["copyStatic"]);
});

/*-------------------
    压缩资源
*--------------------*/

// 压缩css
gulp.task("cssMin", cb => {
	const option = {
		advanced: false, // 类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
		compatibility: "ie7", // 保留ie7及以下兼容写法
		keepBreaks: true, // 类型：Boolean 默认：false [是否保留换行]
		keepSpecialComments: "*" // 保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
	};
	pump([
		gulp.src("dist/css/main.css"),
		cleanCss(option),
		gulp.dest("dist/css"),
		notify("css压缩完成")
	], cb);
});

// 压缩js
gulp.task("jsMin", cb => {
	pump([
		gulp.src("dist/js/**/*.js"),
		uglify(),
		gulp.dest("dist/js")
	], cb);
});

//压缩图片
gulp.task("imageMin", ["cssMin"], cb => {
	pump([
		gulp.src("src/img/*.{png,jpg,gif,ico}"),
		imageMin({
			optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
			progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
			interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
			multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
		}),
		gulp.dest("dist/img"),
		connect.reload()
	], cb);
});

//压缩html
gulp.task("htmlMin", cb => {
	const option = {
		removeComments: true, //清除HTML注释
		collapseWhitespace: true, //压缩HTML
		collapseBooleanAttributes: false, //省略布尔属性的值 <input checked="true"/> ==> <input />
		removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
		removeScriptTypeAttributes: false, //删除<script>的type="text/javascript"
		removeStyleLinkTypeAttributes: false, //删除<style>和<link>的type="text/css"
		minifyJS: true, //压缩页面JS
		minifyCSS: true //压缩页面CSS
	};
	pump([
		gulp.src("dist/**/*.html"),
		htmlMin(option),
		rev(),
		gulp.dest("dist")
	], cb);
});

gulp.task("default", () => {
	if (DEV) {
		runSequence(
			"sprite", ["sass", "es", "fileinclude", "copyStatic"],
			"watcher",
			"server", "clean:include"
		);
	} else {
		// 生产环境，压缩处理
		runSequence(["cssMin", "jsMin", "imageMin", "htmlMin"]);
	}
});