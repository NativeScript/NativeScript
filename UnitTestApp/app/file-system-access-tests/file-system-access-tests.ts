import * as TKUnit from "../tk-unit";
import * as fs from "tns-core-modules/file-system";

export var test_UTF8_BOM_is_not_returned = function () {
    var path = fs.path.join(fs.knownFolders.currentApp().path, "file-system-access-tests", "xml.expected");
    if (!fs.File.exists(path)) {
        TKUnit.assert(false, "Could not read file utf8.txt");
        return;
    }

    var file = fs.File.fromPath(path);

    var onError = function (error) {
        TKUnit.assert(false, "Could not read file utf8.txt");
    }

    var text = file.readTextSync(onError);
    if (text) {
        var actualCharCode = text.charCodeAt(0);
        var expectedCharCode = "{".charCodeAt(0);
        TKUnit.assert(actualCharCode === expectedCharCode, "Actual character code: " + actualCharCode + "; Expected character code: " + expectedCharCode);
    }
};

export var test_file_exists_on_folder = function () {
    var path = fs.path.join(fs.knownFolders.currentApp().path, "file-system-access-tests", "folder");

    if (!fs.Folder.exists(path)) {
        TKUnit.assert(false, `Could not read path ${path}`);
        return;
    }

    TKUnit.assertTrue(fs.File.exists(path), "File.exists() returned false for folder!");
};

export var test_leading_slash_is_not_returned = function () {
    var parts = ["app", "tns_modules", "fileName"];
    var expected = parts.join("/");
    var path = fs.path.join(...parts);

    TKUnit.assertEqual(path, expected, "Leading slash should not be part of the path");
}
