import * as TKUnit from "../TKUnit";

export function test_typescript_spread_operator() {
    const a = { first: "test1", second: "test2" };
    const b = { ...a, second: "newValue" };

    TKUnit.assertEqual(b.first, "test1");
    TKUnit.assertEqual(b.second, "newValue");
}