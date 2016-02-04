var
    gulp = require('gulp'),
    eslint = require('gulp-eslint');

gulp.task('lint', function () {
    return gulp.src(['./gulpfile.js', './src/**/*.js', './test/unit/**/*.js', './build/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});
