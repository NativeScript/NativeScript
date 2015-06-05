import {assert} from "chai";
import xml = require('xml');

describe("xml parser", () => {
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

    it("handles whitespace around attribute =", () => {
        let attributes = null;
        let element = null;

        parser.parse("<TextField text = \n 'hello' />");

        assert.equal('TextField', last_element);
        assert.equal('hello', last_attrs['text']);
    });
});
