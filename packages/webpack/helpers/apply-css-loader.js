const cssLoaderWarning = "The apply-css-loader expects the file to be pre-processed by css-loader. It might not work properly. Please check your webpack configuration";

function checkForCssLoader(loaders, loaderIndex) {
    if (!loaders) {
        return false;
    }

    for (var i = loaderIndex + 1; i < loaders.length; i++) {
        const loader = loaders[i];
        if (loader.path && loader.path.indexOf("css-loader") > 0) {
            return true;
        }
    }

    return false;
}

module.exports = function (content, map) {
    if (this.request.match(/\/app\.(css|scss|less|sass)$/)) {
        return content;
    }

    // Emit a warning if the file was not processed by the css-loader.
    if (!checkForCssLoader(this.loaders, this.loaderIndex)) {
        this.emitWarning(new Error(cssLoaderWarning));
    }

    content += `
    const nsCore = require("@nativescript/core");
    require("@nativescript/core/ui/styling/style-scope");

    if (typeof exports.forEach === "function") {
        exports.forEach(cssExport => {
            if (cssExport.length > 1 && cssExport[1]) {
                // applying the second item of the export as it contains the css contents
                nsCore.Application.addCss(cssExport[1]);
            }
        });
    }
`;

    this.callback(null, content, map);
}
