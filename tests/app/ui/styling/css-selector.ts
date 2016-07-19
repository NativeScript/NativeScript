import * as selector from "ui/styling/css-selector";
import * as parser from "css";
import * as TKUnit from "../../TKUnit";

function create(css: string, source: string = "css-selectors.ts@test"): { rules: selector.RuleSet[], map: selector.SelectorsMap } {
    let parse = parser.parse(css, { source });
    let rulesAst = parse.stylesheet.rules.filter(n => n.type === "rule");
    let rules = selector.fromAstNodes(rulesAst);
    let map = new selector.SelectorsMap(rules);
    return { rules, map };
}

function createOne(css: string, source: string = "css-selectors.ts@test"): selector.RuleSet {
    let {rules} = create(css, source);
    TKUnit.assertEqual(rules.length, 1);
    return rules[0];
}

export function test_single_selector() {
    let rule = createOne(`* { color: red; }`);
    TKUnit.assertTrue(rule.selectors[0].match({ cssType: "button" }));
    TKUnit.assertTrue(rule.selectors[0].match({ cssType: "image" }));
}

export function test_two_selectors() {
    let rule = createOne(`button, image { color: red; }`);
    TKUnit.assertTrue(rule.selectors[0].match({ cssType: "button" }));
    TKUnit.assertTrue(rule.selectors[1].match({ cssType: "image" }));
    TKUnit.assertFalse(rule.selectors[0].match({ cssType: "stacklayout" }));
    TKUnit.assertFalse(rule.selectors[1].match({ cssType: "stacklayout" }));
}

export function test_narrow_selection() {
    let {map} = create(`
        .login { color: blue; }
        button { color: red; }
        image { color: green; }
    `);

    let buttonQuerry = map.query({ cssType: "button" }).selectors;
    TKUnit.assertEqual(buttonQuerry.length, 1);
    TKUnit.assertDeepSuperset(buttonQuerry[0].ruleset.declarations, [
        { property: "color", value: "red" }
    ]);

    let imageQuerry = map.query({ cssType: "image", cssClasses: new Set(["login"]) }).selectors;
    TKUnit.assertEqual(imageQuerry.length, 2);
    // Note class before type
    TKUnit.assertDeepSuperset(imageQuerry[0].ruleset.declarations, [
        { property: "color", value: "green" }
    ]);
    TKUnit.assertDeepSuperset(imageQuerry[1].ruleset.declarations, [
        { property: "color", value: "blue" }
    ]);
}

let positiveMatches = {
    "*": (view) => true,
    "type": (view) => view.cssType === "type",
    "#id": (view) => view.id === "id",
    ".class": (view) => view.cssClasses.has("class"),
    ":pseudo": (view) => view.cssPseudoClasses.has("pseudo"),
    "[src1]": (view) => "src1" in view,
    "[src2='src-value']": (view) => view['src2'] === 'src-value'
}

let positivelyMatchingView = {
    cssType: "type",
    id: "id",
    cssClasses: new Set(["class"]),
    cssPseudoClasses: new Set(["pseudo"]),
    "src1": "src",
    "src2": "src-value"
}

let negativelyMatchingView = {
    cssType: "nottype",
    id: "notid",
    cssClasses: new Set(["notclass"]),
    cssPseudoClasses: new Set(["notpseudo"]),
    // Has no "src1"
    "src2": "not-src-value"
}

export function test_simple_selectors_match() {
    for (let sel in positiveMatches) {
        let css = sel + " { color: red; }";
        let rule = createOne(css);
        TKUnit.assertTrue(rule.selectors[0].match(positivelyMatchingView), "Expected successful match for: " + css);
        if (sel !== "*") {
            TKUnit.assertFalse(rule.selectors[0].match(negativelyMatchingView), "Expected match failure for: " + css);
        }
    }
}

