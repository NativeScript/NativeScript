// The "ui/frame/activity" module is not public, but is refered in legacy versons of webpack.config
// So add the re-export manually
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("@nativescript/core/ui/frame/activity"));
