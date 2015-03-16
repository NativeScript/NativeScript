import application = require("application");

require("../../tns_modules/js-libs/traceur-runtime");

require("../../tns_modules/zone/zone");
require("../../tns_modules/zone/long-stack-trace-zone");

var angular2 = require("../../tns_modules/angular2/angular2");

global.Component = angular2.Component;
global.Template = angular2.Template;
global.bootstrap = angular2.bootstrap; 

// Set the start module for the application
application.mainModule = "app/main-page";

// Start the application
application.start();
