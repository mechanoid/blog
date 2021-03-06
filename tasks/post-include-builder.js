var path = require('path');
var gutil = require('gulp-util');
var through2 = require('through2');
var File = require('vinyl');

module.exports = function(opts) {
  'use strict';

  opts = opts || {};
  var files = [];

  return through2.obj(function(file, enc, callback) {

    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return callback();
    }

    file.contents = new Buffer("mixin " + path.basename(file.path, '.md') + "\n" + "  include:markdown-it " + path.relative('./processed-posts', file.path));
    files.push(file);
    this.push(file);
    callback();
  }, function(cb) {
    var i, fls, file, ctx = {};


    fls = [].slice.call(files).sort(function(a,b) {
      var a = new Date(a.frontMatter.date);
      var b = new Date(b.frontMatter.date);

      return a > b ? -1 : a<b ? 1 : 0;
    });

    for(i = 0; i < fls.length; i++) {
      if(fls.hasOwnProperty(i)) {
        file = fls[i];
        ctx[path.basename(file.path, '.md')] = file.frontMatter;
      }
    }
    var dummy = new File({path: __dirname + "../post-mixins-data.jade"});
    dummy.contents = new Buffer("mixin article-data\n"
    + "  - ctx = " + JSON.stringify(ctx) + '\n'
    + "  if block" + '\n'
    + "    block" + '\n');
    this.push(dummy);
    return cb();
  });
};
