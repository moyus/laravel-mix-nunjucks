const path = require('path');
const nunjucks = require('nunjucks');
const fm = require('front-matter');
const md = require('marked');
const globby = require('globby');
const chokidar = require('chokidar');
const debounce = require('debounce');
const Task = require('laravel-mix/src/tasks/Task');
const File = require('laravel-mix/src/File');
const FileCollection = require('laravel-mix/src/FileCollection');
const Log = require('laravel-mix/src/Log');
const NunjucksMixTag = require('./NunjucksMixTag');

class RenderNunjucksTask extends Task {
  constructor (data) {
    super(data);

    this.options = Object.assign({
      ext: '.html',
      data: {},
      block: 'content',
      marked: null,
      envOptions: null,
      manageEnv: null,
    }, data.options);
  
    this.from = new File(data.from);
    this.to = new File(data.to);
    this.files = new FileCollection(data.from);
    this.base = this.from.isDirectory() ? this.from.path() : this.from.segments.base.split('*')[0];

    this.watcher = null;
    this.isBeingWatched = false;
    const loader = new nunjucks.FileSystemLoader(this.base, { noCache: true });
    this.compiler = new nunjucks.Environment(loader, this.options.envOptions);
    this.compiler.addExtension('mix', new NunjucksMixTag());
    md.setOptions(this.options.marked);

    if (typeof this.options.manageEnv === 'function') {
      this.options.manageEnv.call(null, this.compiler);
    }
  }

  run() {
    this.renderAll();
  }

  watch(usePolling = false) {
    if (this.isBeingWatched) return;

    const options = { usePolling, ignored: /(^|[\/\\])\../ };
    this.watcher = chokidar.watch(this.data.from, options).on('all', (eventName, filePath) => {
      this.handle(eventName, new File(filePath));
    });
    this.isBeingWatched = true;
  }

  unwatch() {
    if (!this.watcher) return;
    this.watcher.close();
  }

  /**
   * Handle file change
   * 
   * @param {string} type
   * @param {File} srcFile
   */
  handle(type, srcFile) {
    let destFile = this.to;
    const name = srcFile.nameWithoutExtension();
    const subDir = path.relative(this.base, srcFile.base());
    const isPartial = subDir.split('/').some(dir => dir.startsWith('_')) || name.startsWith('_');

    if (destFile.isDirectory()) {
      destFile = this.to.append(path.posix.join(subDir, name + this.options.ext));
    }

    switch (type) {
      case 'change':
      case 'add':
        if (isPartial) {
          this.renderAll();
        } else {
          this.render(srcFile, destFile);
        }
        break;
      case 'unlink':
        destFile.delete();
        break;
    }
  }

  /**
   * Render all files except templates start with '_' or under '_*' directories
   */
  renderAll() {
    const patterns = [
      this.from.path(),
      '!' + path.posix.join(this.base, '**/_**/*'),
      '!' + path.posix.join(this.base, '**/_*'),
    ];
    globby.sync(patterns, { onlyFiles: true })
      .map(filePath => this.handle('change', new File(filePath)));
  }

  /**
   * Render template to destination file
   * 
   * @param {File} src
   * @param {File} dest
   */
  render(src, dest) {
    // deplay template render to be sure that assets compile first
    // so we can get versioned mainifest

    const data = Object.assign({}, this.options.data);

    let template = src.read();

    const frontmatter = fm(template);

    if (frontmatter.attributes && Object.keys(frontmatter.attributes).length) {

      if (src.extension() === '.md') {
        template = md(frontmatter.body);
      }

      Object.assign(data, { page: frontmatter.attributes });

      if (data.page.layout) {
        template = '\{% extends \"' + data.page.layout + '.njk\" %\}\n\{% block ' +  this.options.block + ' %\}' + template + '\n\{% endblock %\}';
      } else {
        Log.info(`No layout declared in ${src.path()}`);
      }
    }

    const result = this.compiler.renderString(template, data);
    dest.makeDirectories();
    dest.write(result);
  }
}

module.exports = RenderNunjucksTask;
