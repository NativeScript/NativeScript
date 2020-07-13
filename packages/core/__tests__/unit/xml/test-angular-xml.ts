import { assert } from 'chai';
import { XmlParser, ParserEventType } from '@nativescript/core/xml';

describe('angular xml parser', () => {
	let last_element = null;
	let last_attrs = null;
	let parser = null;

	beforeEach(() => {
		parser = new XmlParser(function (event) {
			switch (event.eventType) {
				case ParserEventType.StartElement:
					last_element = event.elementName;
					last_attrs = event.attributes;
					break;
			}
		});
		parser.angularSyntax = true;
	});

	it('parses [property] binding', () => {
		parser.parse("<TextField [text]='somevar' />");

		assert.equal('TextField', last_element);
		assert.equal(last_attrs['[text]'], 'somevar');
	});

	it('parses (event) binding', () => {
		parser.parse("<TextField (tap)='onTap(blah)' />");

		assert.equal('TextField', last_element);
		assert.equal(last_attrs['(tap)'], 'onTap(blah)');
	});

	it('parses (^event) binding', () => {
		parser.parse("<TextField (^tap)='onTap(blah)' />");

		assert.equal('TextField', last_element);
		assert.equal(last_attrs['(^tap)'], 'onTap(blah)');
	});

	it('parses #id attribute', () => {
		parser.parse('<TextField #firstName />');

		assert.equal('TextField', last_element);
		assert.equal(last_attrs['#firstName'], '');
	});

	it('parses #id attribute followed by another', () => {
		parser.parse("<TextField #firstName text='Name' />");

		assert.equal('TextField', last_element);
		assert.equal(last_attrs['#firstName'], '');
		assert.equal(last_attrs['text'], 'Name');
	});

	it('detects equals without value', () => {
		parser.parse('<TextField brokenTag= />');

		assert.isFalse(last_attrs);
	});

	it('detects no equals with quoted value', () => {
		parser.parse("<TextField noEquals 'value' />");

		assert.isFalse(last_attrs);
	});

	it('detects unclosed tag after no value attribute', () => {
		parser.parse('<TextField #myId');

		assert.isFalse(last_attrs);
	});

	it('rejects angular properties if syntax disabled', () => {
		parser.angularSyntax = false;
		parser.parse("<TextField [text]='somevalue' />");

		assert.isFalse(last_attrs);
	});
});
