import * as label from "tns-core-modules/ui/label";
import * as pages from "tns-core-modules/ui/page";
import * as fs from "tns-core-modules/file-system";
import * as fileResolverModule from "tns-core-modules/file-system/file-name-resolver";

export function createPage() {
    var page = new pages.Page();
    var lbl = new label.Label();

    var moduleName = "tests/pages/files/test";

    var resolver = new fileResolverModule.FileNameResolver({
        width: 400,
        height: 600,
        os: "android",
        deviceType: "phone"
    });

    // Current app full path.
    var currentAppPath = fs.knownFolders.currentApp().path;
    var moduleNamePath = fs.path.join(currentAppPath, moduleName);

    var fileName = resolver.resolveFileName(moduleNamePath, "xml");
    lbl.text = fileName;
    lbl.textWrap = true;

    page.content = lbl;

    return page;
}
