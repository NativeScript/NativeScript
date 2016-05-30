// >> formatted-string-require
import formattedStringModule = require("text/formatted-string");
import spanModule = require("text/span");
// << formatted-string-require

import observable = require("data/observable");
import TKUnit = require("../TKUnit");
import LabelModule = require("ui/label");

export var test_FormattedString_RemovesEventListeners_for_spans = function () {
    // >> formatted-string-set
    var label = new LabelModule.Label();
    var formattedString = new formattedStringModule.FormattedString();
    var firstSpan = new spanModule.Span();

    firstSpan.fontSize = 15;
    firstSpan.text = "LoremIpsum";
    formattedString.spans.push(firstSpan);
    label.formattedText = formattedString;
    // << formatted-string-set

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

export var test_FormattedTextProperty_DoNotCrash_When_KnownColorIsSetForForegroundColor = function () {
    var formattedString = new formattedStringModule.FormattedString();
    var expectedValue1 = "red";
    var expectedValue2 = "blue";

    var firstSpan = new spanModule.Span();
    firstSpan.foregroundColor = <any>expectedValue1;
    firstSpan.text = "LoremIpsum1";
    formattedString.spans.push(firstSpan);

    var secondSpan = new spanModule.Span();
    secondSpan.backgroundColor = <any>expectedValue2;
    secondSpan.text = "LoremIpsum2";
    formattedString.spans.push(secondSpan);

    TKUnit.assertEqual(formattedString.spans.getItem(0).foregroundColor.name, expectedValue1);
    TKUnit.assertEqual(formattedString.spans.getItem(1).backgroundColor.name, expectedValue2);
}