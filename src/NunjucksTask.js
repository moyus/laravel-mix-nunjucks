const path = require("path");
const nunjucks = require("nunjucks");
const fm = require("front-matter");
const md = require("marked");
const globby = require("globby");
const chokidar = require("chokidar");
const File = require("laravel-mix/src/File");
const Log = require("laravel-mix/src/Log");
const NunjucksMixTag = require("./NunjucksMixTag");

class NunjucksTask {
  /**
   * Create a new task instance.
   *
   * @param {object} data
   */
  constructor(data) {
    this.data = data;
    this.from = new File(data.from);
    this.to = new File(data.to);
    this.options = Object.assign(
      {
        ext: ".html",
        data: {},
        block: "content",
        marked: null,
        envOptions: null,
        manageEnv: null,
      },
      data.options
    );
    this.base = this.from.isDirectory()
      ? this.from.path()
      : this.from.segments.base.split("*")[0];

    this.watcher = null;
    this.isBeingWatched = false;
    const loader = new nunjucks.FileSystemLoader(this.base, { noCache: true });
    this.compiler = new nunjucks.Environment(loader, this.options.envOptions);
    this.compiler.addExtension("mix", new NunjucksMixTag());
    md.setOptions(this.options.marked);

    if (typeof this.options.manageEnv === "function") {
      this.options.manageEnv.call(null, this.compiler);
    }
  }

  /**
   * Run the task and render all files
   * except name start with '_'
   */
  run() {
    const patterns = [
      this.from.path(),
      "!" + path.join(this.base, "**/_**/*"),
      "!" + path.join(this.base, "**/_*"),
    ];

    const files = globby.sync(patterns, { onlyFiles: true });
    files.forEach((filePath) => this.onChange(filePath));
  }

  /**
   * Watch all relevant files for changes
   *
   * @param {boolean} usePolling
   */
  watch(usePolling = false) {
    if (this.isBeingWatched) return;

    const options = { usePolling, ignored: /(^|[\/\\])\../ };
    this.watcher = chokidar
      .watch(this.data.from, options)
      .on("all", (eventName, filePath) => {
        this.onChange(filePath, eventName);
      });
    this.isBeingWatched = true;
  }

  unwatch() {
    if (!this.watcher) return;
    this.watcher.close();
    this.isBeingWatched = false;
  }

  /**
   * Handle when a relevant source file is changed
   *
   * @param {string} updatedFilePath
   * @param {string} type
   */
  onChange(updatedFilePath, type = "change") {
    const srcFile = new File(updatedFilePath);
    let distFile = this.to;
    if (distFile.isDirectory()) {
      distFile = distFile.append(
        path.join(
          path.relative(this.base, srcFile.base()),
          srcFile.nameWithoutExtension() + this.options.ext
        )
      );
    }

    const isPartial = path
      .relative(this.base, updatedFilePath)
      .split("/")
      .some((name) => name.startsWith("_"));

    switch (type) {
      case "change":
      case "add":
        if (isPartial) {
          this.run();
        } else {
          this.compile(srcFile, distFile);
        }
        break;
      case "unlink":
        if (isPartial) {
          this.run();
        } else {
          destFile.delete();
        }
        break;
      case "unlinkDir":
        if (!isPartial) {
          destFile.delete();
        }
        break;
    }
  }

  /**
   * Compile template file
   *
   * @param {File} srcFile
   * @param {File} distFile
   */
  compile(srcFile, distFile) {
    const data = Object.assign({}, this.options.data);
    let template = srcFile.read();
    const frontmatter = fm(template);

    if (frontmatter.attributes && Object.keys(frontmatter.attributes).length) {
      if (srcFile.extension() === ".md") {
        template = md(frontmatter.body);
      }

      Object.assign(data, { page: frontmatter.attributes });

      if (data.page.layout) {
        template =
          '{% extends "' +
          data.page.layout +
          '.njk" %}\n{% block ' +
          this.options.block +
          " %}" +
          template +
          "\n{% endblock %}";
      } else {
        Log.info(`No layout declared in ${src.path()}`);
      }
    }

    const result = this.compiler.renderString(template, data);
    distFile.makeDirectories();
    distFile.write(result);
  }
}

module.exports = NunjucksTask;
