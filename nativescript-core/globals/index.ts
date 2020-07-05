export let hasInitGlobal = false;

function registerOnGlobalContext(moduleName: string, exportName: string): void {
	Object.defineProperty(global, exportName, {
		get: function () {
			// We do not need to cache require() call since it is already cached in the runtime.
			let m = global.loadModule(moduleName);

			// Redefine the property to make sure the above code is executed only once.
			let resolvedValue = m[exportName];
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
		exportNames.forEach(
			(exportName) => (global[exportName] = loadedModule[exportName])
		);
	} else {
		exportNames.forEach((exportName) =>
			registerOnGlobalContext(moduleName, exportName)
		);
	}
}

export function initGlobal() {
	console.log("initPolyfills called, init:", hasInitGlobal);
	if (!hasInitGlobal) {
		hasInitGlobal = true;
		// apply global polyfills first
		require("./core");

		// DOM api polyfills
		global.registerModule("timer", () => require("../timer"));
		installPolyfills("timer", [
			"setTimeout",
			"clearTimeout",
			"setInterval",
			"clearInterval",
		]);

		global.registerModule("animation", () => require("../animation-frame"));
		installPolyfills("animation", [
			"requestAnimationFrame",
			"cancelAnimationFrame",
		]);

		global.registerModule("ui-dialogs", () => require("../ui/dialogs"));
		installPolyfills("ui-dialogs", [
			"alert",
			"confirm",
			"prompt",
			"login",
			"action",
		]);

		global.registerModule("text", () => require("../text"));
		installPolyfills("text", ["TextDecoder", "TextEncoder"]);

		global.registerModule("xhr", () => require("../xhr"));
		installPolyfills("xhr", [
			"XMLHttpRequest",
			"FormData",
			"Blob",
			"File",
			"FileReader",
		]);

		global.registerModule("fetch", () => require("../fetch"));
		installPolyfills("fetch", ["fetch", "Headers", "Request", "Response"]);

		// Custom decorators
		require("./decorators");
	}
}
