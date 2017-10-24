console.log("Loading inspector modules...");
require("./globals/decorators");
require("./debugger/webinspector-network");
require("./debugger/webinspector-dom");
require("./debugger/webinspector-css");
console.log("Finished loading inspector modules.");
