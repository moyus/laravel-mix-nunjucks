const nunjucks = require("nunjucks");

class NunjucksMixTag {
  constructor() {
    this.tags = ["mix"];
  }

  parse(parser, nodes) {
    var token = parser.nextToken();

    // Parse the markdown tag and collect any arguments
    var args = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(token.value);

    // If arguments, return the fileTag constructed node
    return new nodes.CallExtension(this, "run", args);
  }

  run(context, file) {
    const assets = Mix.manifest.get();
    return new nunjucks.runtime.SafeString(assets[file] || file);
  }
}

module.exports = NunjucksMixTag;