export function test_two_selector_sequence_positive_match() {
    for (let firstStr in positiveMatches) {
        for (let secondStr in positiveMatches) {
            if (secondStr !== firstStr && secondStr !== "*" && secondStr !== "type") {
                let css = firstStr + secondStr + " { color: red; }";
                let rule = createOne(css);
                TKUnit.assertTrue(rule.selectors[0].match(positivelyMatchingView), "Expected successful match for: " + css);
                if (firstStr !== "*") {
                    TKUnit.assertFalse(rule.selectors[0].match(negativelyMatchingView), "Expected match failure for: " + css);
                }
            }
        }
    }
}

export function test_direct_parent_combinator() {
    let rule = createOne(`listview > item:selected { color: red; }`);
    TKUnit.assertTrue(rule.selectors[0].match({
        cssType: "item",
        cssPseudoClasses: new Set(["selected"]),
        parent: {
            cssType: "listview"
        }
    }), "Item in list view expected to match");
    TKUnit.assertFalse(rule.selectors[0].match({
        cssType: "item",
        cssPseudoClasses: new Set(["selected"]),
        parent: {
            cssType: "stacklayout",
            parent: {
                cssType: "listview"
            }
        }
    }), "Item in stack in list view NOT expected to match.");
}

export function test_ancestor_combinator() {
    let rule = createOne(`listview item:selected { color: red; }`);
    TKUnit.assertTrue(rule.selectors[0].match({
        cssType: "item",
        cssPseudoClasses: new Set(["selected"]),
        parent: {
            cssType: "listview"
        }
    }), "Item in list view expected to match");
    TKUnit.assertTrue(rule.selectors[0].match({
        cssType: "item",
        cssPseudoClasses: new Set(["selected"]),
        parent: {
            cssType: "stacklayout",
            parent: {
                cssType: "listview"
            }
        }
    }), "Item in stack in list view expected to match.");
    TKUnit.assertFalse(rule.selectors[0].match({
        cssType: "item",
        cssPseudoClasses: new Set(["selected"]),
        parent: {
            cssType: "stacklayout",
            parent: {
                cssType: "page"
            }
        }
    }), "Item in stack in page NOT expected to match.");
}

export function test_backtracking_css_selector() {
    let sel = createOne(`a>b c { color: red; }`).selectors[0];
    let child = {
        cssType: "c",
        parent: {
            cssType: "b",
            parent: {
                cssType: "fail",
                parent: {
                    cssType: "b",
                    parent: {
                        cssType: "a"
                    }
                }
            }
        }
    }
    TKUnit.assertTrue(sel.match(child));
}

function toString() { return this.cssType; }

export function test_simple_query_match() {
    let {map} = create(`list grid[promotion] button:highlighted { color: red; }`);

    let list, grid, button;

    button = {
        cssType: "button",
        cssPseudoClasses: new Set<string>(["highlighted"]),
        toString,
        parent: grid = {
            cssType: "grid",
            promotion: true,
            toString,
            parent: list = {
                cssType: "list",
                toString
            }
        }
    }

    let match = map.query(button);
    TKUnit.assertEqual(match.selectors.length, 1, "Expected match to have one selector.");

    let expected = new Map<selector.Node, selector.Changes>()
        .set(grid, { attributes: new Set(["promotion"]) })
        .set(button, { pseudoClasses: new Set(["highlighted"]) });

    TKUnit.assertDeepEqual(match.changeMap, expected);
}

export function test_query_match_one_child_group() {
    let {map} = create(`#prod[special] > gridlayout { color: red; }`);
    let gridlayout, prod;

    gridlayout = {
        cssType: "gridlayout",
        toString,
        parent: prod = {
            id: "prod",
            cssType: "listview",
            toString
        }
    };

    let match = map.query(gridlayout);
    TKUnit.assertEqual(match.selectors.length, 1, "Expected match to have one selector.");

    let expected = new Map<selector.Node, selector.Changes>().set(prod, { attributes: new Set(["special"])} );
    TKUnit.assertDeepEqual(match.changeMap, expected);
}
