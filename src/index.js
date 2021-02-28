const mix = require("laravel-mix");
const NunjucksTask = require("./NunjucksTask");

class Nunjucks {
  constructor() {
    this.tasks = [];
  }

  /**
   * The API name for the component
   */
  name() {
    return ["nunjucks", "njk"];
  }

  /**
   * Register the component
   *
   * @param {string} from
   * @param {string} to
   * @param {object} options
   */
  register(from, to, options = {}) {
    this.tasks.push(new NunjucksTask({ from, to, options }));
  }

  /**
   * Boot the component. This method is triggered after the
   * user's webpack.mix.js file has processed.
   */
  boot() {
    /**
     * In order to get the latest hashed assets path in manifest,
     * we need to run our tasks after Mix internal assets
     * versioning task, the Mix `build` event woulbe be a good
     * timing to do that.
     */
    Mix.listen("build", async () => {
      await this.runTasks().then(() => {
        if (Mix.isWatching()) {
          this.tasks.forEach((task) => task.watch(Mix.isPolling()));
        }
      });
    });
  }

  /**
   * Execute tasks parallelly
   */
  async runTasks() {
    await Promise.all(this.tasks.map((task) => task.run()));
  }
}

mix.extend("njk", new Nunjucks());
