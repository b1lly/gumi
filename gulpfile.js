var gulp = require('gulp'),
    minifyCSS = require('gulp-minify-css'),
    filesize = require('gulp-filesize'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    gutil = require('gulp-util'),
    jshint = require('gulp-jshint');

gulp.task('default', ['cssmin', 'uglify', 'jslint']);

gulp.task('jslint', function() {
	return gulp.src('./src/gumi.js')
		.pipe(jshint())
		.pipe(jshint.reporter());
});

gulp.task('cssmin', function() {
	return gulp.src('./src/gumi.css')
    	.pipe(filesize()) 
		.pipe(minifyCSS())
		.pipe(filesize())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('./dist'))
		.on('error', gutil.log);
});

gulp.task('uglify', function() {
	return gulp.src('./src/gumi.js')
	    .pipe(filesize())
	    .pipe(uglify())
	    .pipe(filesize())
	    .pipe(rename({ suffix: '.min' }))
	    .pipe(gulp.dest('./dist'))
	    .on('error', gutil.log);
});

gulp.task('watch', function() {
	gulp.watch('./src/*', ['cssmin', 'uglify', 'jslint']);
});
