import {assert} from "chai";
import {XmlParser, ParserEvent, ParserEventType} from 'xml';
//import xml = require('xml');

describe("xml parser", () => {
    it("parses simple element", () => {
        let attributes = null;
        let element = null;

        var parser = new XmlParser(function (event: ParserEvent) {
            switch (event.eventType) {
                case ParserEventType.StartElement:
                    element = event.elementName;
                    attributes = event.attributes;
                    break;
            }
        });

        parser.parse("<TextField text='hello' />");

        assert.equal('TextField', element);
        assert.equal('hello', attributes['text']);
    });
});
