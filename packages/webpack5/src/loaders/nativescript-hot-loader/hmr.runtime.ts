// @ts-nocheck
// This is a runtime module - included by nativescript-hot-loader
// this file should not include external dependencies
// ---

if (module.hot) {
	let hash = __webpack_require__.h();
	let hmrBootEmittedSymbol = Symbol.for('HMRBootEmitted');
	let originalLiveSyncSymbol = Symbol.for('OriginalLiveSync');
	let hmrRuntimeLastLiveSyncSymbol = Symbol.for('HMRRuntimeLastLiveSync');

	const logVerbose = (title: string, ...info: any) => {
		if (__NS_ENV_VERBOSE__) {
			console.log(`[HMR][Verbose] ${title}`);

			if (info?.length) {
				console.log(...info);
				console.log('---');
			}
		}
	};

	const setStatus = (
		hash: string,
		status: 'success' | 'failure' | 'boot',
		message?: string,
		...info: any
	): boolean => {
		// format is important - CLI expects this exact format
		console.log(`[HMR][${hash}] ${status} | ${message}`);
		if (info?.length) {
			logVerbose('Additional Info', info);
		}

		// return true if operation was successful
		return status === 'success';
	};

	const applyOptions = {
		ignoreUnaccepted: false,
		ignoreDeclined: false,
		ignoreErrored: false,
		onDeclined(info) {
			setStatus(hash, 'failure', 'A module has been declined.', info);
		},
		onUnaccepted(info) {
			setStatus(hash, 'failure', 'A module has not been accepted.', info);
		},
		onAccepted(info) {
			// console.log('accepted', info)
			logVerbose('Module Accepted', info);
		},
		onDisposed(info) {
			// console.log('disposed', info)
			logVerbose('Module Disposed', info);
		},
		onErrored(info) {
			setStatus(hash, 'failure', 'A module has errored.', info);
		},
	};

	// Important: Keep as function and not fat arrow; at the moment hermes does not support them
	const checkAndApply = async function () {
		hash = __webpack_require__.h();
		const modules = await module.hot.check().catch((error) => {
			return setStatus(
				hash,
				'failure',
				'Failed to check.',
				error.message || error.stack,
			);
		});

		if (!modules) {
			logVerbose('No modules to apply.');
			return false;
		}

		const appliedModules = await module.hot
			.apply(applyOptions)
			.catch((error) => {
				return setStatus(
					hash,
					'failure',
					'Failed to apply.',
					error.message || error.stack,
				);
			});

		if (!appliedModules) {
			logVerbose('No modules applied.');
			return false;
		}

		return setStatus(hash, 'success', 'Successfully applied update.');
	};

	const requireExists = (path) => {
		try {
			global['require'](path);
			return true;
		} catch (err) {
			return false;
		}
	};

	const hasUpdate = () => {
		return [
			`~/bundle.${__webpack_hash__}.hot-update.json`,
			`~/runtime.${__webpack_hash__}.hot-update.json`,
		].some((path) => requireExists(path));
	};

	if (global.__onLiveSync !== global[hmrRuntimeLastLiveSyncSymbol]) {
		// we store the original liveSync here in case this code runs again
		// which happens when you module.hot.accept() the main file
		global[originalLiveSyncSymbol] = global.__onLiveSync;
	}
	global[hmrRuntimeLastLiveSyncSymbol] = async function () {
		logVerbose('LiveSync');

		if (!hasUpdate()) {
			return false;
		}

		if (!(await checkAndApply())) {
			return false;
		}

		await global[originalLiveSyncSymbol]();
	};

	global.__onLiveSync = global[hmrRuntimeLastLiveSyncSymbol];
	if (!global[hmrBootEmittedSymbol]) {
		global[hmrBootEmittedSymbol] = true;
		setStatus(hash, 'boot', 'HMR Enabled - waiting for changes...');
	}
}
