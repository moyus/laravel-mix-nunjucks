# laravel-mix-nunjucks

![npm](https://img.shields.io/npm/v/laravel-mix-nunjucks?style=flat-square)

Laravel Mix extension to compile Nunjucks templates with markdown and front-matter support

## Install

```bash
npm install laravel-mix-nunjucks --save-dev
```

## Features

This extension performs following tasks

- Collect files name not start with `_` or under `_*` directory
- Extract front-matter data and assigns to a `page` variable
- If file is markdown, render markdown first
- Finally, render nunjucks to html

## Usage

```javascript
const mix = require('laravel-mix')
require('laravel-mix-nunjucks')

mix.njk('resources/views/', 'public/', {
  // ext: '.html',
  // data: {},
  // marked: null,
  // envOptions: null,
  // manageEnv: (nunjucks) => {},
})
```

* `ext` - Extension for compiled templates, pass null or empty string if yo don't want any extension
* `data` - Data passed to template
* `block` - Name of content block in your parent template
* `marked` - Custom options for [marked](http://github.com/chjj/marked)
* `envOptions` - These are options provided for nunjucks Environment. More info [here](https://mozilla.github.io/nunjucks/api.html#configure).
* `manageEnv` - Hook for managing environment before compilation. Useful for adding custom filters, globals, etc

For more info about nunjucks, check [https://mozilla.github.io/nunjucks/api.html](https://mozilla.github.io/nunjucks/api.html)
