import * as TKUnit from '../tk-unit';
import { ModuleNameResolver, ModuleListProvider } from '@nativescript/core';

import { androidPhonePortraitContext, androidPhoneLandscapeContext, androidTabletPortraitContext, iPhoneLandscapeContext, iPhonePortraitContext } from './qualifier-matcher-tests';

const testModule = 'name-resolvers-tests/files/test';
const moduleProvider: ModuleListProvider = () => {
	return ['name-resolvers-tests/files/other.xml', 'name-resolvers-tests/files/test.land.xml', 'name-resolvers-tests/files/test.minWH600.xml', 'name-resolvers-tests/files/test.xml'];
};

export function test_module_name_resolver_with_android_phone_portrait() {
	const moduleResolver = new ModuleNameResolver(androidPhonePortraitContext, moduleProvider);
	const result = moduleResolver.resolveModuleName(testModule, 'xml');
	TKUnit.assertEqual(result, testModule + '.xml');
}

export function test_module_name_resolver_with_android_phone_landscape() {
	const moduleResolver = new ModuleNameResolver(androidPhoneLandscapeContext, moduleProvider);
	const result = moduleResolver.resolveModuleName(testModule, 'xml');
	TKUnit.assertEqual(result, testModule + '.land.xml');
}

export function test_module_name_resolver_with_android_tablet_portrait() {
	const moduleResolver = new ModuleNameResolver(androidTabletPortraitContext, moduleProvider);
	const result = moduleResolver.resolveModuleName(testModule, 'xml');
	TKUnit.assertEqual(result, testModule + '.minWH600.xml');
}

export function test_module_name_resolver_with_ios_phone_landscape() {
	const moduleResolver = new ModuleNameResolver(iPhoneLandscapeContext, moduleProvider);
	const result = moduleResolver.resolveModuleName(testModule, 'xml');
	TKUnit.assertEqual(result, testModule + '.land.xml');
}

export function test_module_name_resolver_with_ios_phone_portrait() {
	const moduleResolver = new ModuleNameResolver(iPhonePortraitContext, moduleProvider);
	const result = moduleResolver.resolveModuleName(testModule, 'xml');
	TKUnit.assertEqual(result, testModule + '.xml');
}
