module.exports = function nativescriptTarget(compiler) {
    const options = this;
    const webpackLib = "webpack/lib";

    // Custom template plugin
    const NsJsonpTemplatePlugin = require("./NsJsonpTemplatePlugin");

    const FunctionModulePlugin = require(webpackLib + "/FunctionModulePlugin");
    const NodeSourcePlugin = require(webpackLib + "/node/NodeSourcePlugin");
    const LoaderTargetPlugin = require(webpackLib + "/LoaderTargetPlugin");

    new NsJsonpTemplatePlugin(options.output).apply(compiler);
    new FunctionModulePlugin(options.output).apply(compiler);
    new NodeSourcePlugin(options.node).apply(compiler);
    new LoaderTargetPlugin("web").apply(compiler);
}
