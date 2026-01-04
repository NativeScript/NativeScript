import tslib from 'tslib';
import * as timer from '../timer';
import * as animationFrame from '../animation-frame';
import * as mediaQueryList from '../media-query-list';
import * as text from '../text';
import * as xhrImpl from '../xhr';
import '../fetch';
import * as fetchPolyfill from '../fetch';
import * as wgc from '../wgc';
import * as cryptoImpl from '../wgc/crypto';
import * as subtleCryptoImpl from '../wgc/crypto/SubtleCrypto';

// console.log('here in globals/index!');
// console.log(`typeof __dirname:`, typeof __dirname);
// commonjs builds will have __dirname defined, but esm builds will not
global.__dirname = typeof __dirname !== 'undefined' ? __dirname : import.meta.dirname;
// console.log('global.__dirname', global.__dirname);

if (typeof global.__metadata === 'undefined') {
	/**
	 * TS decorator metadata helper.
	 * @param metadataKey   the metadata key (e.g. "design:type")
	 * @param metadataValue the metadata value (e.g. the constructor function)
	 * @returns a decorator function, or undefined if Reflect.metadata isn’t available
	 */
	global.__metadata = (metadataKey, metadataValue) => {
		if (
			typeof Reflect === 'object' &&
			// @ts-expect-error
			typeof Reflect.metadata === 'function'
		) {
			// Delegate to the reflect-metadata shim
			// @ts-expect-error
			return Reflect.metadata(metadataKey, metadataValue);
		}
		// no-op if no Reflect.metadata
	};
}

type ModuleLoader = (name?: string) => any;

interface Context {
	keys(): string[];
	(key: string): any;
}

interface ExtensionMap {
	[originalFileExtension: string]: string;
}

// ts-helpers
// Required by V8 snapshot generator
if (!global.__extends) {
	global.__extends = function (d, b) {
		for (const p in b) {
			if (b.hasOwnProperty(p)) {
				d[p] = b[p];
			}
		}
		function __() {
			this.constructor = d;
		}
		d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
	};
}

// Bind the tslib helpers to global scope.
// This is needed when we don't use importHelpers, which
// breaks extending native-classes
for (const fnName of Object.getOwnPropertyNames(tslib)) {
	if (typeof tslib[fnName] !== 'function') {
		continue;
	}

	if (fnName in global) {
		// Don't override globals that are already defined (ex. __extends)
		continue;
	}

	global[fnName] = tslib[fnName];
}

// module helpers
const defaultExtensionMap: ExtensionMap = {
	'.js': '.js',
	'.ts': '.js',
	'.kt': '.js',
	'.css': '.css',
	'.scss': '.css',
	'.less': '.css',
	'.sass': '.css',
	'.xml': '.xml',
};

global.moduleResolvers = [global.require];

global.registerModule = function (name: string, loader: ModuleLoader): void {
	modules.set(name, { loader, moduleId: name });
};

global._unregisterModule = function _unregisterModule(name: string): void {
	modules.delete(name);
};

