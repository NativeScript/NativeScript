import application = require("application");

import trace = require("trace");
trace.enable();
trace.setCategories(trace.categories.concat(trace.categories.Debug));

application.start({ moduleName: "main-page" });