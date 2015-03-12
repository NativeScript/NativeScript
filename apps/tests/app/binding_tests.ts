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

    var dateConverter = {
        toView: function (value, format) {
            var result = format;
            var day = value.getDate();
            result = result.replace("dd", month < 10 ? "0" + day : day);
            var month = value.getMonth() + 1;
            result = result.replace("mm", month < 10 ? "0" + month : month);
            result = result.replace("yyyy", value.getFullYear());
            return result;
        },
        toModel: function (value, format) {
            var ddIndex = format.indexOf("dd");
            var day = parseInt(value.substr(ddIndex, 2));
            var mmIndex = format.indexOf("mm");
            var month = parseInt(value.substr(mmIndex, 2));
            var yyyyIndex = format.indexOf("yyyy");
            var year = parseInt(value.substr(yyyyIndex, 4));
            var result = new Date(year, month - 1, day);
            return result;
        }
    }

    model.set("dateConverter", dateConverter);
    model.set("testDate", new Date());

    page.bindingContext = model;
}

export function onTap(args: observableModule.EventData) {
    var button: buttonModule.Button = <buttonModule.Button>args.object;
    trace.write("tasks: " + button.bindingContext.get("testDate"), trace.categories.Test, trace.messageType.info);
    //button.bindingContext.get("tasks").push("alabala");
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