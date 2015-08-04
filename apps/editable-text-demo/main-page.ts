import observableModule = require("data/observable");
import pagesModule = require("ui/page");
import textFieldModule = require("ui/text-field");
import textViewModule = require("ui/text-view");
import buttonModule = require("ui/button");
import labelModule = require("ui/label");
import model = require("./model");
import colorModule = require("color");
import stackLayoutModule = require("ui/layouts/stack-layout");
import enums = require("ui/enums");

var stackLayout: stackLayoutModule.StackLayout;
var textField: textFieldModule.TextField;
var textView: textViewModule.TextView;
var button: buttonModule.Button;
var label: labelModule.Label;

export function onPageLoaded(args: observableModule.EventData) {
    var page = <pagesModule.Page>args.object;

    //stackLayout = page.getViewById<stackLayoutModule.StackLayout>("stack");
    //button = page.getViewById<buttonModule.Button>("button");
    //label = page.getViewById<labelModule.Label>("label");

    //if (stackLayout.android) {
    //    stackLayout.android.setClickable(true);
    //    stackLayout.android.setFocusableInTouchMode(true);
    //}

    //textField = page.getViewById<textFieldModule.TextField>("textField");
    //textField.style.backgroundColor = new colorModule.Color("LightGray");

    //textView = page.getViewById<textViewModule.TextView>("textView");
    //textView.style.backgroundColor = new colorModule.Color("BlanchedAlmond");

    //var viewModel = new model.WebViewModel();
    //page.bindingContext = viewModel;
}

export function onTap(args: observableModule.EventData) {
    //if (textField.updateTextTrigger === enums.UpdateTextTrigger.focusLost) {
    //    textField.updateTextTrigger = enums.UpdateTextTrigger.textChanged;
    //    textView.updateTextTrigger = enums.UpdateTextTrigger.textChanged;
    //    button.text = "textChanged";
    //}
    //else {
    //    textField.updateTextTrigger = enums.UpdateTextTrigger.focusLost;
    //    textView.updateTextTrigger = enums.UpdateTextTrigger.focusLost;
    //    button.text = "focusLost";
    //}
}