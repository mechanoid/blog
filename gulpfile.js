"use strict";

var fs = require('fs-extra');
var path = require('path');
var gulp = require('gulp');
var gutil = require('gulp-util');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');
var rev = require('gulp-rev');
var clean = require('gulp-clean');
var gulpSequence = require('gulp-sequence');
var ghPages = require('gulp-gh-pages');
var revReplace = require("gulp-rev-replace");
var replace = require('gulp-replace');
var concat = require("gulp-concat");
var postIncludeBuilder = require('./tasks/post-include-builder.js');
var postViewBuilder = require('./tasks/post-view-builder.js');
var frontMatter = require('gulp-front-matter');
var data = require('gulp-data');
var RSS = require('rss');
var sitemap = require('gulp-sitemap');
var imageop = require('gulp-image-optimization');
var gzip = require('gulp-gzip');
var config = {
	env: "development",
	dist: "dist",
	remoteDist: "/",
	host: 'http://127.0.0.1:8080'
};

var templatePathsWithExcludes = [
	'!./templates/tmp/**/*'
	, '!./templates/posts/**/*'
	, '!./templates/helper/**/*'
	, '!./templates/layouts/**/*'];

var buildPaths = templatePathsWithExcludes.slice();
buildPaths.push('./lib/*');

var watchPaths = templatePathsWithExcludes.slice();
watchPaths.push('./lib/**/*');
watchPaths.push('./tempates/**/*.jade');

var jadeFiles  = templatePathsWithExcludes.slice()
jadeFiles.push('./templates/**/*.jade');
jadeFiles.push('./tmp/posts/**/*.jade');

var distFolder = config.dist;
var distPath = './' + distFolder;
var assetFolder = distFolder + '/assets';
var assetPath = distPath + '/assets';


gulp.task('clean', function () {
	return gulp.src([distPath, 'tmp'], {read: false})
		.pipe(plumber())
		.pipe(clean());
});

gulp.task('post-include-mixins', function(done) {
	return gulp.src('./posts/**/*.md')
	.pipe(frontMatter({
		property: 'frontMatter',
		remove: true
	}))
	.pipe(gulp.dest('./tmp/processed-posts'))
	.pipe(postIncludeBuilder())
	.pipe(concat('post_include_mixins.jade'))
	.pipe(gulp.dest('./tmp'));
});

gulp.task('article-pages', function(done) {
	return gulp.src('./posts/**/*.md')
	.pipe(frontMatter({
		property: 'frontMatter',
		remove: true
	}))
	.pipe(postViewBuilder())
	.pipe(gulp.dest('./tmp/posts'));
});

gulp.task('templates', ['article-pages'], function() {
  var manifest = gulp.src(assetPath + '/rev-manifest.json');

  var t =  gulp.src(jadeFiles)
    .pipe(plumber())
    .pipe(jade({pretty: true, locals: { host: config.host, copyrightYear: new Date().getFullYear() }}))
    .pipe(revReplace({manifest: manifest}))

	if (config.env === 'production') {
		t = t.pipe(replace(/(=["'])(\/)([^\/])/g, "$1" + config.remoteDist + "$3"));
	}

	return t
		.pipe(gulp.dest(distPath));
});

gulp.task('images', function() {
  return gulp.src(['./assets/images/**/*'])
    .pipe(gulp.dest(assetPath + '/images'));
});

gulp.task('optimized-images', function() {
  return gulp.src(['./assets/images/**/*'])
		.pipe(imageop({
	    optimizationLevel: 5,
	    progressive: true,
    	interlaced: true
    }))
    .pipe(gulp.dest(assetPath + '/images'));
});

gulp.task('scripts', function() {
  return gulp.src(['./lib/**/*.js'
	, './node_modules/clipboard/dist/clipboard.js'
	, './node_modules/prismjs/prism.js'
	, './node_modules/jquery/dist/jquery.js',
	, './node_modules/hammerjs/hammer.js'
	])
  .pipe(gulp.dest(assetPath + '/javascripts'));
});

gulp.task('gzip', function() {
  return gulp.src([assetPath + '/**/*.js', assetPath + '/**/*.css', distPath + '/**/*.html'])
	.pipe(gzip())
  .pipe(gulp.dest(assetPath));
});

gulp.task('asset-revisioning', ['styles', 'scripts'], function () {
  return gulp.src([assetPath + '/javascripts/*.js', assetPath + '/styles/*.css'], {base: assetFolder})
    .pipe(rev())
    .pipe(gulp.dest(assetPath))  // write rev'd assets to build dir
    .pipe(rev.manifest())
    .pipe(gulp.dest(assetPath)); // write manifest to build dir
});

gulp.task('stylus', function () {
  return gulp.src('./lib/*.styl')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(stylus())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(assetPath + '/styles'));
});

gulp.task('static-styles', function() {
	return gulp.src(['node_modules/prismjs/themes/prism.css'])
	.pipe(gulp.dest(assetPath + '/styles'));
});

gulp.task('styles', ['stylus', 'static-styles']);

gulp.task('enable-prod-env', function(cb) {
	config.envbak = config.env;
	config.env = 'production';
	config.hostbak = config.host;
	config.host = 'http://mechanoid.github.io/blog';
	cb();
});

gulp.task('rss', function() {
	var feed = new RSS({
		title: 'Relentless Development',
		site_url: 'http://www.relentless-development.com/',
		feed_url: 'http://www.relentless-development.com/feed.xml',
		description: 'relentless thoughts on software development, software architecture and related stuff',
		webMaster: 'falkhoppe81@gmail.com (Falk Hoppe)',
		language: 'en' });

  return gulp.src('./posts/*.md')
    .pipe(frontMatter())
		.pipe(data(function(file) {
			var post = file.frontMatter;
			feed.item({
				title: post.title,
				description: post.tldr,
				url: post.url,
				date: post.date,
				author: "Falk Hoppe"
			});

			return file;
		}))
    .pipe(concat('feed.xml'))
		.pipe(data(function(file) {
			file.contents = new Buffer(feed.xml());
			return file;
		}))
    .pipe(gulp.dest(distPath));
});

gulp.task('sitemap', function () {
  return gulp.src('dist/**/*.html')
    .pipe(sitemap({
        siteUrl: 'http://www.relentless-development.com/'
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('copy-cname', function(cb) {
	return gulp.src('CNAME')
	.pipe(gulp.dest(distPath));
});

gulp.task('disable-prod-env', function(cb) {
	config.env = config.envbak;
	config.host = config.hostbak;
	cb();
});

gulp.task('build', function(cb) {
	return gulpSequence('clean', 'post-include-mixins', 'asset-revisioning', 'templates', 'images')(cb);
})

gulp.task('build-release', function(cb) {
	return gulpSequence('clean', 'post-include-mixins', 'asset-revisioning', 'gzip', 'enable-prod-env', 'templates', 'disable-prod-env', 'optimized-images', 'copy-cname', 'rss', 'sitemap')(cb);
})

gulp.task('default', ['build']);

gulp.task('watch', ['build'], function() {
  gulp.watch(watchPaths, ['build']);
});

gulp.task('deploy', ['build-release'], function() {
  return gulp.src(distPath + '/**/*')
    .pipe(ghPages({ remoteUrl: "git@github.com:mechanoid/mechanoid.github.io.git", branch: "master" }));
});
