const mix = require('laravel-mix');
require('./src/index');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for your application, as well as bundling up your JS files.
 |
 */
mix.njk('tests/src', 'tests/dest', {
  base: 'tests/src',
  path: './tests/src/_templates', // relative path to templates
  // ext: '.html', // extension for compiled templates
  // data: {}, // data passed to template
  // marked: null, // custom options for marted
  // envOptions: {}, // nunjucks environment
  // manageEnv: {}, // hook for managing environment before compliation
  // loaders: [], // uses as first paramter to Environment constructor
});
