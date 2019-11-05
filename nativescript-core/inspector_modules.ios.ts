console.log("Loading inspector modules...");
require("./globals/ts-helpers");
require("./debugger/webinspector-network");
require("./debugger/webinspector-dom");
require("./debugger/webinspector-css");
require("./debugger/webinspector-overlay");
console.log("Finished loading inspector modules.");
