require("globals");
import definition = require("application");
import cssParser = require("js-libs/reworkcss");
import fs = require("file-system");
import fileSystemAccess = require("file-system/file-system-access");
import styleScope = require("ui/styling/style-scope");

export var cssFile: string = "app/app.css"

export var onUncaughtError: (error: definition.NativeScriptError) => void = undefined;

export var onLaunch: (context: any) => any = undefined;

export var onSuspend: () => any = undefined;

export var onResume: () => any = undefined;

export var onExit: () => any = undefined;

export var onLowMemory: () => any = undefined;

export var android = undefined;

export var ios = undefined;

export function loadCss() {
    if (definition.cssFile) {
        var cssFileName = fs.path.join(fs.knownFolders.currentApp().path, definition.cssFile);
        var applicationCss;
        if (fs.File.exists(cssFileName)) {
            // Read the CSS file.
            new fileSystemAccess.FileSystemAccess().readText(cssFileName, r => { applicationCss = r; });
            var applicationCssSyntaxTree = cssParser.parse(applicationCss, undefined);
            definition.cssSelectorsCache = styleScope.StyleScope.createSelectorsFromSyntaxTree(applicationCssSyntaxTree);
        }
    }
}