// @ts-nocheck
// This is a runtime module - included by nativescript-hot-loader
// this file should not include external dependencies
// ---

if (module.hot) {
	const setStatus = (hash: string, status: 'success' | 'failure') => {
		// format is important - CLI expects this exact format
		console.log(`[HMR][${hash}] ${status}`)
	}
	const originalOnLiveSync = global.__onLiveSync
	global.__onLiveSync = async function () {
		const hash = __webpack_require__.h();
		await module.hot.check().catch(err => {
			setStatus(hash, 'failure')
		});
		await module.hot.apply({
			ignoreUnaccepted: false,
			ignoreDeclined: false,
			ignoreErrored: false,
			onDeclined(info) {
				setStatus(hash, 'failure')
			},
			onUnaccepted(info) {
				setStatus(hash, 'failure')
			},
			onAccepted(info) {
				// console.log('accepted', info)
			},
			onDisposed(info) {
				// console.log('disposed', info)
			},
			onErrored(info) {
				setStatus(hash, 'failure')
			}
		}).then(() => {
			setStatus(hash, 'success')
		}).catch((err) => {
			setStatus(hash, 'failure')
		})

		setTimeout(() => {
			originalOnLiveSync();
		})
	};
}
