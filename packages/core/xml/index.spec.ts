import { XmlParser, ParserEventType } from '.';

describe('XmlParser', () => {
	// Flavors:
	describe('Vanilla', () => {
		let last_element = null;
		let last_attrs = null;
		let last_data = null;
		let parser = null;
		beforeEach(() => {
			parser = new XmlParser(function (event) {
				switch (event.eventType) {
					case ParserEventType.StartElement:
						last_element = event.elementName;
						last_attrs = event.attributes;
						break;
					case ParserEventType.Text:
						last_data = event.data;
						break;
				}
			});
		});

		it('handles whitespace around attribute =', () => {
			parser.parse("<TextField text = \n 'hello' />");

			expect(last_element).toBe('TextField');
			expect(last_attrs['text']).toBe('hello');
		});

		it('resolves entities', () => {
			parser.parse('<element>&lt;&gt;&quot;&amp;&apos;</element>');
			expect(last_data).toBe('<>"&\'');
		});

		it('resolves greek letter entities in attributes', () => {
			parser.parse("<element text='&Omega;'>blah</element>");
			expect(last_attrs.text).toBe('Ω');
		});

		it('resolves entities in element text', () => {
			parser.parse('<element>&Omega;</element>');
			expect(last_data).toBe('Ω');
		});

		it('resolves <> inside quotes', () => {
			parser.parse('<element name=\'<&>\' blah="b<a&>"/>');
			expect(last_attrs.name).toBe('<&>');
			expect(last_attrs.blah).toBe('b<a&>');
		});
	});

	describe('Angular', () => {
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

			expect(last_element).toBe('TextField');
			expect(last_attrs['[text]']).toBe('somevar');
		});

		it('parses (event) binding', () => {
			parser.parse("<TextField (tap)='onTap(blah)' />");

			expect(last_element).toBe('TextField');
			expect(last_attrs['(tap)']).toBe('onTap(blah)');
		});

		it('parses (^event) binding', () => {
			parser.parse("<TextField (^tap)='onTap(blah)' />");

			expect(last_element).toBe('TextField');
			expect(last_attrs['(^tap)']).toBe('onTap(blah)');
		});

		it('parses #id attribute', () => {
			parser.parse('<TextField #firstName />');

			expect(last_element).toBe('TextField');
			expect(last_attrs['#firstName']).toBe('');
		});

		it('parses #id attribute followed by another', () => {
			parser.parse("<TextField #firstName text='Name' />");

			expect(last_element).toBe('TextField');
			expect(last_attrs['#firstName']).toBe('');
			expect(last_attrs['text']).toBe('Name');
		});

		it('detects equals without value', () => {
			parser.parse('<TextField brokenTag= />');

			expect(last_attrs).toBeFalsy();
		});

		it('detects no equals with quoted value', () => {
			parser.parse("<TextField noEquals 'value' />");

			expect(last_attrs).toBeFalsy();
		});

		it('detects unclosed tag after no value attribute', () => {
			parser.parse('<TextField #myId');

			expect(last_attrs).toBeFalsy();
		});

		it('rejects angular properties if syntax disabled', () => {
			parser.angularSyntax = false;
			parser.parse("<TextField [text]='somevalue' />");

			expect(last_attrs).toBeFalsy();
		});
	});
});
