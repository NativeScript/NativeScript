import { backgroundColorProperty, backgroundProperty } from "tns-core-modules/ui/styling/style-properties";
import { ViewBase } from "tns-core-modules/ui/core/view-base/view-base";
import { assert } from "chai";

import {
    parseURL,
    parseColor,
    parsePercentageOrLength,
    parseBackgroundPosition,
    parseBackground
} from "tns-core-modules/ui/styling/background-parser";

class CustomView extends ViewBase {
}

describe("ui", () => {
    describe("styling", () => {
        describe("properties", () => {
            describe("background", () => {
                it("can be set to color, and sets the color property", () => {
                    var view = new CustomView();
                    view.style.background = "#996633";
                    assert.equal(view.style.backgroundColor.toString(), "#996633");
                });
            });
        });
    });
    describe("parse", () => {
        function test<T>(parse: (value: string, lastIndex?: number) => T, value: string, expected: T);
        function test<T>(parse: (value: string, lastIndex?: number) => T, value: string, lastIndex: number, expected: T);
        function test<T>(parse: (value: string, lastIndex?: number) => T, value: string, lastIndexOrExpected: number | T, expected?: T) {
            if (arguments.length === 3) {
                it(`${lastIndexOrExpected ? "can parse " : "can not parse "}"${value}"`, () => {
                    const result = parse(value);
                    assert.deepEqual(result, lastIndexOrExpected);
                });
            } else {
                it(`${expected ? "can parse " : "can not parse "}"${value}" starting at index ${lastIndexOrExpected}`, () => {
                    const result = parse(value, <number>lastIndexOrExpected);
                    assert.deepEqual(result, expected);
                });
            }
        }

        describe("url", () => {
            test(parseURL, "url('smiley.gif')  ", { start: 0, end: 19, value: "smiley.gif" });
            test(parseURL, '  url("frown.gif") ', { start: 0, end: 19, value: "frown.gif" });
            test(parseURL, "  url(lucky.gif)", { start: 0, end: 16, value: "lucky.gif" });
            test(parseURL, "url(lucky.gif) #FF0000", 15, null);
            test(parseURL, "repeat url(lucky.gif) #FF0000", 6, { start: 6, end: 22, value: "lucky.gif" });
        });

        describe("color", () => {
            test(parseColor, "  #369 ", { start: 0, end: 7, value: 0xFF336699 });
            test(parseColor, "  #456789 ", { start: 0, end: 10, value: 0xFF456789 });
            test(parseColor, "  #85456789 ", { start: 0, end: 12, value: 0x85456789 });
            test(parseColor, "  rgb(255, 8, 128) ", { start: 0, end: 18, value: 0xFFFF0880 });
            test(parseColor, "  rgba(255, 8, 128, 0.5) ", { start: 0, end: 24, value: 0x80FF0880 });
            test(parseColor, "#FF0000 url(lucky.gif)", 8, null);
            test(parseColor, "url(lucky.gif) #FF0000 repeat", 15, { start: 15, end: 23, value: 0xFFFF0000 });
        });

        describe("units", () => {
            test(parsePercentageOrLength, " 100% ", { start: 0, end: 6, value: { value: 1, unit: "%" }});
            test(parsePercentageOrLength, " 100px ", { start: 0, end: 7, value: { value: 100, unit: "px" }});
            test(parsePercentageOrLength, " 0.5px ", { start: 0, end: 7, value: { value: 0.5, unit: "px" }});
            test(parsePercentageOrLength, " 100dip ", { start: 0, end: 8, value: { value: 100, unit: "dip" }});
            test(parsePercentageOrLength, " 100 ", { start: 0, end: 5, value: { value: 100, unit: "dip" }});
            test(parsePercentageOrLength, " 100 ", { start: 0, end: 5, value: { value: 100, unit: "dip" }});
            test(parsePercentageOrLength, " +-12.2 ", null);
        });

        describe("position", () => {
            test(parseBackgroundPosition, "left", { start: 0, end: 4, value: { x: "left", y: "center" }});
            test(parseBackgroundPosition, "center", { start: 0, end: 6, value: { x: "center", y: "center" }});
            test(parseBackgroundPosition, "right", { start: 0, end: 5, value: { x: "right", y: "center" }});
            test(parseBackgroundPosition, "top", { start: 0, end: 3, value: { x: "center", y: "top" }});
            test(parseBackgroundPosition, "bottom", { start: 0, end: 6, value: { x: "center", y: "bottom" }});
            test(parseBackgroundPosition, "top 75px left 100px", { start: 0, end: 19, value: {
                x: { align: "left", offset: { value: 100, unit: "px" }},
                y: { align: "top", offset: { value: 75, unit: "px" }}
            }});
            test(parseBackgroundPosition, "left 100px top 75px", { start: 0, end: 19, value: {
                x: { align: "left", offset: { value: 100, unit: "px" }},
                y: { align: "top", offset: { value: 75, unit: "px" }}
            }});
            test(parseBackgroundPosition, "right center", { start: 0, end: 12, value: { x: "right", y: "center" }});
            test(parseBackgroundPosition, "center left 100%", { start: 0, end: 16, value: { x: { align: "left", offset: { value: 1, unit: "%" }}, y: "center" }});
            test(parseBackgroundPosition, "top 50% left 100%", { start: 0, end: 17, value: { x: { align: "left", offset: { value: 1, unit: "%" }}, y: { align: "top", offset: { value: 0.5, unit: "%" }}}});
            test(parseBackgroundPosition, "bottom left 25%", { start: 0, end: 15, value: { x: { align: "left", offset: { value: 0.25, unit: "%" }}, y: "bottom" }});
            test(parseBackgroundPosition, "top 100% left 25%", { start: 0, end: 17, value: { x: { align: "left", offset: { value: 0.25, unit: "%" }}, y: { align: "top", offset: { value: 1, unit: "%" }}}});
        });

        describe("background", () => {
            test(parseBackground, "   #996633  ", { start: 0, end: 12, value: { color: 0xFF996633 }});
            test(parseBackground, '  #00ff00 url("smiley.gif") repeat-y ', { start: 0, end: 37, value: { color: 0xFF00FF00, image: "smiley.gif", repeat: "repeat-y" }});
            test(parseBackground, '   url(smiley.gif)  no-repeat  top 50% left 100% #00ff00', { start: 0, end: 56, value: {
                color: 0xFF00FF00,
                image: "smiley.gif",
                repeat: "no-repeat",
                position: {
                    x: { align: "left", offset: { value: 1, unit: "%" }},
                    y: { align: "top", offset: { value: 0.5, unit: "%" }}
                }
            }});
            test(parseBackground, '   url(smiley.gif)  no-repeat  top 50% left 100% / 100px 100px #00ff00', { start: 0, end: 70, value: {
                color: 0xFF00FF00,
                image: "smiley.gif",
                repeat: "no-repeat",
                position: {
                    x: { align: "left", offset: { value: 1, unit: "%" }},
                    y: { align: "top", offset: { value: 0.5, unit: "%" }}
                },
                size: { x: { value: 100, unit: "px" }, y: { value: 100, unit: "px" }}
            }});
            test(parseBackground, '  linear-gradient(to right top) ', { start: 0, end: 32, value: {
                image: {
                    angle: Math.PI * 1/4,
                    colors: []
                }
            }});
            test(parseBackground, '  linear-gradient(45deg, #0000FF, #00FF00) ', { start: 0, end: 43, value: {
                image: {
                    angle: Math.PI * 1/4,
                    colors: [
                        { argb: 0xFF0000FF },
                        { argb: 0xFF00FF00 }
                    ]
                }
            }});
            test(parseBackground, 'linear-gradient(0deg, blue, green 40%, red)', { start: 0, end: 43, value: {
                image: {
                    angle: Math.PI * 0/4,
                    colors: [
                        { argb: 0xFF0000FF },
                        { argb: 0xFF008000, offset: { value: 0.4, unit: "%" }},
                        { argb: 0xFFFF0000 }
                    ]
                }
            }});
        });
    });
});
