const NsJsonpMainTemplatePlugin = require("./NsJsonpMainTemplatePlugin");
const JsonpChunkTemplatePlugin = require("webpack/lib/web/JsonpChunkTemplatePlugin");
const JsonpHotUpdateChunkTemplatePlugin = require("webpack/lib/web/JsonpHotUpdateChunkTemplatePlugin");

class NsJsonpTemplatePlugin {
    apply(compiler) {
        compiler.hooks.thisCompilation.tap("NsJsonpTemplatePlugin", compilation => {
            new NsJsonpMainTemplatePlugin().apply(compilation.mainTemplate);
            new JsonpChunkTemplatePlugin().apply(compilation.chunkTemplate);
            new JsonpHotUpdateChunkTemplatePlugin().apply(
                compilation.hotUpdateChunkTemplate
            );
        })
    }
}

module.exports = NsJsonpTemplatePlugin;
