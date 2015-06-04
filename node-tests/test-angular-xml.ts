import {assert} from "chai";
import xml = require('xml');

describe("angular xml parser", () => {
    let last_element = null;
    let last_attrs = null;
    let parser = null;

    beforeEach(() => {
        parser = new xml.XmlParser(function (event: xml.ParserEvent) {
            switch (event.eventType) {
                case xml.ParserEventType.StartElement:
                    last_element = event.elementName;
                    last_attrs = event.attributes;
                    break;
            }
        });
    });

    it("parses [property] binding", () => {
        parser.parse("<TextField [text]='somevar' />");

        assert.equal('TextField', last_element);
        assert.equal(last_attrs['[text]'], 'somevar');
    });

    it("parses (event) binding", () => {
        parser.parse("<TextField (tap)='onTap(blah)' />");

        assert.equal('TextField', last_element);
        assert.equal(last_attrs['(tap)'], 'onTap(blah)');
    });

    it("parsers (^event) binding", () => {
        parser.parse("<TextField (^tap)='onTap(blah)' />");

        assert.equal('TextField', last_element);
        assert.equal(last_attrs['(^tap)'], 'onTap(blah)');
    });
});
