var observableModule = require("data/observable");
var vm = new observableModule.Observable();
function onPageLoaded(args) {
    var page = args.object;
    vm.set("firstTitle", "fiiiirst");
    vm.set("secondTitle", "secondTitle");
    vm.set("secondIcon", "res://icon");
    page.bindingContext = vm;
}
exports.onPageLoaded = onPageLoaded;
var i = 0;
function onTap() {
    i++;
    vm.set("firstTitle", "changed " + i);
    if (i === 3) {
        vm.set("firstIcon", "res://ic_action");
    }
    if (i === 4) {
        vm.set("firstIcon", "");
    }
}
exports.onTap = onTap;
//# sourceMappingURL=tab-view.js.map