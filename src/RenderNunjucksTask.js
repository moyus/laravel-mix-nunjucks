const path = require('path');
const nunjucks = require('nunjucks');
const fm = require('front-matter');
const md = require('marked');
const fs = require('fs-extra');
const globby = require('globby');
const chokidar = require('chokidar');
const Task = require('laravel-mix/src/tasks/Task');

class RenderNunjucksTask extends Task {
  constructor (data) {
    super(data);
    const options = this.options = Object.assign({
      base: '',
      path: '.',
      ext: '.html',
      data: {},
      block: 'content',
      marked: null,
      inheritExtension: false,
      envOptions: {
        watch: false,
      },
      manageEnv: null,
      loaders: null,
    }, data.options);
  
    nunjucks.configure(options.envOptions);

    if (!options.loaders) {
      options.loaders = new nunjucks.FileSystemLoader(options.path);
    }
    
    this.watcher = null;
    this.isBeingWatched = false;
    this.src = [data.src, '!' + this.options.path, '!_*'];
    this.dest = data.dest;
    this.compiler = new nunjucks.Environment(options.loaders, options.envOptions);
    md.setOptions(options.marked);

    if (typeof options.manageEnv === 'function') {
      options.manageEnv.call(null, this.compiler);
    }
  }

  run() {
    this.renderAll();
  }

  watch(usePolling = false) {
    if (this.isBeingWatched) return;

    const options = { usePolling, ignored: /(^|[\/\\])\../ };
    this.watcher = chokidar.watch(this.src, options).on('all', this.handle.bind(this));
    this.isBeingWatched = true;
  }

  unwatch() {
    if (!this.watcher) return;
    this.watcher.close();
  }

  handle(type, fromFileRelative) {
    const { name, dir } = path.parse(fromFileRelative);
    const fromFileAbsolute = path.resolve(fromFileRelative);
    let subDir = this.options.base ? dir.split(this.options.base).pop() : '';
    subDir = subDir.startsWith('/') ? subDir.slice(1) : subDir;
    const toFileAbsolute = path.resolve(this.dest, subDir, name + this.options.ext);

    switch (type) {
      case 'change':
      case 'add':
        this.render(fromFileAbsolute, toFileAbsolute);
        break
      case 'unlink':
        fs.unlinkSync(toFileAbsolute);
        break
    }
  }

  renderAll() {
    globby.sync(this.src, { onlyFiles: true })
      .map(fromFileRelative => this.handle('add', fromFileRelative));
  }

  render(fileFrom, fileTo) {
    const data = Object.assign({}, this.options.data);

    let template = fs.readFileSync(fileFrom, 'utf8');

    const frontmatter = fm(template);

    if (frontmatter.attributes && Object.keys(frontmatter.attributes).length) {

      if (/\.md|\.markdown/.test(path.extname(fileFrom))) {
        template = md(frontmatter.body);
      }

      Object.assign(data, { page: frontmatter.attributes });

      if (data.page.layout) {
        template = '\{% extends \"' + data.page.layout + '.njk\" %\}\n\{% block ' +  this.options.block + ' %\}' + template + '\n\{% endblock %\}';
      } else {
        console.warn(`No layout declared in ${fileFrom}`);
      }
    }

    const result = this.compiler.renderString(template, data);
    fs.outputFileSync(fileTo, result);
  }
}

module.exports = RenderNunjucksTask;
