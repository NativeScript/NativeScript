// >> xml-module-snippet
//var xmlModule = require("@nativescript/core/xml");
// << xml-module-snippet

import * as TKUnit from '../tk-unit';
import * as xmlModule from '@nativescript/core/xml';
import * as fs from '@nativescript/core/file-system';
import { Builder } from '@nativescript/core/ui/builder';
import { isIOS, Device } from '@nativescript/core/platform';
import lazy from '@nativescript/core/utils/lazy';

const sdkVersion = lazy(() => parseInt(Device.sdkVersion));

export var test_XmlParser_IsDefined = function () {
	TKUnit.assertNotEqual(xmlModule.XmlParser, undefined, 'Class XmlParser should be defined!');
};

export var test_ParserEventType_IsDefined = function () {
	TKUnit.assertNotEqual(xmlModule.ParserEventType, undefined, 'Class ParserEventType should be defined!');
};

export var test_XmlParser_ElementsWithoutAttributesDoNotReportThem = function () {
	var attributes;
	var xmlParser = new xmlModule.XmlParser(function (event: xmlModule.ParserEvent) {
		switch (event.eventType) {
			case xmlModule.ParserEventType.StartElement:
				attributes = event.attributes;
				break;
		}
	});
	xmlParser.parse('<element/>');
	TKUnit.assertEqual(attributes, undefined, 'Expected result: undefined; Actual result: ' + attributes + ';');
};

export var test_XmlParser_EntityReferencesAreDecoded = function () {
	var data;
	var xmlParser = new xmlModule.XmlParser(function (event: xmlModule.ParserEvent) {
		switch (event.eventType) {
			case xmlModule.ParserEventType.Text:
				data = event.data;
				break;
		}
	});
	xmlParser.parse('<element>&lt;&gt;&quot;&amp;&apos;</element>');
	TKUnit.assert(data === '<>"&\'', 'Expected result: <>"&\'; Actual result: ' + data + ';');
};

export var test_XmlParser_EntityReferencesInAttributeValuesAreDecoded = function () {
	var data;
	var xmlParser = new xmlModule.XmlParser(function (event: xmlModule.ParserEvent) {
		switch (event.eventType) {
			case xmlModule.ParserEventType.StartElement:
				data = event.attributes['text'];
				break;
		}
	});
	xmlParser.parse('<Label text="&lt;&gt;&quot;&amp;&apos;"/>');
	TKUnit.assert(data === '<>"&\'', 'Expected result: <>"&\'; Actual result: ' + data + ';');
};

export var test_XmlParser_UnicodeEntitiesAreDecoded = function () {
	var data;
	var xmlParser = new xmlModule.XmlParser(function (event: xmlModule.ParserEvent) {
		switch (event.eventType) {
			case xmlModule.ParserEventType.Text:
				data = event.data;
				break;
		}
	});
	xmlParser.parse('<element>&#x1f923;&#x2713;</element>');
	TKUnit.assert(data === '\uD83E\uDD23\u2713', 'Expected result: \uD83E\uDD23\u2713; Actual result: ' + data + ';');
};

export var test_XmlParser_UnicodeEntitiesInAttributeValuesAreDecoded = function () {
	var data;
	var xmlParser = new xmlModule.XmlParser(function (event: xmlModule.ParserEvent) {
		switch (event.eventType) {
			case xmlModule.ParserEventType.StartElement:
				data = event.attributes['text'];
				break;
		}
	});
	xmlParser.parse('<Label text="&#x1f923;&#x2713;"/>');
	TKUnit.assert(data === '\uD83E\uDD23\u2713', 'Expected result: \uD83E\uDD23\u2713; Actual result: ' + data + ';');
};

export var test_XmlParser_OnErrorIsCalledWhenAnErrorOccurs = function () {
	var e;
	var xmlParser = new xmlModule.XmlParser(
		function (event: xmlModule.ParserEvent) {
			//test_XmlParser_OnErrorIsCalledWhenAnErrorOccurs
		},
		function (error: Error) {
			e = error;
		}
	);
	xmlParser.parse('<element></otherElement>');
	TKUnit.assert(e !== undefined, 'Expected result: error; Actual result: ' + e + ';');
};

