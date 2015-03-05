import pageModule = require("ui/page");
//import stackLayoutModule = require("ui/layouts/stack-layout");
//import textFieldModule = require("ui/text-field");
import buttonModule = require("ui/button");
import observableModule = require("data/observable");
import observableArray = require("data/observable-array");
import bindableModule = require("ui/core/bindable");
//import enums = require("ui/enums");
import trace = require("trace");
trace.setCategories(trace.categories.Test + "," + trace.categories.Binding);
trace.enable();

export function pageLoaded(args: observableModule.EventData) {
    var page: pageModule.Page = <pageModule.Page>args.object;
    var model = new observableModule.Observable();
    var tasks = new observableArray.ObservableArray();
    //tasks.push("tralala");
    //var model = page.bindingContext;
    model.set("tasks", tasks);
    model.set("paramProperty", "%%%");
    var toUpperConverter: bindableModule.ValueConverter = {
        toModel: function (value, param1) {
            return param1 + value.toLowerCase();
        },
        toView: function (value, param1) {
            if (value === 0) {
                return "no items";
            }
            return value + " items";
        }
    };
    model.set("toUpper", toUpperConverter);
    model.set("testProperty", "Alabala");

    page.bindingContext = model;
}

export function onTap(args: observableModule.EventData) {
    var button: buttonModule.Button = <buttonModule.Button>args.object;
    trace.write("tasks: " + button.bindingContext.get("tasks"), trace.categories.Test, trace.messageType.info);
    button.bindingContext.get("tasks").push("alabala");
}

//export function createPage() {
//    var stackLayout = new stackLayoutModule.StackLayout();
//    var firstTextField = new textFieldModule.TextField();
//    firstTextField.updateTextTrigger = enums.UpdateTextTrigger.textChanged;
//    var secondTextField = new textFieldModule.TextField();
//    secondTextField.updateTextTrigger = enums.UpdateTextTrigger.textChanged;

//    var model = new observableModule.Observable();

//    var bindOptions: bindableModule.BindingOptions = {
//        sourceProperty: "testProperty",
//        targetProperty: "text",
//        twoWay: true,
//        expression: "testProperty | toUpper('$$$')"
//    };

//    firstTextField.bind(bindOptions, model);
//    secondTextField.bind({
//        sourceProperty: "testProperty",
//        targetProperty: "text",
//        twoWay: true
//    }, model);

//    stackLayout.addChild(firstTextField);
//    stackLayout.addChild(secondTextField);

//    var page = new pageModule.Page();
//    page.on("loaded", pageLoaded);
//    page.content = stackLayout;
//    page.bindingContext = model;
//    return page;
//}