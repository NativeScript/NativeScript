// Definitions.
import { View } from '../../core/view';

// Types.
import { isEventOrGesture } from '../../core/bindable';
import { getBindingOptions, bindingConstants } from '../binding-builder';
import { profile } from '../../../profiling';
import * as debugModule from '../../../utils/debug';
import { Device } from '../../../platform';
import { sanitizeModuleName } from '../module-name-sanitizer';
import { resolveModuleName } from '../../../module-name-resolver';

export interface ComponentModule {
	component: View;
	exports: any;
}

const legacyShortBarrels = [
	'text/formatted-string',
	'text/span',
	'ui/text-base/formatted-string',
	'ui/text-base/span',
	'ui/action-bar',
	'ui/activity-indicator',
	'ui/bottom-navigation',
	'ui/button',
	'ui/content-view',
	'ui/date-picker',
	'ui/frame',
	'ui/html-view',
	'ui/image',
	'ui/label',
	'ui/layouts/absolute-layout',
	'ui/layouts/dock-layout',
	'ui/layouts/grid-layout',
	'ui/layouts/stack-layout',
	'ui/layouts/flexbox-layout',
	'ui/layouts/wrap-layout',
	'ui/list-picker',
	'ui/page',
	'ui/placeholder',
	'ui/progress',
	'ui/proxy-view-container',
	'ui/repeater',
	'ui/scroll-view',
	'ui/search-bar',
	'ui/segmented-bar',
	'ui/slider',
	'ui/switch',
	'ui/tab-view',
	'ui/tab-navigation-base/tab-strip',
	'ui/tab-navigation-base/tab-strip-item',
	'ui/tab-navigation-base/tab-content-item',
	'ui/tabs',
	'ui/web-view',
	'ui/text-field',
	'ui/text-view',
	'ui/time-picker',
	'ui/list-view',
];
const CORE_UI_BARREL = '@nativescript/core/ui';
const CODE_FILE = 'codeFile';
const CSS_FILE = 'cssFile';
const IMPORT = 'import';

const createComponentInstance = profile('createComponentInstance', (elementName: string, namespace: string): { instance: View; instanceModule: Object } => {
	let instance: View;
	let instanceModule: Object;
	// Get module id.
	let resolvedModuleName;
	try {
		if (typeof namespace === 'string') {
			if (legacyShortBarrels.includes(namespace)) {
				// console.log('CORE_UI_BARREL namespace:', namespace)
				resolvedModuleName = CORE_UI_BARREL;
			} else {
				// console.log('CUSTOM namespace:', namespace)
				resolvedModuleName = resolveModuleName(namespace, '');
			}
			instanceModule = global.loadModule(resolvedModuleName, true);
		} else {
			// load module from @nativescript/core/ui or mapped paths
			// resolvedModuleName =
			// 	MODULES[elementName] ||
			// 	UI_PATH +
			// 		(elementName.toLowerCase().indexOf('layout') !== -1 ? 'layouts/' : '') +
			// 		elementName
			// 			.split(/(?=[A-Z])/)
			// 			.join('-')
			// 			.toLowerCase();

			instanceModule = global.loadModule(CORE_UI_BARREL, false);
			// don't register core modules for HMR self-accept
			// instanceModule = global.loadModule(resolvedModuleName, false);
		}

		// Get the component type from module.
		const instanceType = instanceModule[elementName];

		// Create instance of the component.
		instance = new instanceType();
	} catch (ex) {
		const debug: typeof debugModule = require('../../../utils/debug');
		throw new debug.ScopeError(ex, "Module '" + (resolvedModuleName || elementName) + "' not found for element '" + (namespace ? namespace + ':' : '') + elementName + "'.");
	}

	return { instance, instanceModule };
});

const getComponentModuleExports = profile(
	'getComponentModuleExports',
	(instance: View, moduleExports: Object, attributes: Object): Object => {
		if (attributes) {
			const codeFileAttribute = attributes[CODE_FILE] || attributes[IMPORT];
			if (codeFileAttribute) {
				const resolvedCodeFileModule = resolveModuleName(sanitizeModuleName(codeFileAttribute), '');
				if (resolvedCodeFileModule) {
					moduleExports = global.loadModule(resolvedCodeFileModule, true);
					(<any>instance).exports = moduleExports;
				} else {
					throw new Error(`Code file with path "${codeFileAttribute}" cannot be found! Looking for webpack module with name "${resolvedCodeFileModule}"`);
				}
			}
		}

		return moduleExports;
	}
);