global.registerBundlerModules = function registerBundlerModules(context: Context, extensionMap: ExtensionMap = {}) {
	const registerWithName = (nickName: string, moduleId: string) => {
		modules.set(nickName, {
			moduleId,
			loader: () => {
				return context(moduleId);
			},
		});
	};

	const registerModuleById = (moduleId: string) => {
		const extDotIndex = moduleId.lastIndexOf('.');
		const base = moduleId.substring(0, extDotIndex);
		const originalExt = moduleId.substring(extDotIndex);
		const registerExt = extensionMap[originalExt] || defaultExtensionMap[originalExt] || originalExt;

		// We prefer source files for webpack scenarios before compilation leftovers,
		// e. g. if we get a .js and .ts for the same module, the .js is probably the compiled version of the .ts file,
		// so we register the .ts with higher priority, similar is the case with us preferring the .scss to .css
		const isSourceFile = originalExt !== registerExt;
		const registerName = base + registerExt;

		if (registerName.startsWith('./') && registerName.endsWith('.js')) {
			const jsNickNames = [
				// This is extremely short version like "main-page" that was promoted to be used with global.registerModule("module-name", loaderFunc);
				registerName.substring(2, registerName.length - 3),
				// This is for supporting module names like "./main/main-page"
				registerName.substring(0, registerName.length - 3),
				// This is for supporting module names like "main/main-page.js"
				registerName.substring(2),
			];

			jsNickNames.forEach((jsNickName) => {
				if (isSourceFile || !global.moduleExists(jsNickName)) {
					registerWithName(jsNickName, moduleId);
				}
			});
		} else if (registerName.startsWith('./')) {
			const moduleNickNames = [
				// This is for supporting module names like "main/main-page.xml"
				registerName.substring(2),
			];

			moduleNickNames.forEach((moduleNickName) => {
				if (!global.moduleExists(moduleNickName)) {
					registerWithName(moduleNickName, moduleId);
				}
			});
		}

		if (isSourceFile || !global.moduleExists(registerName)) {
			registerWithName(registerName, moduleId);
		}
	};

	context.keys().forEach(registerModuleById);
};

global.moduleExists = function moduleExists(name: string): boolean {
	return modules.has(name);
};

global.getRegisteredModules = function getRegisteredModules(): string[] {
	return Array.from(modules.keys());
};

/**
 * Polyfills
 */
// This method iterates all the keys in the source exports object and copies them to the destination exports one.
// Note: the method will not check for naming collisions and will override any already existing entries in the destination exports.
global.moduleMerge = function (sourceExports: any, destExports: any) {
	for (const key in sourceExports) {
		destExports[key] = sourceExports[key];
	}
};

global.zonedCallback = function (callback: Function): Function {
	if (global.zone) {
		// Zone v0.5.* style callback wrapping
		return global.zone.bind(callback);
	}
	if (global.Zone) {
		// Zone v0.6.* style callback wrapping
		return global.Zone.current.wrap(callback);
	} else {
		return callback;
	}
};

global.System = {
	import(path) {
		return new Promise((resolve, reject) => {
			try {
				resolve(global.require(path));
			} catch (e) {
				reject(e);
			}
		});
	},
};

// Custom decorators

global.Deprecated = function (target: Object, key?: string | symbol, descriptor?: any) {
	if (descriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = function (...args: any[]) {
			console.log(`${key.toString()} is deprecated`);

			return originalMethod.apply(this, args);
		};

		return descriptor;
	} else {
		console.log(`${(target && (<any>target).name) || target} is deprecated`);

		return target;
	}
};

global.Experimental = function (target: Object, key?: string | symbol, descriptor?: any) {
	if (descriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = function (...args: any[]) {
			console.log(`${key.toString()} is experimental`);

			return originalMethod.apply(this, args);
		};

		return descriptor;
	} else {
		console.log(`${(target && (<any>target).name) || target} is experimental`);

		return target;
	}
};
const modules: Map<string, { moduleId: string; loader: ModuleLoader }> = new Map<string, { moduleId: string; loader: ModuleLoader }>();

// console.log(`globals/index, __COMMONJS__:`, __COMMONJS__);
global.loadModule = function loadModule(name: string): any {
	const moduleInfo = modules.get(name);
	if (moduleInfo) {
		const result = moduleInfo.loader(name);
		if (result?.enableAutoAccept) {
			result.enableAutoAccept();
		}

		return result;
	}

	if (__COMMONJS__) {
		for (const resolver of global.moduleResolvers) {
			const result = resolver(name);
			if (result) {
				modules.set(name, { moduleId: name, loader: () => result });

				return result;
			}
		}
	}
	return null;
};
function registerOnGlobalContext(moduleName: string, exportName: string): void {
	Object.defineProperty(global, exportName, {
		get: function () {
			// We do not need to cache require() call since it is already cached in the runtime.
			const m = global.loadModule(moduleName);

			// Redefine the property to make sure the above code is executed only once.
			const resolvedValue = m[exportName];
			Object.defineProperty(global, exportName, {
				value: resolvedValue,
				configurable: true,
				writable: true,
			});

			return resolvedValue;
		},
		configurable: true,
	});
}

