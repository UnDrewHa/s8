var gulp = require('gulp'),
    watch = require('gulp-watch'),
    browserSync = require("browser-sync"),
    prefixer = require('gulp-autoprefixer'),
    stylus = require('gulp-stylus'),
    jade = require('gulp-jade'),
    cleancss = require('gulp-clean-css'),
    notify = require("gulp-notify"),
    cache = require('gulp-cached'),
    rigger = require('gulp-rigger'),
    reload = browserSync.reload,
    gulpif = require('gulp-if'),
    argv = require('yargs').argv,
    sourcemaps = require('gulp-sourcemaps'),
    svgSprite = require('gulp-svg-sprite');

  var path = {
    build: {
      html: 'build/',
      js: 'build/js/',
      css: 'build/css/',
      svg: 'build/i/sprite/'
    },
    src: {
      html: 'src/*.jade',
      js: 'src/js/main.js',
      style: 'src/style/main.styl',
      svg: 'build/i/svg/*.svg'
    },
    watch: {
      html: 'src/**/*.jade',
      js: 'src/js/**/*.js',
      style: 'src/style/**/*.styl'
    }
  };

  var config = {
    server: {
      baseDir: "./build"
    },
    tunnel: false,
    host: 'localhost',
    port: 9000,
    logPrefix: "Building::"
  };

  gulp.task('html:build', function () {
    var YOUR_LOCALS = {};
    gulp.src(path.src.html)
      .pipe(cache('jading...'))
      .pipe(jade({locals: YOUR_LOCALS, pretty: true}))
      .on('error', notify.onError(function (err) {
        return {
          title: 'Jade',
          message: err.message
        };
      }))
      .pipe(gulp.dest(path.build.html))
      .pipe(reload({stream: true}));
  });

  gulp.task('js:build', function () {
    gulp.src(path.src.js)
      .pipe(rigger())
      .on('error', notify.onError(function (err) {
          return {
              title: 'JS Rigger',
              message: err.message
          };
      }))
      .pipe(gulp.dest(path.build.js))
      .pipe(reload({stream: true}));
  });

  gulp.task('sprites', function () {
    gulp.src(path.src.svg)
      .pipe(svgSprite({
        mode: {
          symbol: true
        }
      }))
      .pipe(gulp.dest(path.build.svg))
  });


  gulp.task('style:build', function () {
    gulp.src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(stylus({'include css': true}))
        .on('error', notify.onError(function (err) {
            return {
                title: 'Stylus',
                message: err.message
            };
        }))
        .pipe(prefixer({
            browsers: ['last 4 versions','> 1%','Android 4.4','ios_saf >=7']
        }))
        .pipe(gulpif(argv.prod, cleancss()))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
  });

  gulp.task('build', [
    'html:build',
    'js:build',
    'style:build'
  ]);

  gulp.task('watch', function () {
    watch([path.watch.html], function (event, cb) {
      gulp.start('html:build');
    });
    watch([path.watch.style], function (event, cb) {
      gulp.start('style:build');
    });
    watch([path.watch.js], function (event, cb) {
      gulp.start('js:build');
    });
  });

  gulp.task('webserver', function () {
    browserSync(config);
  });

  gulp.task('default', ['build', 'webserver', 'watch']);
