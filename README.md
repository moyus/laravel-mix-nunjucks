# laravel-mix-nunjucks
Laravel Mix extension to compile Nunjucks templates with markdown and front-matter support

## Install

```bash
npm install laravel-mix-nunjucks --save-dev
```

## Features

This extension performs following tasks

- Extract front-matter data and assigns to a `page` variable
- If file is markdown, render markdown first
- Finally, render nunjucks to html

## Usage

```javascript
const mix = require('laravel-mix')
require('laravel-mix-nunjucks')

mix.njk('resources/views', 'public', {
  base: 'resources/views',
  path: 'resources/views/_templates', // relative path to templates
  // ext: '.html', // extension for compiled templates
  // data: {}, // data passed to template
  // marked: null, // custom options for marted http://github.com/chjj/marked
  // envOptions: {}, // nunjucks environment https://mozilla.github.io/nunjucks/api.html#configure
  // manageEnv: {}, // hook for managing environment before compliation
  // loaders: [], // uses as first paramter to Environment constructor https://mozilla.github.io/nunjucks/api.html#environment
})
```

For more info about nunjucks, check [https://mozilla.github.io/nunjucks/api.html](https://mozilla.github.io/nunjucks/api.html)
