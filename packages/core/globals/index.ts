import type * as tslibType from 'tslib';
const tslib: typeof tslibType = require('tslib');
import { Observable } from '../data/observable';
import { trace as profilingTrace, time, uptime, level as profilingLevel } from '../profiling';

type ModuleLoader = (name?: string) => any;

interface Context {
	keys(): string[];
	(key: string): any;
}

interface ExtensionMap {
	[originalFileExtension: string]: string;
}

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

/**
 * Manages internal framework global state
 */
export class NativeScriptGlobalState {
	events: Observable;
	launched = false;
	// used by various classes to setup callbacks to wire up global app event handling when the app instance is ready
	appEventWiring: Array<any>;
	private _appInstanceReady = false;
	private _setLaunched: () => void;
	constructor() {
		// console.log('creating NativeScriptGlobals...')
		this.events = new Observable();
		this._setLaunched = this._setLaunchedFn.bind(this);
		this.events.on('launch', this._setLaunched);
		if (profilingLevel() > 0) {
			this.events.on('displayed', () => {
				const duration = uptime();
				const end = time();
				const start = end - duration;
				profilingTrace(`Displayed in ${duration.toFixed(2)}ms`, start, end);
			});
		}
	}

	get appInstanceReady() {
		return this._appInstanceReady;
	}

	set appInstanceReady(value: boolean) {
		this._appInstanceReady = value;
		// app instance ready, wire up any app events waiting in startup queue
		if (this.appEventWiring && this.appEventWiring.length) {
			for (const callback of this.appEventWiring) {
				callback();
			}
			// cleanup
			this.appEventWiring = null;
		}
	}

	/**
	 * Ability for classes to initialize app event handling early even before the app instance is ready during boot cycle avoiding boot race conditions
	 * @param callback wire up any global event handling inside the callback
	 */
	addEventWiring(callback: () => void) {
		if (this._appInstanceReady) {
			callback();
		} else {
			if (!this.appEventWiring) {
				this.appEventWiring = [];
			}
			this.appEventWiring.push(callback);
		}
	}

	private _setLaunchedFn() {
		// console.log('NativeScriptGlobals launch fired!');
		this.launched = true;
		this.events.off('launch', this._setLaunched);
		this._setLaunched = null;
	}
}

export function installPolyfills(moduleName: string, exportNames: string[]) {
	if (global.__snapshot) {
		const loadedModule = global.loadModule(moduleName);
		exportNames.forEach((exportName) => (global[exportName] = loadedModule[exportName]));
	} else {
		exportNames.forEach((exportName) => registerOnGlobalContext(moduleName, exportName));
	}
}