export var test_XmlParser_IntegrationTest = function () {
	if (isIOS && sdkVersion() < 10) {
		return;
	}

	var actualResult = '';
	var xmlParser = new xmlModule.XmlParser(function (event: xmlModule.ParserEvent) {
		if (event.eventType === xmlModule.ParserEventType.Text && event.data.trim() === '') {
			// Ignore ignorable whitespace.
			return;
		}

		actualResult += event.toString();
	});

	var file = fs.File.fromPath(fs.path.join(__dirname, 'xml.xml'));
	var xmlString = file.readTextSync();
	xmlString = xmlString.replace(/(\r\n|\n|\r)/gm, '\n');
	xmlParser.parse(xmlString);

	var expectedResult: string;
	file = fs.File.fromPath(fs.path.join(__dirname, 'xml.expected'));
	expectedResult = file.readTextSync();

	var i;
	var maxLength = Math.max(actualResult.length, expectedResult.length);
	for (i = 0; i < maxLength; i++) {
		var actualChar;
		var actualCharCode;
		if (i <= actualResult.length) {
			actualChar = actualResult.charAt(i);
			actualCharCode = actualResult.charCodeAt(i);
		} else {
			actualChar = 'undefined';
			actualCharCode = 'undefined';
		}

		var expectedChar;
		var expectedCharCode;
		if (i <= expectedResult.length) {
			expectedChar = expectedResult.charAt(i);
			expectedCharCode = expectedResult.charCodeAt(i);
		} else {
			expectedChar = 'undefined';
			expectedCharCode = 'undefined';
		}

		TKUnit.assert(actualCharCode === expectedCharCode, 'At index ' + i + ': Actual character is ' + actualChar + '[' + actualCharCode + ']; Expected character is: ' + expectedChar + '[' + expectedCharCode + ']');
	}
};

export var test_XmlParser_DummyDocumentationTest = function () {
	// >> xml-parser-snippet
	var onEventCallback = function (event: xmlModule.ParserEvent) {
		switch (event.eventType) {
			case xmlModule.ParserEventType.StartElement:
				var message = event.eventType + ' ' + event.elementName;
				if (event.attributes) {
					message += ', Attributes:';
					for (var attributeName in event.attributes) {
						if (event.attributes.hasOwnProperty(attributeName)) {
							message += ' ' + attributeName + '="' + event.attributes[attributeName] + '"';
						}
					}
				}
				//console.log(message);
				break;

			case xmlModule.ParserEventType.EndElement:
				//console.log(event.eventType + " " + event.elementName);
				break;

			case xmlModule.ParserEventType.Text:
				var significantText = event.data.trim();
				if (significantText !== '') {
					//console.log(event.eventType + "=\"" + significantText + "\"");
				}
				break;
		}
	};

	var onErrorCallback = function (error: Error) {
		console.log('Error: ' + error.message);
	};

	var xmlParser = new xmlModule.XmlParser(onEventCallback, onErrorCallback);
	xmlParser.parse('<Document><First attr1="attribute1" attr2="attribute2">I am first</First><Second>I am second</Second></Document>');
	//// Calling parse will produce the following console output:
	//// StartElement Document
	//// StartElement First, Attributes: attr1 = "attribute1" attr2 = "attribute2"
	//// Text = "I am first"
	//// EndElement First
	//// StartElement Second
	//// Text = "I am second"
	//// EndElement Second
	//// EndElement Document
	// << xml-parser-snippet
};

export var test_XmlParser_NamespacesTest = function () {
	if (isIOS && sdkVersion() < 10) {
		return;
	}

	var xmlParser = new xmlModule.XmlParser(
		function (event: xmlModule.ParserEvent) {
			if (event.eventType !== xmlModule.ParserEventType.StartElement) {
				return;
			}

			var expectedResult = event.attributes['expected-namespace'];
			var actualResult = event.namespace;
			TKUnit.assert(actualResult === expectedResult, 'Actual: ' + actualResult + '; Expected: ' + expectedResult);
		},
		undefined,
		true
	);

	var file = fs.File.fromPath(fs.path.join(__dirname, 'xml-with-namespaces.xml'));
	var xmlString = file.readTextSync();
	xmlParser.parse(xmlString);
};

export function test_MultiParserTemplate() {
	const xml = global.loadModule('xml-parser-tests/itemTemplates.xml', true);

	const view: any = Builder.parse(xml);
	TKUnit.assertNotNull(view.items);
	TKUnit.assertEqual(view.items.length, 1);
}
