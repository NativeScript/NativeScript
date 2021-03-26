// @ts-nocheck
// This is a runtime module - included by nativescript-hot-loader
// todo: log correct message format for CLI to pick up
// todo: build CLI service to listen for state changes
// ---

import type { IHMRStatusData } from "../../bin/devServer";
import { Http, Device } from '@nativescript/core'

const uuid = Device.uuid;

console.log(`[HMR] uuid = ${uuid}`)

let __NS_DEV_HOST_URL__;
Promise.race(__NS_DEV_HOST_IPS__
	.map(ip => `http://${ip}:8238/`)
	.map(async url => {
		await Http.request({
			method: 'get',
			url: url + 'ping'
		})

		return url;
	})).then(winner => {
	__NS_DEV_HOST_URL__ = winner
})

let __SEQ = 0;

if (module.hot) {
	module.hot.dispose(() => {
		console.log('Disposing entry file?!')
		// require('@nativescript/core').Application.resetRootView()
	})

	const send = (content: object) => {
		if (__NS_DEV_HOST_URL__) {
			Http.request({
				method: 'post',
				url: __NS_DEV_HOST_URL__,
				content: JSON.stringify(content)
			}).catch(err => {
				console.log(err)
			})
		}
	}

	const sendStatus = (status, hash) => {
		send({
			seq: __SEQ++,
			uuid,
			hash,
			status
		} as IHMRStatusData)
	}

	const orig = global.__onLiveSync
	const log = (type, info) => {
		// console.log(`[nds] HMR ${type}:`, info)
	}

	log('init')

	module.hot.addStatusHandler(status => {
		log('status', status)
		// sendStatus(status)
	})

	global.__onLiveSync = async function () {
		// handle hot updates on LiveSync
		console.log('~~~ livesync ~~~')

		log('checking')

		const hash = __webpack_require__.h();

		await module.hot.check().catch(err => {
			log('checking-failed', err)
			sendStatus('failure', hash)
		});

		log('checked')
		log('applying')

		await module.hot.apply({
			ignoreUnaccepted: false,
			ignoreDeclined: false,
			ignoreErrored: false,

			onDeclined(info) {
				log('declined', info)
				sendStatus('failure', hash);
			},
			onUnaccepted(info) {
				log('unaccepted', info)
				sendStatus('failure', hash);
			},
			onAccepted(info) {
				log('accepted', info)
			},
			onDisposed(info) {
				log('disposed', info)
			},
			onErrored(info) {
				log('errored', info)
				sendStatus('failure', hash);
			}
		}).then(() => {
			sendStatus('success', hash)
		}).catch((err) => {
			sendStatus('failure', hash)
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
