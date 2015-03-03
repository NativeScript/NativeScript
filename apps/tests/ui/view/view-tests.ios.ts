import commonTests = require("./view-tests-common");

// merge the exports of the application_common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(commonTests, exports);
