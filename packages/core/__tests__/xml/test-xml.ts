import { assert } from 'chai';
const xml = require('@nativescript/core/xml');

describe('xml parser', () => {
	let last_element = null;
	let last_attrs = null;
	let last_data = null;
	let parser = null;

	beforeEach(() => {
		parser = new xml.XmlParser(function (event) {
			switch (event.eventType) {
				case xml.ParserEventType.StartElement:
					last_element = event.elementName;
					last_attrs = event.attributes;
					break;
				case xml.ParserEventType.Text:
					last_data = event.data;
					break;
			}
		});
	});

	it('handles whitespace around attribute =', () => {
		parser.parse("<TextField text = \n 'hello' />");

		assert.equal('TextField', last_element);
		assert.equal('hello', last_attrs['text']);
	});

	it('resolves entities', () => {
		parser.parse('<element>&lt;&gt;&quot;&amp;&apos;</element>');
		assert.equal('<>"&\'', last_data);
	});

	it('resolves greek letter entities in attributes', () => {
		parser.parse("<element text='&Omega;'>blah</element>");
		assert.equal('Ω', last_attrs.text);
	});

	it('resolves entities in element text', () => {
		parser.parse('<element>&Omega;</element>');
		assert.equal('Ω', last_data);
	});

	it('resolves <> inside quotes', () => {
		parser.parse('<element name=\'<&>\' blah="b<a&>"/>');
		assert.equal('<&>', last_attrs.name);
		assert.equal('b<a&>', last_attrs.blah);
	});
});
