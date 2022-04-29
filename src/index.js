const mix = require("laravel-mix");
const Mix = require("laravel-mix/src/Mix");
const NunjucksTask = require("./NunjucksTask");

class Nunjucks {
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
    Mix.primary.addTask(new NunjucksTask({ from, to, options }));
  }
}

mix.extend("njk", Nunjucks);
