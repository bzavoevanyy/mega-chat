'use strict';

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    webserver = require('gulp-webserver');

//gulp.task('libsjs', function(){
//    gulp.src([
//            'bower_components/angular/angular.js',
//            'bower_components/angular-route/angular-route.js',
//        ])
//        .pipe(concat('libs.js'))
//        .pipe(gulp.dest('builds/dev'));
//});

gulp.task('js', function(){
    gulp.src([
            'dev/app/**/*.js'
        ])
        .pipe(concat('app.js'))

        .pipe(gulp.dest('dev'));
});
gulp.task('css', function(){
    gulp.src([
            'bower_components/bootstrap/dist/css/bootstrap.css',
            'dev/app/css/**/*.*'
        ])
        .pipe(concat('theme.css'))
        .pipe(gulp.dest('dev/css'));
});

gulp.task('fonts', function(){
    gulp.src('bower_components/bootstrap/dist/fonts/**/*.*')
        .pipe(gulp.dest('dev/fonts/'));
});

gulp.task('watch', function(){
    gulp.watch('dev/app/**/*.js', ['js']);
    gulp.watch('dev/app/css/**/*.css', ['css']);
});

gulp.task('webserver', function(){
    gulp.src('dev')
        .pipe(webserver({
            livereload: true,
            open: true
        }));
});


gulp.task('default', [
    'js',
    'css',
    'fonts',
    'watch',
    'webserver'
]);
