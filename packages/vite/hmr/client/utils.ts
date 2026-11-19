declare const __NS_ENV_VERBOSE__: boolean | undefined;

// Verbose flag, the one copy for client modules. Served modules get no
// `define` substitution: the identifier resolves to the global `/@vite/env`
// installs. Read defensively because unit tests have neither.
export const ENV_VERBOSE: boolean = (() => {
	try {
		return typeof __NS_ENV_VERBOSE__ === 'boolean' ? __NS_ENV_VERBOSE__ : false;
	} catch {
		return false;
	}
})();
