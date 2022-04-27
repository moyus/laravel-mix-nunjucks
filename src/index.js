const mix = require("laravel-mix");
const { Component } = require("laravel-mix/src/components/Component");
const NunjucksTask = require("./NunjucksTask");

class Nunjucks extends Component {
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
    this.context.addTask(new NunjucksTask({ from, to, options }));
  }
}

mix.extend("njk", Nunjucks);
