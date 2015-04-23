import pages = require("ui/page");
import bm = require("ui/button");
import xml = require("xml");
import fs = require("file-system");

export function createPage() {
    var logOutput = true;
    var loopCount = logOutput ? 1 : 1000;

    var parserEventCallback = function (event: xml.ParserEvent) {
        if (logOutput) {
            console.log(event.toString());
        }
    };

    var errorCallback = function (error) {
        console.log(error.message);
    };

    var button = new bm.Button();
    button.on(bm.Button.tapEvent, function () {
        fs.File.fromPath(__dirname + "/xml.xml").readText().then(input => {
            // I am a change made in master.
            console.log("EasySax JavaScript XmlParser (without namespace processing) running...");
            console.time("EasySax JavaScript XmlParser (without namespace processing)");

            var xmlParser = new xml.XmlParser(parserEventCallback, errorCallback, true);
            for (var i = 0; i < loopCount; i++) {
                xmlParser.parse(input);
            }
            console.timeEnd("EasySax JavaScript XmlParser (without namespace processing)");
        }, function (e) { console.log(e); });
    });

    button.text = "Parse XML";
    var page = new pages.Page();
    page.content = button;
    return page;
}
//export var Page = page;
