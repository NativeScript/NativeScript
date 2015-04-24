// <snippet module="text/formatted-string" title="Formatted String">
// # Formatted String
// Using a formatted string requires loading formatted-string and span module.
// ``` JavaScript
import formattedStringModule = require("text/formatted-string");
import spanModule = require("text/span");
// ```
// </snippet>

import observable = require("data/observable");
import TKUnit = require("../TKUnit");
import LabelModule = require("ui/label");

export var test_FormattedString_RemovesEventListeners_for_spans = function () {
    // <snippet module="text/formatted-string" title="Formatted String">
    // ### How to set formatted text content for a label
    // ``` JavaScript
    var label = new LabelModule.Label();
    var formattedString = new formattedStringModule.FormattedString();
    var firstSpan = new spanModule.Span();

    firstSpan.fontSize = 15;
    firstSpan.text = "LoremIpsum";
    formattedString.spans.push(firstSpan);
    label.formattedText = formattedString;
    // ```
    // </snippet>

    TKUnit.assert(formattedString.spans.getItem(0).hasListeners(observable.Observable.propertyChangeEvent) === true, "Listener for spans collection change event is not attached!");
    var removedSpan = formattedString.spans.pop();
    TKUnit.assert(removedSpan.hasListeners(observable.Observable.propertyChangeEvent) === false, "Listener for spans collection change event is not removed!");
}

export var test_FormattedTextProperty_IsChanged_When_SpanIsAdded = function () {
    var formattedString = new formattedStringModule.FormattedString();
    var formattedTextChanged = false;
    formattedString.addEventListener(observable.Observable.propertyChangeEvent, () => {
        formattedTextChanged = true;
    });

    var firstSpan = new spanModule.Span();
    firstSpan.fontSize = 15;
    firstSpan.text = "LoremIpsum";
    formattedString.spans.push(firstSpan);

    TKUnit.assert(formattedTextChanged === true, "FormattedText property is not changed.");
}

export var test_FormattedTextProperty_IsChanged_When_SpanIsChanged = function () {
    var formattedString = new formattedStringModule.FormattedString();
    var expectedValue = 17;

    var firstSpan = new spanModule.Span();
    firstSpan.fontSize = 15;
    firstSpan.text = "LoremIpsum";
    formattedString.spans.push(firstSpan);

    var formattedTextChanged = false;
    formattedString.addEventListener(observable.Observable.propertyChangeEvent, () => {
        formattedTextChanged = true;
    });

    firstSpan.beginEdit();
    firstSpan.fontSize = expectedValue;
    firstSpan.endEdit();

    TKUnit.assert(formattedTextChanged === true, "FormattedText property is not changed.");
    TKUnit.assert(formattedString.spans.getItem(0).fontSize === expectedValue, "FormattedString internal span is not changed as expected");
}