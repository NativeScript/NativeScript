// @ts-nocheck
// This is a runtime module - included by nativescript-hot-loader
// todo: log correct message format for CLI to pick up
// todo: build CLI service to listen for state changes
// ---
import { Http } from '@nativescript/core'

let __NS_DEV_HOST_URL__;
Promise.race(__NS_DEV_HOST_IPS__
	.map(ip => `http://${ip}:8238/`)
	.map(async url => {
		await Http.request({
			method: 'get',
			url
		})

		return url;
	})).then(winner => {
	__NS_DEV_HOST_URL__ = winner
})

if(module.hot) {
	module.hot.dispose(() => {
		console.log('Disposing entry file?!')
		// require('@nativescript/core').Application.resetRootView()
	})

	const orig = global.__onLiveSync
	const log = (type, info) => {
		console.log(`[nds] HMR ${type}:`, info)
		// console.log(__NS_DEV_HOST_IPS__[0])

		if(__NS_DEV_HOST_URL__) {
			Http.request({
				method: 'post',
				url: __NS_DEV_HOST_URL__,
				content: JSON.stringify({
					type,
					info
				})
			}).catch(err => {
				console.log(err)
			})
		}
	}

	log('init')

	module.hot.addStatusHandler(status => {
		log('status', status)
	})

	global.__onLiveSync = async function () {
		// handle hot updated on LiveSync
		console.log('~~~ livesynced ~~~')

		log('checking')
		await module.hot.check().catch(err => {
			log('checking-failed', err)
		});
		log('checked')
		log('applying')
		await module.hot.apply({
			ignoreUnaccepted: false,
			ignoreDeclined: false,
			ignoreErrored: false,

			onDeclined(info) {
				log('declined', info)
			},
			onUnaccepted(info) {
				log('unaccepted', info)
			},
			onAccepted(info) {
				log('accepted', info)
			},
			onDisposed(info) {
				log('disposed', info)
			},
			onErrored(info) {
				log('errored', info)
			}
		}).catch((err) => {
			log('applying-failed', err)
		})
		// log('applying')
		// await module.hot.apply()
		log('applying-done')
		// await module.hot.apply()
		setTimeout(() => {
			orig();
		});
	};

	// global.__onLiveSync()
}
