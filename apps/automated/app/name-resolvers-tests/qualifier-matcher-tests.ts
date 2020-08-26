import * as TKUnit from '../tk-unit';
import * as enums from '@nativescript/core/ui/enums';
import { findMatch, PlatformContext } from '@nativescript/core/module-name-resolver/qualifier-matcher';

export const androidPhonePortraitContext: PlatformContext = {
	width: 360,
	height: 640,
	deviceType: enums.DeviceType.Phone,
	os: 'android',
};

export const androidPhoneLandscapeContext: PlatformContext = {
	width: 640,
	height: 360,
	deviceType: enums.DeviceType.Phone,
	os: 'android',
};

export const androidTabletPortraitContext: PlatformContext = {
	width: 600,
	height: 960,
	deviceType: enums.DeviceType.Tablet,
	os: 'android',
};

export const iPhonePortraitContext: PlatformContext = {
	width: 320,
	height: 480,
	deviceType: enums.DeviceType.Phone,
	os: 'ios',
};

export const iPhoneLandscapeContext: PlatformContext = {
	width: 480,
	height: 320,
	deviceType: enums.DeviceType.Phone,
	os: 'ios',
};

export function test_findFileMatch_fileName() {
	var candidates: Array<string> = ['test.xml', 'test2.xml', 'other.xml'];

	findMatchTemplate(candidates, androidPhonePortraitContext, 'test.xml');
}

export function test_findFileMatch_os_android() {
	var candidates: Array<string> = ['test.xml', 'test.ios.xml', 'test.android.xml', 'other.xml'];

	findMatchTemplate(candidates, androidPhonePortraitContext, 'test.android.xml');
}

export function test_findFileMatch_os_ios() {
	var candidates: Array<string> = ['test.xml', 'test.ios.xml', 'test.android.xml', 'other.xml'];

	findMatchTemplate(candidates, iPhonePortraitContext, 'test.ios.xml');
}

export function test_findFileMatch_os_fallback() {
	var candidates: Array<string> = ['test.xml', 'test.ios.xml', 'other.xml'];

	findMatchTemplate(candidates, androidPhonePortraitContext, 'test.xml');
}

export function test_findFileMatch_minWH_fallback() {
	var candidates: Array<string> = ['test.xml', 'test.minWH600.xml', 'other.xml'];

	findMatchTemplate(candidates, androidPhonePortraitContext, 'test.xml');
}

export function test_findFileMatch_minWH_best_value() {
	var candidates: Array<string> = ['test.xml', 'test.minWH400.xml', 'test.minWH500.xml', 'test.minWH600.xml', 'test.minWH700.xml', 'other.xml'];

	findMatchTemplate(candidates, androidTabletPortraitContext, 'test.minWH600.xml');
}

export function test_findFileMatch_minW_fallback() {
	var candidates: Array<string> = ['test.xml', 'test.minW600.xml', 'other.xml'];

	findMatchTemplate(candidates, androidPhonePortraitContext, 'test.xml');
}

export function test_findFileMatch_minW_best_value() {
	var candidates: Array<string> = ['test.xml', 'test.minW400.xml', 'test.minW500.xml', 'test.minW600.xml', 'test.minW700.xml', 'other.xml'];

	findMatchTemplate(candidates, androidTabletPortraitContext, 'test.minW600.xml');
}

export function test_findFileMatch_minH_fallback() {
	var candidates: Array<string> = ['test.xml', 'test.minH600.xml', 'other.xml'];

	findMatchTemplate(candidates, androidPhoneLandscapeContext, 'test.xml');
}

export function test_findFileMatch_minH_best_value() {
	var candidates: Array<string> = ['test.xml', 'test.minH400.xml', 'test.minH500.xml', 'test.minH600.xml', 'test.minH700.xml', 'other.xml'];

	findMatchTemplate(candidates, androidPhonePortraitContext, 'test.minH600.xml');
}

export function test_findFileMatch_orientation_fallback() {
	var candidates: Array<string> = ['test.xml', 'test.land.xml', 'other.xml'];

	findMatchTemplate(candidates, androidTabletPortraitContext, 'test.xml');
}

export function test_findFileMatch_orientation_portrait() {
	var candidates: Array<string> = ['test.xml', 'test.land.xml', 'test.port.xml', 'other.xml'];

	findMatchTemplate(candidates, androidTabletPortraitContext, 'test.port.xml');
}

export function test_findFileMatch_orientation_landscape() {
	var candidates: Array<string> = ['test.xml', 'test.land.xml', 'test.port.xml', 'other.xml'];

	findMatchTemplate(candidates, androidPhoneLandscapeContext, 'test.land.xml');
}

export function test_findFileMatch_choose_most_specific_file() {
	var candidates: Array<string> = ['test.xml', 'test.android.xml', 'test.android.port.xml', 'other.xml'];

	findMatchTemplate(candidates, androidPhonePortraitContext, 'test.android.port.xml');
}

export function test_findFileMatch_with_multiple_matches_loads_by_priority() {
	var candidates: Array<string> = ['test.xml', 'test.android.xml', 'test.tablet.xml', 'test.land.xml', 'test.minH600.xml', 'test.minW600.xml', 'test.minWH600.xml', 'other.xml'];

	findMatchTemplate(candidates, androidTabletPortraitContext, 'test.minWH600.xml');
}

function findMatchTemplate(candidates: Array<string>, context: PlatformContext, expected: string) {
	var result = findMatch('test', '.xml', candidates, context);
	TKUnit.assertEqual(result, expected, 'module name');
}

export function test_findFileMatch_with_empty_extension() {
	var candidates: Array<string> = ['test', 'other'];

	var result = findMatch('test', '', candidates, androidTabletPortraitContext);
	TKUnit.assertEqual(result, 'test', 'module name');
}

export function test_findFileMatch_with_null_extension() {
	var candidates: Array<string> = ['test', 'other'];

	var result = findMatch('test', null, candidates, androidTabletPortraitContext);
	TKUnit.assertEqual(result, 'test', 'module name');
}
