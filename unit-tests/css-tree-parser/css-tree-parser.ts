import { cssTreeParse } from "@nativescript/core/css/css-tree-parser";
import { parse as reworkCssParse } from "@nativescript/core/css";
import { assert } from "chai";

describe("css-tree parser compatible with rework ", () => {
    it("basic selector", () => {
        const testCase = ".test { color: red; }";
        const reworkAST = reworkCssParse(testCase, { source: "file.css" });
        const cssTreeAST = cssTreeParse(testCase, "file.css");

        assert.deepEqual(reworkAST, cssTreeAST);
    });

    it("@keyframes", () => {
        const testCase = ".test { animation-name: test; } @keyframes test { from { background-color: red; } to { background-color: blue; } }";
        const reworkAST = reworkCssParse(testCase, { source: "file.css" });
        const cssTreeAST = cssTreeParse(testCase, "file.css");

        assert.deepEqual(reworkAST, cssTreeAST);
    });
});