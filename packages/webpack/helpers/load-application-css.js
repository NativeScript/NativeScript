module.exports = function (loadModuleFn) {
    const nsCore = require("@nativescript/core");
    require("@nativescript/core/ui/styling/style-scope");

    loadModuleFn();

    nsCore.Application.loadAppCss();
}
