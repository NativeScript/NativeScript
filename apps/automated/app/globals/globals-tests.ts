import '@nativescript/core/globals';
import * as TKUnit from '../tk-unit';

declare var System: any;
export function test_global_system_import() {
	TKUnit.assert(System, 'System not defined');
	TKUnit.assert(typeof System.import === 'function', 'System.import not a function');

	TKUnit.assert((<any>global).System, 'global.System not defined');
	TKUnit.assert(typeof (<any>global).System.import === 'function', 'global.System.import not a function');
}

export function test_global_zonedCallback() {
	TKUnit.assert(typeof zonedCallback === 'function', 'zonedCallback not defined');
	TKUnit.assert(typeof global.zonedCallback === 'function', 'global.zonedCallback not a function');
}

export function test_global_moduleMerge() {
	TKUnit.assert(typeof global.moduleMerge === 'function', 'global.moduleMerge not a function');
}

export function test_global_registerModule() {
	TKUnit.assert(typeof global.registerModule === 'function', 'global.registerModule not a function');
}

export function test_global_registerWebpackModules() {
	TKUnit.assert(typeof global.registerWebpackModules === 'function', 'global.registerWebpackModules not a function');
}

export function test_global_loadModule() {
	TKUnit.assert(typeof global.loadModule === 'function', 'global.loadModule not a function');
}

export function test_global_moduleExists() {
	TKUnit.assert(typeof global.moduleExists === 'function', 'global.moduleExists not a function');
}

export function test_global_getRegisteredModules() {
	TKUnit.assert(typeof global.getRegisteredModules === 'function', 'global.getRegisteredModules not a function');
}

export function test_global_Deprecated() {
	TKUnit.assert(typeof global.Deprecated === 'function', 'global.Deprecated not a function');
}

export function test_global_Experimental() {
	TKUnit.assert(typeof global.Experimental === 'function', 'global.Experimental not a function');
}
