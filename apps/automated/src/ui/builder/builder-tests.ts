import { Builder, sanitizeModuleName } from '@nativescript/core';

import { assertEqual, assertNull, assertThrows, assertNotNull } from '../../tk-unit';

const COMPONENT_MODULE = 'ui/builder/component-module';
const MISSING_MODULE = 'ui/builder/missing-module';
const labelId = 'label';

function getViewComponent(moduleName: string) {
	return Builder.createViewFromEntry({ moduleName });
}

export function test_view_is_module_root_component() {
	const view = getViewComponent(COMPONENT_MODULE);
	const actualModule = view._moduleName;
	assertEqual(actualModule, COMPONENT_MODULE, `View<${view}> is NOT root component of module <${COMPONENT_MODULE}>.`);
}

export function test_view_is_NOT_module_root_component() {
	const view = getViewComponent(COMPONENT_MODULE);
	const nestedView = view.getViewById(`${labelId}`);
	const undefinedModule = nestedView._moduleName;
	assertNull(undefinedModule, `View<${nestedView}> should NOT be a root component of a module.`);
}

export function test_create_view_from_entry_from_missing_module_throws() {
	assertThrows(() => getViewComponent(MISSING_MODULE), 'Loading component from a missing module SHOULD throw an error.');
}

export function test_create_view_from_entry_with_path_with_slash() {
	const view = getViewComponent('/' + COMPONENT_MODULE);
	assertNotNull(view, `Module starting with "/" could not be loaded`);
}

export function test_create_view_from_entry_with_path_with_tilde() {
	const view = getViewComponent('~/' + COMPONENT_MODULE);
	assertNotNull(view, `Module starting with "~/" could not be loaded`);
}

export function test_sanitize_module_name_with_removable_extension() {
	const moduleName = sanitizeModuleName('./xml-declaration/mainPage.xml');
	assertEqual(moduleName, './xml-declaration/mainPage');
}

export function test_sanitize_module_name_with_non_removable_extension() {
	const moduleName = sanitizeModuleName('app/views/main.page');
	assertEqual(moduleName, 'app/views/main.page');
}
