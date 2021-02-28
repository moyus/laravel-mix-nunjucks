const nunjucks = require("nunjucks");

class NunjucksMixTag {
  constructor() {
    this.tags = ["mix"];
  }

  parse(parser, nodes) {
    var tok = parser.nextToken();

    // Parse the markdown tag and collect any arguments
    var args = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(tok.value);

    // If arguments, return the fileTag constructed node
    return new nodes.CallExtension(this, "run", args);
  }

  run(context, file) {
    const assets = Mix.manifest.get();
    return new nunjucks.runtime.SafeString(assets[file] || "");
  }
}

module.exports = NunjucksMixTag;
