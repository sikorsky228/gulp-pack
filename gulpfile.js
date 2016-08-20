'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    mainBowerFiles = require('main-bower-files'),
	map = require('map-stream'),
	plumber = require('gulp-plumber'),
	rigger = require('gulp-rigger'),
    wait = require('gulp-wait'),
    cleanCSS = require('gulp-clean-css'),
    svgSprite = require("gulp-svg-sprites"),
    filter    = require('gulp-filter'),
    svg2png   = require('gulp-svg2png'),
	reload = browserSync.reload;
 
gulp.task('sprites', function () {
    return gulp.src('./assets/svg/*.svg')
        .pipe(svgSprite({padding: "5", baseSize: "16"}))
        .pipe(gulp.dest("./assets")) // Write the sprite-sheet + CSS + Preview 
        //.pipe(filter("**/*.svg"))  // Filter out everything except the SVG file 
        .pipe(svg2png())           // Create a PNG 
        .pipe(gulp.dest("./assets"));
});

// Move css files to build
gulp.task('mainfilescss', function() {
    return gulp.src(mainBowerFiles('**/*.css', {
		"overrides" :{
			"normalize" : {
				"main" :[
					"./build/css/normalize.css"
					]
			}
		}}))
        .pipe(gulp.dest('build/css'))
});
var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: './build/',
        js: './build/js/',
        css: './build/css/',
        img: './build/img/',
        fonts: './build/fonts/'
    },
    src: { //Пути откуда брать исходники
        html: './src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: './src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
        style: './src/css/styles.scss',
        img: './src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: './src/**/*.html',
        js: './src/js/**/*.js',
        style: './src/css/**/*.scss',
        img: './src/img/**/*.*',
        fonts: './src/fonts/**/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: false,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Devil"
};



gulp.task('html:build', function () {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

gulp.task('js:build', function () {
    gulp.src(path.src.js) //Найдем наш main файл
		.pipe(plumber()) //Проверим ошибки
		.pipe(rigger())
        //.pipe(sourcemaps.init()) //Инициализируем sourcemap
        //.pipe(uglify()) //Сожмем наш js
        //.pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true})); //И перезагрузим сервер
});

gulp.task('style:build', function() {
    gulp.src(path.src.style) //Выберем наш main.scss
        .pipe(wait(500))
        //.pipe(sourcemaps.init()) //То же самое что и с js
        .pipe(sass().on('error', sass.logError)) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        //.pipe(cssmin()) //Сожмем

         .pipe(cleanCSS({compatibility: 'ie8'}))
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);

gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('default', ['build', 'webserver', 'watch']);
