import * as parser from "ui/styling/css-selector-parser";
import * as TKUnit from "../../TKUnit";

function test(css: string, expected: {}): void {
    let result = parser.parse(css);
    TKUnit.assertDeepEqual(result, expected);
}

export function test_fairly_complex_selector(): void {
    test(`  listview#products.mark gridlayout:selected[row="2"] a> b   > c >d>e *[src]   `, [
        { pos: 2, type: "", ident: "listview" },
        { pos: 10, type: "#", ident: "products" },
        { pos: 19, type: ".", ident: "mark", comb: " " },
        { pos: 25, type: "", ident: "gridlayout" },
        { pos: 35, type: ":", ident: "selected" },
        { pos: 44, type: "[]", prop: "row", test: "=", value: "2", comb: " " },
        { pos: 54, type: "", ident: "a", comb: ">" },
        { pos: 57, type: "", ident: "b", comb: ">" },
        { pos: 63, type: "", ident: "c", comb: ">" },
        { pos: 66, type: "", ident: "d", comb: ">" },
        { pos: 68, type: "", ident: "e", comb: " " },
        { pos: 70, type: "*" },
        { pos: 71, type: "[]", prop: "src" }
    ]);
}

export function test_typeguard_isUniversal(): void {
    let selector = parser.parse("*")[0];
    TKUnit.assertTrue(parser.isUniversal(selector));
    TKUnit.assertFalse(parser.isType(selector));
    TKUnit.assertFalse(parser.isClass(selector));
    TKUnit.assertFalse(parser.isId(selector));
    TKUnit.assertFalse(parser.isPseudo(selector));
    TKUnit.assertFalse(parser.isAttribute(selector));
}
export function test_typeguard_isType(): void {
    let selector = parser.parse("button")[0];
    TKUnit.assertFalse(parser.isUniversal(selector));
    TKUnit.assertTrue(parser.isType(selector));
    TKUnit.assertFalse(parser.isClass(selector));
    TKUnit.assertFalse(parser.isId(selector));
    TKUnit.assertFalse(parser.isPseudo(selector));
    TKUnit.assertFalse(parser.isAttribute(selector));
}
export function test_typeguard_isClass(): void {
    let selector = parser.parse(".login")[0];
    TKUnit.assertFalse(parser.isUniversal(selector));
    TKUnit.assertFalse(parser.isType(selector));
    TKUnit.assertTrue(parser.isClass(selector));
    TKUnit.assertFalse(parser.isId(selector));
    TKUnit.assertFalse(parser.isPseudo(selector));
    TKUnit.assertFalse(parser.isAttribute(selector));
}
export function test_typeguard_isId(): void {
    let selector = parser.parse("#login")[0];
    TKUnit.assertFalse(parser.isUniversal(selector));
    TKUnit.assertFalse(parser.isType(selector));
    TKUnit.assertFalse(parser.isClass(selector));
    TKUnit.assertTrue(parser.isId(selector));
    TKUnit.assertFalse(parser.isPseudo(selector));
    TKUnit.assertFalse(parser.isAttribute(selector));
}
export function test_typeguard_isPseudo(): void {
    let selector = parser.parse(":hover")[0];
    TKUnit.assertFalse(parser.isUniversal(selector));
    TKUnit.assertFalse(parser.isType(selector));
    TKUnit.assertFalse(parser.isClass(selector));
    TKUnit.assertFalse(parser.isId(selector));
    TKUnit.assertTrue(parser.isPseudo(selector));
    TKUnit.assertFalse(parser.isAttribute(selector));
}
export function test_typeguard_isAttribute(): void {
    let selector = parser.parse("[src]")[0];
    TKUnit.assertFalse(parser.isUniversal(selector));
    TKUnit.assertFalse(parser.isType(selector));
    TKUnit.assertFalse(parser.isClass(selector));
    TKUnit.assertFalse(parser.isId(selector));
    TKUnit.assertFalse(parser.isPseudo(selector));
    TKUnit.assertTrue(parser.isAttribute(selector));
}

export function test_universal_selector(): void {
    test(`*`, [{ pos: 0, type: "*" }]);
}
export function test_type_selector(): void {
    test(`button`, [{ pos: 0, type: "", ident: "button" }]);
}
export function test_class_selector(): void {
    test(`.red`, [{ pos: 0, type: ".", ident: "red" }]);
}
export function test_id_selector(): void {
    test(`#login`, [{ pos: 0, type: "#", ident: "login" }]);
}
export function test_pseudoClass(): void {
    test(`:hover`, [{ pos: 0, type: ":", ident: "hover" }]);
}
export function test_attribute_no_value(): void {
    test(`[src]`, [{ pos: 0, type: "[]", prop: "src" }]);
}
export function test_attribute_equal(): void {
    test(`[src = "res://"]`, [{ pos: 0, type: "[]", prop: "src", test: "=", value: `res://` }]);
}
export function test_attribute_all_tests(): void {
    ["=", "^=", "$=", "*=", "=", "~=", "|="].forEach(t => test(`[src ${t} "val"]`, [{ pos: 0, type: "[]", prop: "src", test: t, value: "val"}]));
}
export function test_direct_parent_comb(): void {
    test(`listview > .image`, [
        { pos: 0, type: "", ident: "listview", comb: ">" },
        { pos: 11, type: ".", ident: "image" }
    ]);
}
export function test_ancestor_comb(): void {
    test(`listview  .image`, [
        { pos: 0, type: "", ident: "listview", comb: " " },
        { pos: 10, type: ".", ident: "image" }
    ]);
}
export function test_single_sequence(): void {
    test(`button:hover`, [
        { pos: 0, type: "", ident: "button" },
        { pos: 6, type: ":", ident: "hover" }
    ]);
}
export function test_multiple_sequences(): void {
    test(`listview>:selected image.product`, [
        { pos: 0, type: "", ident: "listview", comb: ">" },
        { pos: 9, type: ":", ident: "selected", comb: " " },
        { pos: 19, type: "", ident: "image" },
        { pos: 24, type: ".", ident: "product" }
    ]);
}
export function test_multiple_attribute_and_pseudo_classes(): void {
    test(`button#login[user][pass]:focused:hovered`, [
        { pos: 0, type: "", ident: "button" },
        { pos: 6, type: "#", ident: "login" },
        { pos: 12, type: "[]", prop: "user" },
        { pos: 18, type: "[]", prop: "pass" },
        { pos: 24, type: ":", ident: "focused" },
        { pos: 32, type: ":", ident: "hovered" }
    ]);
}
