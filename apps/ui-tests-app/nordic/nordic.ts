var vmModule = require("./main-view-model");
function pageLoaded(args) {
    var page = args.object;
    page.getViewById("label").text = "æøå";
}
exports.pageLoaded = pageLoaded;