"use strict";

var gulp = require("gulp");
var del = require("del");
var rename = require("gulp-rename");
var changed = require('gulp-changed');
var plumber = require("gulp-plumber");
var pump = require('pump');
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var csscomb = require("gulp-csscomb");
var csso = require("gulp-csso");
var uglify = require("gulp-uglify");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
var svgstore = require("gulp-svgstore");
var svgmin = require('gulp-svgmin');
var run = require("run-sequence");
var server = require("browser-sync").create();

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(plumber())
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin({
      minifyJS: true,
      minifyURLs: true,
      collapseWhitespace: true,
      removeComments: true,
      sortAttributes: true,
      sortClassName: true
    }))
    .pipe(gulp.dest("build"))
});

gulp.task("style", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csscomb())
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("script-min", function (cb) {
  pump([
    gulp.src("source/js/**/*.js"),
    uglify(),
    rename({suffix: ".min"}),
    gulp.dest("build/js")
  ], cb);
});

gulp.task("images", function () {
  return gulp.src('source/img/**/*.{jpg,png,webp}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest('build/img'));
});

gulp.task("svg", function () {
  return gulp.src("source/img/vector/**/*.svg")
    .pipe(svgmin())
    .pipe(gulp.dest("build/img/vector"));
});

gulp.task("sprite", ["svg"], function () {
  return gulp.src("build/img/vector/sprite/*.svg")
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img/vector"));
});

gulp.task("del-sprite", function () {
  return del("build/img/vector/sprite{.svg,/}");
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("copy", function () {
  return gulp.src([
      "source/fonts/*.{woff,woff2}",
      "source/js/**/*.js"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
});


gulp.task("serve", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("source/*.html", ["html"]).on("change", server.reload);
  gulp.watch("source/js/*.js", ["script"]).on("change", server.reload);
});


gulp.task("build", function (done) {
  run(
    "clean",
    "copy",
    "images",
    "sprite",
    "html",
    "style",
    "script-min",
    done
  );
});
