// Definitions.
import { View } from '../../core/view';

// Types.
import { isEventOrGesture } from '../../core/bindable';
import { getBindingOptions, bindingConstants } from '../binding-builder';
import { profile } from '../../../profiling';
import * as debugModule from '../../../utils/debug';
import { Device } from '../../../platform';
import { sanitizeModuleName } from '../../../utils/common';
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
			instanceModule = global.loadModule(resolvedModuleName);
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

			instanceModule = global.loadModule(CORE_UI_BARREL);
			// don't register core modules for HMR self-accept
			// instanceModule = global.loadModule(resolvedModuleName, false);
		}

		// Get the component type from module.
		const instanceType = instanceModule[elementName];

		// Create instance of the component.
		instance = new instanceType();
	} catch (ex) {
		throw new debugModule.ScopeError(ex, "Module '" + (resolvedModuleName || elementName) + "' not found for element '" + (namespace ? namespace + ':' : '') + elementName + "'.");
	}

	return { instance, instanceModule };
});

const getComponentModuleExports = profile('getComponentModuleExports', (instance: View, moduleExports: Object, attributes: Object): Object => {
	if (attributes) {
		const codeFileAttribute = attributes[CODE_FILE] || attributes[IMPORT];
		if (codeFileAttribute) {
			const resolvedCodeFileModule = resolveModuleName(sanitizeModuleName(codeFileAttribute), '');
			if (resolvedCodeFileModule) {
				moduleExports = global.loadModule(resolvedCodeFileModule);
				(<any>instance).exports = moduleExports;
			} else {
				throw new Error(`Code file with path "${codeFileAttribute}" cannot be found! Looking for webpack module with name "${resolvedCodeFileModule}"`);
			}
		}
	}

	return moduleExports;
});

const applyComponentCss = profile('applyComponentCss', (instance: View, moduleName: string, attributes: Object) => {
	let cssApplied = false;

	if (attributes && attributes[CSS_FILE]) {
		const resolvedCssModuleName = resolveModuleName(sanitizeModuleName(attributes[CSS_FILE]), 'css');

		if (resolvedCssModuleName) {
			instance.addCssFile(resolvedCssModuleName);
			cssApplied = true;
		} else {
			throw new Error(`Css file with path "${attributes[CSS_FILE]}" cannot be found! Looking for webpack module with name "${resolvedCssModuleName}"`);
		}
	}

	if (moduleName && !cssApplied) {
		const resolvedCssModuleName = resolveModuleName(moduleName, 'css');
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

			console.log('applyComponentAttributes called for attr:', attr, 'with value:', attrValue);
			if (attr === 'navigatingTo') {
				console.log('@@@ navigatingTo moduleExports:', moduleExports);
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
	console.log('getComponentModule called for element:', elementName, 'with namespace:', namespace, 'and attributes:', attributes);
	console.log('moduleExports ---');
	console.log(moduleExports);
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
		console.log('1 setPropertyValue, Binding detected for property:', propertyName, 'with value:', propertyValue);
		const bindOptions = getBindingOptions(propertyName, getBindingExpressionFromAttribute(propertyValue));
		instance.bind(
			{
				sourceProperty: bindOptions[bindingConstants.sourceProperty],
				targetProperty: bindOptions[bindingConstants.targetProperty],
				expression: bindOptions[bindingConstants.expression],
				twoWay: bindOptions[bindingConstants.twoWay],
			},
			bindOptions[bindingConstants.source],
		);
	} else if (isEventOrGesture(propertyName, instance)) {
		console.log('2 setPropertyValue, Binding detected for property:', propertyName, 'with value:', propertyValue);
		console.log('setPropertyValue, exports:', exports);
		// Get the event handler from page module exports.
		const handler = exports && exports[propertyValue];

		// Check if the handler is function and add it to the instance for specified event name.
		if (typeof handler === 'function') {
			instance.on(propertyName, handler);
		}
	} else if (isKnownFunction(propertyName, instance) && exports && typeof exports[propertyValue] === 'function') {
		console.log('3 setPropertyValue, Binding detected for property:', propertyName, 'with value:', propertyValue);
		instance[propertyName] = exports[propertyValue];
	} else {
		console.log('4 setPropertyValue, Binding detected for property:', propertyName, 'with value:', propertyValue);
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
	console.log('isBinding called with value:', value, ' isBinding:', isBinding);

	return isBinding;
}

// For example, ListView.itemTemplateSelector
const KNOWN_FUNCTIONS = 'knownFunctions';
function isKnownFunction(name: string, instance: View): boolean {
	return instance.constructor && KNOWN_FUNCTIONS in instance.constructor && (instance.constructor[KNOWN_FUNCTIONS] as string).indexOf(name) !== -1;
}
