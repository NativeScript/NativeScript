const { reload } = require("./hot-loader-helper");
const { convertToUnixPath } = require("./lib/utils");

module.exports = function (source, map) {
    const typeMarkup = "markup";
    const moduleRelativePath = this.resourcePath.replace(this.rootContext, ".");
    const modulePath = convertToUnixPath(moduleRelativePath);

    this.callback(null, `${source};${reload({ type: typeMarkup, path: modulePath })}`, map);
};
