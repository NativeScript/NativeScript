require("globals");
import definition = require("application");
import fs = require("file-system");
import fileSystemAccess = require("file-system/file-system-access");
import styleScope = require("ui/styling/style-scope");
import observable = require("data/observable");

var events = new observable.Observable();
require("utils/module-merge").merge(events, exports);

export var launch = "launch";

export var uncaughtError = "uncaughtError";

export var suspend = "suspend";

export var resume = "resume";

export var exit = "exit";

export var lowMemory = "lowMemory";

export var cssFile: string = "app.css"

export var resources: any = {};

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
            new fileSystemAccess.FileSystemAccess().readText(cssFileName, r => { applicationCss = r; });
            definition.cssSelectorsCache = styleScope.StyleScope.createSelectorsFromCss(applicationCss, cssFileName);
        }
    }
}