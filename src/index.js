const mix = require('laravel-mix');
const RenderNunjucksTask = require('./RenderNunjucksTask');

class Nunjucks {
  name() {
    return ['nunjucks', 'njk'];
  }

  register(src, dest, options = {}) {
    Mix.addTask(new RenderNunjucksTask({ src, dest, options }));
  }
}

mix.extend('njk', new Nunjucks());
