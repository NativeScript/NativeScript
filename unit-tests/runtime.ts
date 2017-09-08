import "tslib";

import * as moduleAlias from "module-alias";
import * as path from "path";

const tnsCoreModules = path.resolve(__dirname, "..", "tns-core-modules");

moduleAlias.addPath(tnsCoreModules);
moduleAlias.addAliases({
    // NOTE: require("tns-core-modules/platform") with these aliases will work in node but fail in Angular AoT
    // "tns-core-modules/platform": path.resolve(__dirname, "polyfills", "platform"),
    // "tns-core-modules/file-system/file-system-access": path.resolve(__dirname, "polyfills", "file-system-access"),
    // "tns-core-modules/utils/utils": path.resolve(tnsCoreModules, "utils/utils-common"),
    // "tns-core-modules/color": path.resolve(tnsCoreModules, "color/color-common"),
    // "tns-core-modules/ui/styling/font": path.resolve(tnsCoreModules, "ui/styling/font-common"),
    // "tns-core-modules/ui/styling/background": path.resolve(tnsCoreModules, "ui/styling/background-common"),

    "tns-core-modules": tnsCoreModules,
    "~": __dirname
});
