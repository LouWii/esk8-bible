let gulp = require('gulp');
let gulpSass = require('gulp-sass');
let cleanCSS = require('gulp-clean-css');
let rename = require('gulp-rename');
let concat = require('gulp-concat');
let uglify = require('gulp-uglify');

// ----- SASS / CSS Tasks -----

function sass() {
  return gulp.src('./scss/**/*.scss')
    .pipe(gulpSass().on('error', gulpSass.logError))
    .pipe(gulp.dest('./css'));
}

exports.sass = sass;


function minifyCss() {
  return gulp.src('css/style.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('css'));
};

exports.sass_prod = gulp.series(sass, minifyCss);


gulp.task('sass:watch', function () {
  gulp.watch('./scss/**/*.scss', ['sass', 'minify-css']);
});


// ----- JS Tasks -----

let jsFiles = [
  './node_modules/jquery/dist/jquery.min.js',
  './node_modules/popper.js/dist/umd/popper.min.js',
  './node_modules/bootstrap/dist/js/bootstrap.min.js',
  './node_modules/datatables.net/js/jquery.dataTables.js',
  './node_modules/datatables.net-bs4/js/dataTables.bootstrap4.js',
  './node_modules/typed.js/lib/typed.min.js',
  './node_modules/lity/dist/lity.min.js',
  './node_modules/chart.js/dist/Chart.bundle.min.js',
  './js/scripts.js'
  ],
    jsDest = './js';

function scripts() {
  return gulp.src(jsFiles)
      .pipe(concat('scripts.bundle.js'))
      .pipe(gulp.dest(jsDest))
      // .pipe(rename('scripts.bundle.min.js'))
      // .pipe(uglify())
      // .pipe(gulp.dest(jsDest))
      ;
};

exports.scripts = scripts;


exports.default = gulp.parallel(this.sass_prod, scripts)