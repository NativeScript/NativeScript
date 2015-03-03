import btns = require("ui/button");
import pages = require("ui/page");
import stacks = require("ui/layouts/stack-layout");
import scroll = require("ui/scroll-view");
import textView = require("ui/text-view");
import labels = require("ui/label");
import trace = require("trace");
import gridModule = require("ui/layouts/grid-layout");
import sliders = require("ui/slider");
import switches = require("ui/switch");
import bindable = require("ui/core/bindable");

trace.enable();
//trace.setCategories(trace.categories.Style + " ," + trace.categories.Binding);
trace.setCategories(trace.categories.Binding);

interface NumericProeprtyDescriptor {
    name: string;
    value: number;
    min: number;
    max: number;
}

interface BoolPropertyDescriptor {
    name: string;
    value: boolean;
}

interface StringPropertyDescriptor {
    name: string;
    value: string;
}

export function createPage() {
    var page = new pages.Page();
    var grid = new gridModule.GridLayout();
    grid.addRow(new gridModule.ItemSpec());
    grid.addRow(new gridModule.ItemSpec());
    page.content = grid;

    var count = 0;
    var control = new btns.Button();
    control.text = "test control";
    control.on(btns.knownEvents.tap, (data) => { control.text = "count: " + count++; });
    grid.addChild(control);

    var scrollView = new scroll.ScrollView();
    gridModule.GridLayout.setRow(scrollView, 1);
    grid.addChild(scrollView);
    var stack = new stacks.StackLayout();
    scrollView.content = stack;

    function createNumericPropertyUI(desc: NumericProeprtyDescriptor) {
        var lbl = new labels.Label();
        lbl.text = desc.name;
        lbl.horizontalAlignment = "left";
        stack.addChild(lbl);

        var slider = new sliders.Slider();
        slider.minValue = desc.min;
        slider.maxValue = desc.max;
        slider.value = desc.value;
        stack.addChild(slider);

        var options: bindable.BindingOptions = {
            sourceProperty: "value",
            targetProperty: desc.name,
        };
        control.bind(options, slider);
    };

    function createBooleanPropertyUI(desc: BoolPropertyDescriptor) {
        var lbl = new labels.Label();
        lbl.text = desc.name;
        lbl.horizontalAlignment = "left";
        stack.addChild(lbl);

        var sw = new switches.Switch();
        sw.checked = desc.value;
        sw.horizontalAlignment = "left";
        stack.addChild(sw);

        var options: bindable.BindingOptions = {
            sourceProperty: "checked",
            targetProperty: desc.name,
        };
        control.bind(options, sw);
    };

    function createStringPropertyUI(desc: StringPropertyDescriptor) {
        var lbl = new labels.Label();
        lbl.text = desc.name;
        lbl.horizontalAlignment = "left";
        stack.addChild(lbl);

        var txt = new textView.TextView();
        txt.text = desc.value;
        stack.addChild(txt);

        var options: bindable.BindingOptions = {
            sourceProperty: "text",
            targetProperty: desc.name,
        };
        control.bind(options, txt);
    };

    createNumericPropertyUI({ name: "style.minWidth", value: 30, min: 10, max: 300 });
    createNumericPropertyUI({ name: "style.width", value: 100, min: 10, max: 300 });

    createNumericPropertyUI({ name: "style.minHeight", value: 30, min: 10, max: 300 });
    createNumericPropertyUI({ name: "style.height", value: 100, min: 10, max: 300 });

    createBooleanPropertyUI({ name: "isEnabled", value: true });
    createNumericPropertyUI({ name: "style.opacity", value: 1, min: 0, max: 1 });
    createStringPropertyUI({ name: "style.visibility", value: "visible" });

    createStringPropertyUI({ name: "style.horizontalAlignment", value: "stretch" });
    createStringPropertyUI({ name: "style.verticalAlignment", value: "stretch" });
    createStringPropertyUI({ name: "margin", value: "20" });

    createStringPropertyUI({ name: "cssClass", value: "testClass" });

    page.css = ".testClass { background-color: LightGreen }";
    return page;
}
//export var Page = page;
