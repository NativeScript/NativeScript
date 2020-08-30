// >> formatted-string-require
import { FormattedString } from '@nativescript/core/text/formatted-string';
import { Span } from '@nativescript/core/text/span';
// << formatted-string-require

import { Observable } from '@nativescript/core/data/observable';
import { Label } from '@nativescript/core/ui/label';
import * as TKUnit from '../tk-unit';

export function test_FormattedString_RemovesEventListeners_for_spans() {
	// >> formatted-string-set
	const label = new Label();
	const formattedString = new FormattedString();
	const firstSpan = new Span();

	firstSpan.fontSize = 15;
	firstSpan.text = 'LoremIpsum';
	formattedString.spans.push(firstSpan);
	label.formattedText = formattedString;
	// << formatted-string-set

	TKUnit.assert(formattedString.spans.getItem(0).hasListeners(Observable.propertyChangeEvent) === true, 'Listener for spans collection change event is not attached!');
	const removedSpan = formattedString.spans.pop();
	TKUnit.assert(removedSpan.hasListeners(Observable.propertyChangeEvent) === false, 'Listener for spans collection change event is not removed!');
}

export function test_FormattedTextProperty_IsChanged_When_SpanIsAdded() {
	const formattedString = new FormattedString();
	let formattedTextChanged = false;
	formattedString.addEventListener(Observable.propertyChangeEvent, () => {
		formattedTextChanged = true;
	});

	const firstSpan = new Span();
	firstSpan.fontSize = 15;
	firstSpan.text = 'LoremIpsum';
	formattedString.spans.push(firstSpan);

	TKUnit.assertTrue(formattedTextChanged, 'FormattedText property is not changed.');
}

export function test_FormattedTextProperty_IsChanged_When_SpanIsChanged() {
	const formattedString = new FormattedString();
	const expectedValue = 17;

	const firstSpan = new Span();
	firstSpan.fontSize = 15;
	firstSpan.text = 'LoremIpsum';
	formattedString.spans.push(firstSpan);

	let formattedTextChanged = false;
	formattedString.addEventListener(Observable.propertyChangeEvent, () => {
		formattedTextChanged = true;
	});

	firstSpan.fontSize = expectedValue;

	TKUnit.assertTrue(formattedTextChanged, 'FormattedText property is not changed.');
	TKUnit.assert(formattedString.spans.getItem(0).fontSize === expectedValue, 'FormattedString internal span is not changed as expected');
}

export function test_FormattedTextProperty_DoNotCrash_When_KnownColorIsSetForForegroundColor() {
	const formattedString = new FormattedString();
	const expectedValue1 = 'red';
	const expectedValue2 = 'blue';

	const firstSpan = new Span();
	firstSpan.color = <any>expectedValue1;
	firstSpan.text = 'LoremIpsum1';
	formattedString.spans.push(firstSpan);

	const secondSpan = new Span();
	secondSpan.backgroundColor = <any>expectedValue2;
	secondSpan.text = 'LoremIpsum2';
	formattedString.spans.push(secondSpan);

	TKUnit.assertEqual(formattedString.spans.getItem(0).color.name, expectedValue1);
	TKUnit.assertEqual(formattedString.spans.getItem(1).backgroundColor.name, expectedValue2);
}
