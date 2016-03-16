var gulp = require('gulp');
var Elixir = require('laravel-elixir');

var $ = Elixir.Plugins;
var config = Elixir.config;
var _ = require('underscore');

_.mixin({
    deepExtend: require('underscore-deep-extend')(_)
});

$.changed = require('gulp-changed');
$.svgmin = require('gulp-svgmin');

/*
 |----------------------------------------------------------------
 | SVG Compilation
 |----------------------------------------------------------------
 |
 | This task offers a very simple way to minify your SVG assets.
 | You can either minify a single file or a entire directory.
 | Don't forget the path if you specify alternate options.
 |
 */

Elixir.extend('svg', function(src, output, options) {
    config.images = config.images || {};
    config.images.svg = {
        folder: 'images',
        outputFolder: 'img',
        options: {
            plugins: [{
                removeUselessDefs: false
            }, {
                cleanupIDs: false
            }]
        }
    };

    _.deepExtend(config.images.svg.options, options);

    var paths = prepGulpPaths(src, output);

    new Elixir.Task('svg', function() {
        this.log(paths.src, paths.output);

        return (
            gulp
            .src(paths.src.path)
            .pipe($.changed(paths.output.baseDir))
            .pipe($.svgmin(config.images.svg.options)
                .on('error', function(e) {
                    new Elixir.Notification().error(e, 'SVG Minification Failed!');
                    this.emit('end');
                }))
            .pipe(gulp.dest(paths.output.baseDir))
            .pipe(new Elixir.Notification('SVGs Minified!'))
        );
    })
    .watch(paths.src.baseDir + '/**/*.svg')
    .ignore(paths.output.path)
});


/**
 * Prep the Gulp src and output paths.
 *
 * @param  {string|Array} src
 * @param  {string|null}  baseDir
 * @param  {string|null}  output
 * @return {GulpPaths}
 */
var prepGulpPaths = function(src, output) {
    return new Elixir.GulpPaths()
        .src(src, config.get('assets.images.svg.folder'))
        .output(output || config.get('public.images.svg.outputFolder'), 'app.svg');
}
