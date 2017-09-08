const moduleAlias = require('module-alias');
const path = require("path");
const tnsCoreModules = path.resolve(__dirname, "..", "tns-core-modules");

moduleAlias.addPath(tnsCoreModules);

moduleAlias.addAliases({
    "tns-core-modules": tnsCoreModules,
})