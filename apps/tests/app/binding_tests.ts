import pageModule = require("ui/page");
//import stackLayoutModule = require("ui/layouts/stack-layout");
//import textFieldModule = require("ui/text-field");
import observableModule = require("data/observable");
import bindableModule = require("ui/core/bindable");
//import enums = require("ui/enums");
import trace = require("trace");
trace.setCategories(trace.categories.Test);
trace.enable();

export function pageLoaded(args: observableModule.EventData) {
    var page: pageModule.Page = <pageModule.Page>args.object;
    var model = new observableModule.Observable();
    //var model = page.bindingContext;
    model.set("paramProperty", "%%%");
    var toUpperConverter: bindableModule.ValueConverter = {
        toModel: function (value, param1) {
            return param1 + value.toLowerCase();
        },
        toView: function (value, param1) {
            return value.toUpperCase();
        }
    };
    model.set("toUpper", toUpperConverter);
    model.set("testProperty", "Alabala");

    page.bindingContext = model;
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