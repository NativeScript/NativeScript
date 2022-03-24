// This is a runtime module - included by nativescript-hot-loader
// this file should not include external dependencies

// @ts-nocheck
export function includeHmrInRuntime() {
	if (module.hot) {
		const extMap = {
			css: 'style',
			scss: 'style',
			less: 'style',
			js: 'script',
			ts: 'script',
			xml: 'markup',
			html: 'markup',
		};

		let hash = __webpack_require__.h();

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
			status: 'success' | 'failure',
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

		const checkAndApply = async () => {
			hash = __webpack_require__.h();
			const modules = await module.hot.check().catch((error) => {
				setStatus(
					hash,
					'failure',
					'Failed to check.',
					error.message || error.stack
				);
				return null;
			});

			if (!modules) {
				logVerbose('No modules to apply.');
				return null;
			}

			const appliedModules = await module.hot
				.apply(applyOptions)
				.catch((error) => {
					setStatus(
						hash,
						'failure',
						'Failed to apply.',
						error.message || error.stack
					);
					return null;
				});

			if (!appliedModules || !appliedModules.length) {
				logVerbose('No modules applied.');
				return null;
			}

			setStatus(hash, 'success', 'Successfully applied update.');
			return appliedModules;
		};

		const requireExists = (path) => {
			try {
				__non_webpack_require__(path);
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

		const originalOnLiveSync = global.__onLiveSync;
		global.__onLiveSync = async function () {
			logVerbose('LiveSync');

			if (!hasUpdate()) {
				return;
			}

			let context;
			const appliedModules = await checkAndApply();

			// Append context to live-sync callback
			if (appliedModules) {
				const path = appliedModules[0];
				const splitPath = path.split('.');
				const ext = splitPath[splitPath.length - 1];
				context = { type: extMap[ext], path };
			}
			originalOnLiveSync(context);
		};
	}
}