export function installPolyfills(moduleName: string, exportNames: string[]) {
	if (global.__snapshot) {
		const loadedModule = global.loadModule(moduleName);
		exportNames.forEach((exportName) => (global[exportName] = loadedModule[exportName]));
	} else {
		exportNames.forEach((exportName) => registerOnGlobalContext(moduleName, exportName));
	}
}

if (!global.NativeScriptHasPolyfilled) {
	global.NativeScriptHasPolyfilled = true;
	// console.log('Installing polyfills...');

	// DOM api polyfills
	const glb = global as any;
	if (__COMMONJS__) {
		global.registerModule('timer', () => timer);
		installPolyfills('timer', ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval']);

		global.registerModule('animation', () => animationFrame);
		installPolyfills('animation', ['requestAnimationFrame', 'cancelAnimationFrame']);

		global.registerModule('media-query-list', () => mediaQueryList);
		installPolyfills('media-query-list', ['matchMedia', 'MediaQueryList']);

		global.registerModule('text', () => text);
		installPolyfills('text', ['TextDecoder', 'TextEncoder']);

		global.registerModule('xhr', () => xhrImpl);
		// Blob and File are now provided by the runtime with a complete File API spec implementation
		// Only install XMLHttpRequest, FormData, and FileReader from xhrImpl
		installPolyfills('xhr', ['XMLHttpRequest', 'FormData', 'FileReader']);

		global.registerModule('fetch', () => fetchPolyfill);
		installPolyfills('fetch', ['fetch', 'Headers', 'Request', 'Response']);

		global.registerModule('wgc', () => wgc);
		installPolyfills('wgc', ['atob', 'btoa']);

		global.registerModule('crypto', () => cryptoImpl);
		installPolyfills('crypto', ['Crypto']);

		global.registerModule('subtle', () => subtleCryptoImpl);
		installPolyfills('subtle-crypto', ['Subtle']);
	} else {
		// timers
		glb.setTimeout = timer.setTimeout;
		glb.clearTimeout = timer.clearTimeout;
		glb.setInterval = timer.setInterval;
		glb.clearInterval = timer.clearInterval;

		// animation frame
		glb.requestAnimationFrame = animationFrame.requestAnimationFrame;
		glb.cancelAnimationFrame = animationFrame.cancelAnimationFrame;

		// media query list
		glb.matchMedia = mediaQueryList.matchMedia;
		glb.MediaQueryList = mediaQueryList.MediaQueryList;

		// text
		glb.TextDecoder = text.TextDecoder;
		glb.TextEncoder = text.TextEncoder;

		// xhr
		glb.XMLHttpRequest = xhrImpl.XMLHttpRequest;
		glb.FormData = xhrImpl.FormData;
		// Blob and File are now provided by the runtime with a complete File API spec implementation
		// Only install FileReader from xhrImpl (Blob and File come from the runtime)
		glb.FileReader = xhrImpl.FileReader;

		// fetch
		glb.fetch = fetchPolyfill.fetch;
		glb.Headers = fetchPolyfill.Headers;
		glb.Request = fetchPolyfill.Request;
		glb.Response = fetchPolyfill.Response;

		// wgc
		glb.atob = wgc.atob;
		glb.btoa = wgc.btoa;

		// wgc
		glb.SubtleCrypto = subtleCryptoImpl.SubtleCrypto;
	}

	glb.crypto = new cryptoImpl.Crypto();

	// global.registerModule('abortcontroller', () => require('../abortcontroller'));
	// installPolyfills('abortcontroller', ['AbortController', 'AbortSignal']);
}

// ensure the Application instance is initialized before any other module imports it.
import '../application';
