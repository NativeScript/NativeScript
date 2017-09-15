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
                it.skip("can be set to gradient, and sets the backgroundGradient property", () => {
                    var view = new CustomView();
                    view.style.background = "linear-gradient(red, yellow)";
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
            test(parseURL, "url('smiley.gif')  ", { url: "smiley.gif", lastIndex: 19 });
            test(parseURL, '  url("frown.gif") ', { url: "frown.gif", lastIndex: 19 });
            test(parseURL, "  url(lucky.gif)", { url: "lucky.gif", lastIndex: 16 });
            test(parseURL, "url(lucky.gif) #FF0000", 15, null);
            test(parseURL, "repeat url(lucky.gif) #FF0000", 6, { url: "lucky.gif", lastIndex: 22 });
        });

        describe("color", () => {
            test(parseColor, "  #369 ", { argb: 0xFF336699, lastIndex: 7 });
            test(parseColor, "  #456789 ", { argb: 0xFF456789, lastIndex: 10 });
            test(parseColor, "  #85456789 ", { argb: 0x85456789, lastIndex: 12 });
            test(parseColor, "  rgb(255, 8, 128) ", { argb: 0xFFFF0880, lastIndex: 18 });
            test(parseColor, "  rgba(255, 8, 128, 0.5) ", { argb: 0x80FF0880, lastIndex: 24 });
            test(parseColor, "#FF0000 url(lucky.gif)", 8, null);
            test(parseColor, "url(lucky.gif) #FF0000 repeat", 15, { argb: 0xFFFF0000, lastIndex: 23 });
        });

        describe("units", () => {
            test(parsePercentageOrLength, " 100% ", { value: 1, unit: "%", lastIndex: 6 });
            test(parsePercentageOrLength, " 100px ", { value: 100, unit: "px", lastIndex: 7 });
            test(parsePercentageOrLength, " 0.5px ", { value: 0.5, unit: "px", lastIndex: 7 });
            test(parsePercentageOrLength, " 100dip ", { value: 100, unit: "dip", lastIndex: 8 });
            test(parsePercentageOrLength, " 100 ", { value: 100, unit: "dip", lastIndex: 5 });
            test(parsePercentageOrLength, " 100 ", { value: 100, unit: "dip", lastIndex: 5 });
            test(parsePercentageOrLength, " +-12.2 ", null);
        });

        describe("position", () => {
            test(parseBackgroundPosition, "left", { x: "left", y: "center", lastIndex: 4 });
            test(parseBackgroundPosition, "center", { x: "center", y: "center", lastIndex: 6 });
            test(parseBackgroundPosition, "right", { x: "right", y: "center", lastIndex: 5 });
            test(parseBackgroundPosition, "top", { x: "center", y: "top", lastIndex: 3 });
            test(parseBackgroundPosition, "bottom", { x: "center", y: "bottom", lastIndex: 6 });
            test(parseBackgroundPosition, "top 75px left 100px", {
                x: { align: "left", offset: 100, unit: "px" },
                y: { align: "top", offset: 75, unit: "px" },
                lastIndex: 19
            });
            test(parseBackgroundPosition, "left 100px top 75px", {
                x: { align: "left", offset: 100, unit: "px" },
                y: { align: "top", offset: 75, unit: "px" },
                lastIndex: 19
            });
            test(parseBackgroundPosition, "right center", { x: "right", y: "center", lastIndex: 12 });
            // test(parseBackgroundPosition, "center left 100%");
            // test(parseBackgroundPosition, "top 50% left 100%");
            // test(parseBackgroundPosition, "bottom left 25%");
            // test(parseBackgroundPosition, "top 100% left 25%");
        });

        describe("background", () => {
            test(parseBackground, "   #996633  ", { color: 0xFF996633 });
            test(parseBackground, '  #00ff00 url("smiley.gif") repeat-y ', { color: 0xFF00FF00, image: "smiley.gif", repeat: { x: false, y: true } });
            test(parseBackground, '   url(smiley.gif)  no-repeat  top 50% left 100% #00ff00', {
                color: 0xFF00FF00,
                image: "smiley.gif",
                repeat: { x: false, y: false },
                position: {
                    x: { align: "left", offset: 1, unit: "%" },
                    y: { align: "top", offset: 0.5, unit: "%" }
                }
            });
            test(parseBackground, '  linear-gradient(to right, red , yellow) ', null);
            test(parseBackground, '  radial-gradient(red 5%, yellow 15%, green 60%)   ', null);
        });
    });
});
