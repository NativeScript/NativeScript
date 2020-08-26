const loadCss = require("./load-application-css");

module.exports = function() {
    loadCss(function() {
        const appCssContext = require.context("~/", false, /^\.\/app\.(css|scss|less|sass)$/);
        global.registerWebpackModules(appCssContext);
    });
}
