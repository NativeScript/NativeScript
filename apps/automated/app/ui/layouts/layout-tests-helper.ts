import * as TKUnit from '../../tk-unit';
import { Utils, View, Length } from '@nativescript/core';

const round = Utils.layout.round;
export const dipToDp = Utils.layout.toDevicePixels;

const EPS = 1;

export function left(view: View): number {
	return round(dipToDp(view.getLocationInWindow().x));
}
export function top(view: View): number {
	return round(dipToDp(view.getLocationInWindow().y));
}
export function right(view: View): number {
	return left(view) + width(view);
}
export function bottom(view: View): number {
	return top(view) + height(view);
}

export function height(view: View): number {
	return round(dipToDp(view.getActualSize().height));
}

export function width(view: View): number {
	return round(dipToDp(view.getActualSize().width));
}

export function paddingLeft(view: View): number {
	return Length.toDevicePixels(view.style.paddingLeft, 0) + Length.toDevicePixels(view.parent.style.paddingLeft, 0) + (<View>view.parent).getSafeAreaInsets().left;
}
export function paddingTop(view: View): number {
	return top(view) + Length.toDevicePixels(view.style.paddingTop, 0);
}
export function paddingRight(view: View): number {
	return right(view) - Length.toDevicePixels(view.style.paddingRight, 0);
}
export function paddingBottom(view: View): number {
	return bottom(view) - Length.toDevicePixels(view.style.paddingBottom, 0);
}

export function equal<T>(a: T, b: T, message?: string) {
	message ? TKUnit.assertEqual(a, b, message) : TKUnit.assertEqual(a, b);
}

export function closeEnough(a: number, b: number, message?: string) {
	message ? TKUnit.assertTrue(Math.abs(a - b) <= EPS, message) : TKUnit.assertTrue(Math.abs(a - b) <= EPS);
}

export function lessOrCloseEnough(a: number, b: number, message?: string) {
	const less = a < b;
	const close = Math.abs(a - b) <= EPS;
	message ? TKUnit.assertTrue(less || close, message) : TKUnit.assertTrue(less || close);
}

export function greaterOrCloseEnough(a: number, b: number, message?: string) {
	const greater = a > b;
	const close = Math.abs(a - b) <= EPS;
	message ? TKUnit.assertTrue(greater || close, message) : TKUnit.assertTrue(greater || close);
}

export function notEqual<T>(a: T, b: T, message?: string) {
	message ? TKUnit.assertNotEqual(a, b, message) : TKUnit.assertNotEqual(a, b);
}

export function check(exp: boolean, message?: string) {
	message ? TKUnit.assert(exp, message) : TKUnit.assert(exp);
}

export function heightEqual(view1: View, view2: View, message?: string) {
	equal(height(view1), height(view2), message || `Expected height of ${view1}:${height(view1)} to equal height of ${view2}:${height(view2)}.`);
}

export function widthEqual(view1: View, view2: View, message?: string) {
	equal(width(view1), width(view2), message || `Expected width of ${view1}:${width(view1)} to equal width of ${view2}:${width(view2)}.`);
}

export function isLeftAlignedWith(view1: View, view2: View, message?: string) {
	TKUnit.assertEqual(left(view1), left(view2), message || `${view1}:${left(view1)} is not left-aligned with ${view2}:${left(view2)}`);
}

export function isRightAlignedWith(view1: View, view2: View, message?: string) {
	TKUnit.assertEqual(right(view1), right(view2), message || `${view1}:${right(view1)} is not right-aligned with ${view2}:${right(view2)}`);
}

export function isTopAlignedWith(view1: View, view2: View, message?: string) {
	TKUnit.assertEqual(top(view1), top(view2), message || `${view1}:${top(view1)} is not top-aligned with ${view2}:${top(view2)}`);
}

export function isBottomAlignedWith(view1: View, view2: View, message?: string) {
	TKUnit.assertEqual(bottom(view1), bottom(view2), message || `${view1}:${bottom(view1)} is not bottom-aligned with ${view2}:${bottom(view2)}`);
}

export function isLeftOf(view1: View, view2: View, message?: string) {
	TKUnit.assert(right(view1) <= left(view2), message || `${view1}.right:${right(view1)} is not left of ${view2}.left:${left(view2)}`);
}

export function isAbove(view1: View, view2: View, message?: string) {
	TKUnit.assert(bottom(view1) <= top(view2), message || `${view1}.bottom:${bottom(view1)} is not above ${view2}.top:${top(view2)}`);
}

export function isRightOf(view1: View, view2: View, message?: string) {
	TKUnit.assert(left(view1) >= right(view2), message || `${view1}.left:${left(view1)} is not right of ${view2}.right:${right(view2)}`);
}

export function isBelow(view1: View, view2: View, distance?: number, message?: string) {
	TKUnit.assert(top(view1) >= bottom(view2), message || `${view1}.top:${top(view1)} is not below ${view2}.bottom:${bottom(view1)}`);
}

export function isLeftWith(view1: View, view2: View, distance: number, message?: string) {
	TKUnit.assertTrue(Math.abs(left(view1) + distance - left(view2)) <= EPS, message || `${view1}.left:${left(view1)} is not ${distance} of ${view2}.left:${left(view2)}`);
}

export function isAboveWith(view1: View, view2: View, distance: number, message?: string) {
	TKUnit.assertTrue(Math.abs(bottom(view1) + distance - bottom(view2)) <= EPS, message || `${view1}.bottom:${bottom(view1)} is not ${distance} of ${view2}.bottom:${bottom(view2)}`);
}

export function isRightWith(view1: View, view2: View, distance: number, message?: string) {
	TKUnit.assertTrue(Math.abs(right(view1) + distance - right(view2)) <= EPS, message || `${view1}.right:${right(view1)} is not ${distance} of ${view2}.right:${right(view2)}`);
}

export function isBelowWith(view1: View, view2: View, distance: number, message?: string) {
	TKUnit.assertTrue(Math.abs(top(view1) + distance - top(view2)) <= EPS, message || `${view1}.top:${top(view1)} is not ${distance} of ${view2}.top:${top(view2)}`);
}