const applyComponentCss = profile('applyComponentCss', (instance: View, moduleName: string, attributes: Object) => {
	let cssApplied = false;

	if (attributes && attributes[CSS_FILE]) {
		let resolvedCssModuleName = resolveModuleName(sanitizeModuleName(attributes[CSS_FILE]), 'css');

		if (resolvedCssModuleName) {
			instance.addCssFile(resolvedCssModuleName);
			cssApplied = true;
		} else {
			throw new Error(`Css file with path "${attributes[CSS_FILE]}" cannot be found! Looking for webpack module with name "${resolvedCssModuleName}"`);
		}
	}

	if (moduleName && !cssApplied) {
		let resolvedCssModuleName = resolveModuleName(moduleName, 'css');
		if (resolvedCssModuleName) {
			instance.addCssFile(resolvedCssModuleName);
		}
	}
});

const applyComponentAttributes = profile('applyComponentAttributes', (instance: View, instanceModule: Object, moduleExports: Object, attributes: Object) => {
	if (instance && instanceModule) {
		for (let attr in attributes) {
			const attrValue = <string>attributes[attr];

			if (attr.indexOf(':') !== -1) {
				const platformName = attr.split(':')[0].trim();

				if (platformName.toLowerCase() === Device.os.toLowerCase()) {
					attr = attr.split(':')[1].trim();
				} else {
					continue;
				}
			}

			if (attr.indexOf('.') !== -1) {
				let subObj = instance;
				const properties = attr.split('.');
				const subPropName = properties[properties.length - 1];

				for (let i = 0; i < properties.length - 1; i++) {
					if (subObj !== undefined && subObj !== null) {
						subObj = subObj[properties[i]];
					}
				}

				if (subObj !== undefined && subObj !== null) {
					setPropertyValue(subObj, instanceModule, moduleExports, subPropName, attrValue);
				}
			} else {
				setPropertyValue(instance, instanceModule, moduleExports, attr, attrValue);
			}
		}
	}
});

export function getComponentModule(elementName: string, namespace: string, attributes: Object, moduleExports: Object, moduleNamePath?: string, isRootComponent?: boolean): ComponentModule {
	// Support lower-case-dashed component declaration in the XML (https://github.com/NativeScript/NativeScript/issues/309).
	elementName = elementName
		.split('-')
		.map((s) => s[0].toUpperCase() + s.substring(1))
		.join('');

	const { instance, instanceModule } = createComponentInstance(elementName, namespace, null);
	moduleExports = getComponentModuleExports(instance, <any>moduleExports, attributes);
	if (isRootComponent) {
		applyComponentCss(instance, moduleNamePath, attributes);
	}

	applyComponentAttributes(instance, instanceModule, moduleExports, attributes);

	let componentModule;
	if (instance && instanceModule) {
		componentModule = { component: instance, exports: instanceModule };
	}

	return componentModule;
}

export function setPropertyValue(instance: View, instanceModule: Object, exports: Object, propertyName: string, propertyValue: any) {
	// Note: instanceModule can be null if we are loading custom component with no code-behind.
	if (isBinding(propertyValue) && instance.bind) {
		const bindOptions = getBindingOptions(propertyName, getBindingExpressionFromAttribute(propertyValue));
		instance.bind(
			{
				sourceProperty: bindOptions[bindingConstants.sourceProperty],
				targetProperty: bindOptions[bindingConstants.targetProperty],
				expression: bindOptions[bindingConstants.expression],
				twoWay: bindOptions[bindingConstants.twoWay],
			},
			bindOptions[bindingConstants.source]
		);
	} else if (isEventOrGesture(propertyName, instance)) {
		// Get the event handler from page module exports.
		const handler = exports && exports[propertyValue];

		// Check if the handler is function and add it to the instance for specified event name.
		if (typeof handler === 'function') {
			instance.on(propertyName, handler);
		}
	} else if (isKnownFunction(propertyName, instance) && exports && typeof exports[propertyValue] === 'function') {
		instance[propertyName] = exports[propertyValue];
	} else {
		instance[propertyName] = propertyValue;
	}
}

function getBindingExpressionFromAttribute(value: string): string {
	return value.replace('{{', '').replace('}}', '').trim();
}

function isBinding(value: any): boolean {
	let isBinding;

	if (typeof value === 'string') {
		const str = value.trim();
		isBinding = str.indexOf('{{') === 0 && str.lastIndexOf('}}') === str.length - 2;
	}

	return isBinding;
}

// For example, ListView.itemTemplateSelector
let KNOWN_FUNCTIONS = 'knownFunctions';
function isKnownFunction(name: string, instance: View): boolean {
	return instance.constructor && KNOWN_FUNCTIONS in instance.constructor && instance.constructor[KNOWN_FUNCTIONS].indexOf(name) !== -1;
}
