import application = require("application");
import observable = require("data/observable");
import pageModule = require("ui/page");

var vm = new observable.Observable();
function orientationChanged(data) {
    console.log("Orientation changed: " + data.newValue);
    vm.set("orientation", data.newValue);
}
export function onPageLoaded(args: observable.EventData) {
    var page = <pageModule.Page>args.object;
    application.on(application.orientationChangedEvent, orientationChanged, page);

    page.bindingContext = vm;
    vm.set("orientation", "not changed");
}

export function onPageUnloaded(args: observable.EventData) {
    var page = <pageModule.Page>args.object;
    <any>application.off(application.orientationChangedEvent, orientationChanged, page);
}
