import { View, Length } from "tns-core-modules/ui/core/view";
import * as TKUnit from "../../TKUnit";
import { layout } from "tns-core-modules/utils/utils";

import round = layout.round;
export const dipToDp = layout.toDevicePixels;

const EPS = 1;

export function left(view: View): number { return round(dipToDp(view.getLocationInWindow().x)); }
export function top(view: View): number { return round(dipToDp(view.getLocationInWindow().y)); }
export function right(view: View): number { return left(view) + width(view); }
export function bottom(view: View): number { return top(view) + height(view); }

export function height(view: View): number {
    return round(dipToDp(view.getActualSize().height));
}

export function width(view: View): number {
    return round(dipToDp(view.getActualSize().width));
}

export function paddingLeft(view: View): number { return Length.toDevicePixels(view.style.paddingLeft, 0) + Length.toDevicePixels(view.parent.style.paddingLeft, 0) + (<View>view.parent).getSafeAreaInsets().left; };
export function paddingTop(view: View): number { return top(view) + Length.toDevicePixels(view.style.paddingTop, 0) };
export function paddingRight(view: View): number { return right(view) - Length.toDevicePixels(view.style.paddingRight, 0) };
export function paddingBottom(view: View): number { return bottom(view) - Length.toDevicePixels(view.style.paddingBottom, 0) };

export function equal<T>(a: T, b: T, message?: string) {
    message ? TKUnit.assertEqual(a, b, message) : TKUnit.assertEqual(a, b);
}

export function closeEnough(a: number, b: number, message?: string) {
    message ? TKUnit.assertTrue(Math.abs(a - b) <= EPS, message) : TKUnit.assertTrue(Math.abs(a - b) <= EPS);
}

export function notEqual<T>(a: T, b: T, message?: string) {
    message ? TKUnit.assertNotEqual(a, b, message) : TKUnit.assertNotEqual(a, b);
}

export function check(exp: boolean, message?: string) {
    message ? TKUnit.assert(exp, message) : TKUnit.assert(exp);
}

export function heightEqual(view1: View, view2: View) {
    equal(height(view1), height(view2), `Expected height of ${view1} to equal height of ${view2}.`);
}

export function widthEqual(view1: View, view2: View) {
    equal(width(view1), width(view2), `Expected width of ${view1} to equal width of ${view2}.`);
}

export function isLeftAlignedWith(view1: View, view2: View) {
    TKUnit.assertEqual(left(view1), left(view2), `${view1} is not left-aligned with ${view2}`);
}

export function isRightAlignedWith(view1: View, view2: View) {
    TKUnit.assertEqual(right(view1), right(view2), `${view1} is not right-aligned with ${view2}`);
}

export function isTopAlignedWith(view1: View, view2: View) {
    TKUnit.assertEqual(top(view1), top(view2), `${view1} is not top-aligned with ${view2}`);
}

export function isBottomAlignedWith(view1: View, view2: View) {
    TKUnit.assertEqual(bottom(view1), bottom(view2), `${view1} is not bottom-aligned with ${view2}`);
}

export function isLeftOf(view1: View, view2: View) {
    TKUnit.assert(right(view1) <= left(view2), `${view1}.right is not left of ${view2}.left`);
}

export function isAbove(view1: View, view2: View) {
    TKUnit.assert(bottom(view1) <= top(view2), `${view1}.bottom is not above ${view2}.top`);
}

export function isRightOf(view1: View, view2: View) {
    TKUnit.assert(left(view1) >= right(view2), `${view1}.left is not right of ${view2}.right`);
}

export function isBelow(view1: View, view2: View, distance?: number) {
    TKUnit.assert(top(view1) >= bottom(view2), `${view1}.top is not below ${view2}.bottom`);
}

export function isLeftWith(view1: View, view2: View, distance: number) {
    TKUnit.assertTrue(Math.abs(left(view1) + distance - left(view2)) <= EPS, `${view1}.left is not ${distance} of ${view2}.left`);
}

export function isRightWith(view1: View, view2: View, distance: number) {
    TKUnit.assertTrue(Math.abs(right(view1) + distance - right(view2)) <= EPS, `${view1}.right is not ${distance} of ${view2}.right`);
}

export function isAboveWith(view1: View, view2: View, distance: number) {
    TKUnit.assertTrue(Math.abs(bottom(view1) + distance - bottom(view2)) <= EPS, `${view1}.bottom is not ${distance} of ${view2}.bottom`);
}

export function isBelowWith(view1: View, view2: View, distance: number) {
    TKUnit.assertTrue(Math.abs(top(view1) + distance - top(view2)) <= EPS, `${view1}.top is not ${distance} of ${view2}.top`);
}
