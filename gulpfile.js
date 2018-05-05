'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const pug = require('gulp-pug');
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const browserSync = require('browser-sync').create();
const del = require('del');
const runSequence = require('run-sequence');

// Task for concatenating scripts
gulp.task('concatScripts', () => {
  return gulp
    .src(['src/js/*.js', 'src/js/main.js'])
    .pipe(concat('app.js'))
    .pipe(gulp.dest('dist/js/'));
});

// Minifying Scripts
gulp.task('minifyScripts', ['concatScripts'], () => {
  return gulp
    .src('dist/js/app.js')
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('dist/js/'));
});

// Task for compiling SASS to CSS
gulp.task('styles', () => {
  return gulp
    .src('src/scss/app.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
      })
    )
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
});

// Pug aka Jade compile to HTML task
gulp.task('views', () => {
  return gulp
    .src('src/views/*.pug')
    .pipe(pug({ pretty: true, compileDebug: true }))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({ stream: true }));
});

// Optimizing images
gulp.task('images', () => {
  return gulp
    .src('src/images/**/*.+(png|jpg|jpeg|gif|svg)')
    .pipe(cache(imagemin()))
    .pipe(gulp.dest('dist/images'))
    .pipe(browserSync.reload({ stream: true }));
});

// Task for Fonts
gulp.task('fonts', () => {
  return gulp
    .src('src/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
    .pipe(browserSync.reload({ stream: true }));
});

// Browser Sync Server
gulp.task('browserSync', () => {
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  });
});

// Watch Files
gulp.task('watch', () => {
  gulp.watch('src/scss/**/*.scss', ['styles']);
  gulp.watch('src/js/main.js', ['minifyScripts']);
  gulp.watch('src/views/**/**/*.pug', ['views']);
  gulp.watch('src/images/**/*.+(png|jpg|jpeg|gif|svg)', ['images']);
  gulp.watch('src/fonts/**/*', ['fonts']);
});

// Clean task
gulp.task('clean', () => {
  return del
    .sync(['dist', 'dist/css/app.css*', 'dist/js/app*.js*'])
    .then(cb => {
      return cache.clearAll(cb);
    });
});

gulp.task('default', () => {
  runSequence(
    ['styles', 'views', 'images', 'fonts', 'minifyScripts', 'browserSync'],
    'watch'
  );
});

gulp.task('build', () => {
  runSequence('clean', 'styles', ['images', 'fonts']);
});
