const { GenerateNativeScriptEntryPointsPlugin } = require("./GenerateNativeScriptEntryPointsPlugin");

// backwards compatibility for <= 0.22 configs
exports.GenerateBundleStarterPlugin = (function () {
    function GenerateBundleStarterPlugin() {
        this.entryPointsPlugin = new GenerateNativeScriptEntryPointsPlugin("bundle");
    };

    GenerateBundleStarterPlugin.prototype.apply = function (compiler) {
        this.entryPointsPlugin.apply(compiler);
    }

    return GenerateBundleStarterPlugin;
})();
