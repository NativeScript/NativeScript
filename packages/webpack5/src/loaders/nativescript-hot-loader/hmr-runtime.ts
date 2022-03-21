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
		let originalOnLiveSync = global.__onLiveSync;

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

				if (info.outdatedModules.includes(info.moduleId)) {
					const splitPath = info.moduleId.split('.');
					const ext = splitPath[splitPath.length - 1];
					const onLiveSyncCallback = originalOnLiveSync;

					originalOnLiveSync = function () {
						originalOnLiveSync = onLiveSyncCallback;
						onLiveSyncCallback({ type: extMap[ext], path: info.moduleId });
						// Code here will not be reached during first live-sync call
					};
				}
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
				return setStatus(
					hash,
					'failure',
					'Failed to check.',
					error.message || error.stack
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
						error.message || error.stack
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

		global.__onLiveSync = async function () {
			logVerbose('LiveSync');

			if (!hasUpdate()) {
				return;
			}

			await checkAndApply();
			originalOnLiveSync();
		};
	}
}
