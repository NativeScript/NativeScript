console.log("Loading inspector modules...");
require("./globals/decorators");
require("./debugger/webinspector/webinspector-network");
require("./debugger/webinspector/webinspector-dom");
require("./debugger/webinspector/webinspector-css");
console.log("Finished loading inspector modules.");
