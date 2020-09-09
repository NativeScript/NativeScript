const loadCss = require("./load-application-css");

module.exports = function() {
    loadCss(function() {
        global.registerModule("./app.css", () => require("~/app"));
        global.registerModule("app.css", () => require("~/app"));
    });
}
