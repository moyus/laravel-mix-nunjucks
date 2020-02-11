const mix = require('laravel-mix');
const RenderNunjucksTask = require('./RenderNunjucksTask');

class Nunjucks {
  name() {
    return ['nunjucks', 'njk'];
  }

  register(from, to, options = {}) {
    Mix.addTask(new RenderNunjucksTask({ from, to, options }));
  }
}

mix.extend('njk', new Nunjucks());