export function initGlobal() {
	if (!global.NativeScriptHasInitGlobal) {
		global.NativeScriptHasInitGlobal = true;
		// init global state handler
		global.NativeScriptGlobals = new NativeScriptGlobalState();

		// ts-helpers
		// Required by V8 snapshot generator
		if (!(<any>global).__extends) {
			(<any>global).__extends = function (d, b) {
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
		const modules: Map<string, { moduleId: string; loader: ModuleLoader }> = new Map<string, { moduleId: string; loader: ModuleLoader }>();
		const modulesLoadedForUI = new Set<string>();
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

		// Cast to <any> because moduleResolvers is read-only in definitions
		(<any>global).moduleResolvers = [global.require];

		global.registerModule = function (name: string, loader: ModuleLoader): void {
			modules.set(name, { loader, moduleId: name });
		};

		global._unregisterModule = function _unregisterModule(name: string): void {
			modules.delete(name);
		};

		global._isModuleLoadedForUI = function _isModuleLoadedForUI(moduleName: string): boolean {
			return modulesLoadedForUI.has(moduleName);
		};

		global.registerWebpackModules = function registerWebpackModules(context: Context, extensionMap: ExtensionMap = {}) {
			context.keys().forEach((moduleId) => {
				const extDotIndex = moduleId.lastIndexOf('.');
				const base = moduleId.substr(0, extDotIndex);
				const originalExt = moduleId.substr(extDotIndex);
				const registerExt = extensionMap[originalExt] || defaultExtensionMap[originalExt] || originalExt;

				// We prefer source files for webpack scenarios before compilation leftovers,
				// e. g. if we get a .js and .ts for the same module, the .js is probably the compiled version of the .ts file,
				// so we register the .ts with higher priority, similar is the case with us preferring the .scss to .css
				const isSourceFile = originalExt !== registerExt;
				const registerName = base + registerExt;

				const registerWithName = (nickName: string) => {
					modules.set(nickName, {
						moduleId,
						loader: () => {
							return context(moduleId);
						},
					});
				};

				if (registerName.startsWith('./') && registerName.endsWith('.js')) {
					const jsNickNames = [
						// This is extremely short version like "main-page" that was promoted to be used with global.registerModule("module-name", loaderFunc);
						registerName.substr(2, registerName.length - 5),
						// This is for supporting module names like "./main/main-page"
						registerName.substr(0, registerName.length - 3),
						// This is for supporting module names like "main/main-page.js"
						registerName.substr(2),
					];

					jsNickNames.forEach((jsNickName) => {
						if (isSourceFile || !global.moduleExists(jsNickName)) {
							registerWithName(jsNickName);
						}
					});
				} else if (registerName.startsWith('./')) {
					const moduleNickNames = [
						// This is for supporting module names like "main/main-page.xml"
						registerName.substr(2),
					];

					moduleNickNames.forEach((moduleNickName) => {
						if (!global.moduleExists(moduleNickName)) {
							registerWithName(moduleNickName);
						}
					});
				}

				if (isSourceFile || !global.moduleExists(registerName)) {
					registerWithName(registerName);
				}
			});
		};

		global.moduleExists = function moduleExists(name: string): boolean {
			return modules.has(name);
		};

		global.loadModule = function loadModule(name: string, isUIModule = false): any {
			const moduleInfo = modules.get(name);
			if (moduleInfo) {
				if (isUIModule) {
					modulesLoadedForUI.add(moduleInfo.moduleId);
				}

				const result = moduleInfo.loader(name);

				if (result.enableAutoAccept) {
					result.enableAutoAccept();
				}

				return result;
			}

			for (const resolver of (<any>global).moduleResolvers) {
				const result = resolver(name);
				if (result) {
					modules.set(name, { moduleId: name, loader: () => result });

					return result;
				}
			}
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
			if ((<any>global).zone) {
				// Zone v0.5.* style callback wrapping
				return (<any>global).zone.bind(callback);
			}
			if ((<any>global).Zone) {
				// Zone v0.6.* style callback wrapping
				return (<any>global).Zone.current.wrap(callback);
			} else {
				return callback;
			}
		};

		(<any>global).System = {
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

		// DOM api polyfills
		global.registerModule('timer', () => require('../timer'));
		installPolyfills('timer', ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval']);

		global.registerModule('animation', () => require('../animation-frame'));
		installPolyfills('animation', ['requestAnimationFrame', 'cancelAnimationFrame']);

		global.registerModule('ui-dialogs', () => require('../ui/dialogs'));
		installPolyfills('ui-dialogs', ['alert', 'confirm', 'prompt', 'login', 'action']);

		global.registerModule('text', () => require('../text'));
		installPolyfills('text', ['TextDecoder', 'TextEncoder']);

		global.registerModule('xhr', () => require('../xhr'));
		installPolyfills('xhr', ['XMLHttpRequest', 'FormData', 'Blob', 'File', 'FileReader']);

		global.registerModule('fetch', () => require('../fetch'));
		installPolyfills('fetch', ['fetch', 'Headers', 'Request', 'Response']);

		// global.registerModule('abortcontroller', () => require('../abortcontroller'));
		// installPolyfills('abortcontroller', ['AbortController', 'AbortSignal']);

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
	}
}

declare var jest: any;
function isTestingEnv() {
	return typeof jest !== 'undefined';
}

if (!global.NativeScriptHasInitGlobal && !isTestingEnv()) {
	initGlobal();
}
