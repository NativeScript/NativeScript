import TKUnit = require("../TKUnit");
import fs = require("file-system");
import fileSystemAccess = require("file-system/file-system-access");
var fileAccess = new fileSystemAccess.FileSystemAccess();

export var test_UTF8_BOM_is_not_returned = function () {
    var actualResult: string;
    fileAccess.readText(fs.path.join(__dirname, "xml.expected"), (result) => { actualResult = result; }, (error) => { TKUnit.assert(false, "Could not read file utf8.txt"); });

    var actualCharCode = actualResult.charCodeAt(0);
    var expectedCharCode = "{".charCodeAt(0); 
    TKUnit.assert(actualCharCode === expectedCharCode, "Actual character code: " + actualCharCode + "; Expected character code: " + expectedCharCode);
};
 