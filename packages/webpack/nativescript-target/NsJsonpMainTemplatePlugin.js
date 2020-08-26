const Template = require("webpack/lib/Template");
const SyncWaterfallHook = require("tapable").SyncWaterfallHook;

class NsJsonpMainTemplatePlugin {
    apply(mainTemplate) {
        const needChunkOnDemandLoadingCode = chunk => {
            for (const chunkGroup of chunk.groupsIterable) {
                if (chunkGroup.getNumberOfChildren() > 0) return true;
            }
            return false;
        };
        const needChunkLoadingCode = chunk => {
            for (const chunkGroup of chunk.groupsIterable) {
                if (chunkGroup.chunks.length > 1) return true;
                if (chunkGroup.getNumberOfChildren() > 0) return true;
            }
            return false;
        };
        const needEntryDeferringCode = chunk => {
            for (const chunkGroup of chunk.groupsIterable) {
                if (chunkGroup.chunks.length > 1) return true;
            }
            return false;
        };
        if (!mainTemplate.hooks.jsonpScript) {
            mainTemplate.hooks.jsonpScript = new SyncWaterfallHook([
                "source",
                "chunk",
                "hash"
            ]);
        }

        mainTemplate.hooks.localVars.tap(
            "JsonpMainTemplatePlugin",
            (source, chunk) => {
                if (needChunkLoadingCode(chunk)) {
                    return Template.asString([
                        source,
                        "",
                        "// object to store loaded and loading chunks",
                        "var installedChunks = {",
                        Template.indent(
                            chunk.ids.map(id => `${JSON.stringify(id)}: 0`).join(",\n")
                        ),
                        "};",
                        "",
                        needEntryDeferringCode(chunk) ? "var deferredModules = [];" : ""
                    ]);
                }
                return source;
            }
        );
        mainTemplate.hooks.requireEnsure.tap(
            "JsonpMainTemplatePlugin",
            (source, chunk, hash) => {

                const chunkFilename = mainTemplate.outputOptions.chunkFilename;
                const chunkMaps = chunk.getChunkMaps();

                const request = mainTemplate.getAssetPath(
                    JSON.stringify(`./${chunkFilename}`),
                    {
                        hash: `" + ${mainTemplate.renderCurrentHashCode(hash)} + "`,
                        hashWithLength: length =>
                            `" + ${mainTemplate.renderCurrentHashCode(hash, length)} + "`,
                        chunk: {
                            id: '" + chunkId + "',
                            hash: `" + ${JSON.stringify(chunkMaps.hash)}[chunkId] + "`,
                            hashWithLength(length) {
                                const shortChunkHashMap = Object.create(null);
                                for (const chunkId of Object.keys(chunkMaps.hash)) {
                                    if (typeof chunkMaps.hash[chunkId] === "string")
                                        shortChunkHashMap[chunkId] = chunkMaps.hash[chunkId].substr(
                                            0,
                                            length
                                        );
                                }
                                return `" + ${JSON.stringify(shortChunkHashMap)}[chunkId] + "`;
                            },
                            name: `" + (${JSON.stringify(
                                chunkMaps.name
                            )}[chunkId]||chunkId) + "`
                        }
                    }
                );

                return Template.asString([
                    source,
                    "",
                    "// JSONP chunk loading for javascript",
                    "",
                    "var installedChunkData = installedChunks[chunkId];",
                    'if(installedChunkData !== 0) { // 0 means "already installed".',
                        Template.indent([`var chunk = require(${request})`]),
                    "}"
                ]);
            }
        );
        mainTemplate.hooks.requireExtensions.tap(
            "JsonpMainTemplatePlugin",
            (source, chunk) => {
                if (!needChunkOnDemandLoadingCode(chunk)) return source;

                return Template.asString([
                    source,
                    "",
                    "// on error function for async loading",
                    `${
                        mainTemplate.requireFn
                    }.oe = function(err) { console.error(err); throw err; };`
                ]);
            }
        );
        mainTemplate.hooks.bootstrap.tap(
            "JsonpMainTemplatePlugin",
            (source, chunk, hash) => {
                if (needChunkLoadingCode(chunk)) {
                    const withDefer = needEntryDeferringCode(chunk);
                    return Template.asString([
                        source,
                        "",
                        "// install a JSONP callback for chunk loading",
                        "function webpackJsonpCallback(data) {",
                        Template.indent([
                            "var chunkIds = data[0];",
                            "var moreModules = data[1];",
                            withDefer ? "var executeModules = data[2];" : "",
                            '// add "moreModules" to the modules object,',
                            '// then flag all "chunkIds" as loaded and fire callback',
                            "var moduleId, chunkId, i = 0, resolves = [];",
                            "for(;i < chunkIds.length; i++) {",
                            Template.indent([
                                "chunkId = chunkIds[i];",
                                "if(installedChunks[chunkId]) {",
                                Template.indent("resolves.push(installedChunks[chunkId][0]);"),
                                "}",
                                "installedChunks[chunkId] = 0;"
                            ]),
                            "}",
                            "for(moduleId in moreModules) {",
                            Template.indent([
                                "if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {",
                                Template.indent(
                                    mainTemplate.renderAddModule(
                                        hash,
                                        chunk,
                                        "moduleId",
                                        "moreModules[moduleId]"
                                    )
                                ),
                                "}"
                            ]),
                            "}",
                            "if(parentJsonpFunction) parentJsonpFunction(data);",
                            "while(resolves.length) {",
                            Template.indent("resolves.shift()();"),
                            "}",
                            withDefer
                                ? Template.asString([
                                        "",
                                        "// add entry modules from loaded chunk to deferred list",
                                        "deferredModules.push.apply(deferredModules, executeModules || []);",
                                        "",
                                        "// run deferred modules when all chunks ready",
                                        "return checkDeferredModules();"
                                    ])
                                : ""
                        ]),
                        "};",
                        withDefer
                            ? Template.asString([
                                    "function checkDeferredModules() {",
                                    Template.indent([
                                        "var result;",
                                        "for(var i = 0; i < deferredModules.length; i++) {",
                                        Template.indent([
                                            "var deferredModule = deferredModules[i];",
                                            "var fulfilled = true;",
                                            "for(var j = 1; j < deferredModule.length; j++) {",
                                            Template.indent([
                                                "var depId = deferredModule[j];",
                                                "if(installedChunks[depId] !== 0) fulfilled = false;"
                                            ]),
                                            "}",
                                            "if(fulfilled) {",
                                            Template.indent([
                                                "deferredModules.splice(i--, 1);",
                                                "result = " +
                                                    mainTemplate.requireFn +
                                                    "(" +
                                                    mainTemplate.requireFn +
                                                    ".s = deferredModule[0]);"
                                            ]),
                                            "}"
                                        ]),
                                        "}",
                                        "return result;"
                                    ]),
                                    "}"
                                ])
                            : ""
                    ]);
                }
                return source;
            }
        );
        mainTemplate.hooks.beforeStartup.tap(
            "JsonpMainTemplatePlugin",
            (source, chunk, hash) => {
                if (needChunkLoadingCode(chunk)) {
                    var jsonpFunction = mainTemplate.outputOptions.jsonpFunction;
                    var globalObject = mainTemplate.outputOptions.globalObject;
                    return Template.asString([
                        `var jsonpArray = ${globalObject}[${JSON.stringify(
                            jsonpFunction
                        )}] = ${globalObject}[${JSON.stringify(jsonpFunction)}] || [];`,
                        "var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);",
                        "jsonpArray.push = webpackJsonpCallback;",
                        "jsonpArray = jsonpArray.slice();",
                        "for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);",
                        "var parentJsonpFunction = oldJsonpFunction;",
                        "",
                        source
                    ]);
                }
                return source;
            }
        );
        mainTemplate.hooks.startup.tap(
            "JsonpMainTemplatePlugin",
            (source, chunk, hash) => {
                if (needEntryDeferringCode(chunk)) {
                    if (chunk.hasEntryModule()) {
                        const entries = [chunk.entryModule].filter(Boolean).map(m =>
                            [m.id].concat(
                                Array.from(chunk.groupsIterable)[0]
                                    .chunks.filter(c => c !== chunk)
                                    .map(c => c.id)
                            )
                        );
                        return Template.asString([
                            "// add entry module to deferred list",
                            `deferredModules.push(${entries
                                .map(e => JSON.stringify(e))
                                .join(", ")});`,
                            "// run deferred modules when ready",
                            "return checkDeferredModules();"
                        ]);
                    } else {
                        return Template.asString([
                            "// run deferred modules from other chunks",
                            "checkDeferredModules();"
                        ]);
                    }
                }
                return source;
            }
        );
        mainTemplate.hooks.hotBootstrap.tap(
            "JsonpMainTemplatePlugin",
            (source, chunk, hash) => {
                const globalObject = mainTemplate.outputOptions.globalObject;
                const hotUpdateChunkFilename =
                    mainTemplate.outputOptions.hotUpdateChunkFilename;
                const hotUpdateMainFilename =
                    mainTemplate.outputOptions.hotUpdateMainFilename;
                const crossOriginLoading =
                    mainTemplate.outputOptions.crossOriginLoading;
                const hotUpdateFunction = mainTemplate.outputOptions.hotUpdateFunction;
                const currentHotUpdateChunkFilename = mainTemplate.getAssetPath(
                    JSON.stringify(hotUpdateChunkFilename),
                    {
                        hash: `" + ${mainTemplate.renderCurrentHashCode(hash)} + "`,
                        hashWithLength: length =>
                            `" + ${mainTemplate.renderCurrentHashCode(hash, length)} + "`,
                        chunk: {
                            id: '" + chunkId + "'
                        }
                    }
                );
                const currentHotUpdateMainFilename = mainTemplate.getAssetPath(
                    JSON.stringify(hotUpdateMainFilename),
                    {
                        hash: `" + ${mainTemplate.renderCurrentHashCode(hash)} + "`,
                        hashWithLength: length =>
                            `" + ${mainTemplate.renderCurrentHashCode(hash, length)} + "`
                    }
                );
                const runtimeSource = Template.getFunctionContent(
                    require("./NsJsonpMainTemplate.runtime.js")
                )
                    .replace(/\/\/\$semicolon/g, ";")
                    .replace(/\$require\$/g, mainTemplate.requireFn)
                    .replace(
                        /\$crossOriginLoading\$/g,
                        crossOriginLoading
                            ? `script.crossOrigin = ${JSON.stringify(crossOriginLoading)}`
                            : ""
                    )
                    .replace(/\$hotMainFilename\$/g, currentHotUpdateMainFilename)
                    .replace(/\$hotChunkFilename\$/g, currentHotUpdateChunkFilename)
                    .replace(/\$hash\$/g, JSON.stringify(hash));
                return `${source}
function hotDisposeChunk(chunkId) {
    delete installedChunks[chunkId];
}
var parentHotUpdateCallback = ${globalObject}[${JSON.stringify(
                    hotUpdateFunction
                )}];
${globalObject}[${JSON.stringify(hotUpdateFunction)}] = ${runtimeSource}`;
            }
        );
        mainTemplate.hooks.hash.tap("JsonpMainTemplatePlugin", hash => {
            hash.update("jsonp");
            hash.update("5");
            hash.update(`${mainTemplate.outputOptions.globalObject}`);
            hash.update(`${mainTemplate.outputOptions.chunkFilename}`);
            hash.update(`${mainTemplate.outputOptions.jsonpFunction}`);
            hash.update(`${mainTemplate.outputOptions.hotUpdateFunction}`);
        });
    }
}
module.exports = NsJsonpMainTemplatePlugin;

