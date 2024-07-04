import { Page, EventData, Application, File, Folder, knownFolders, path, getFileAccess, Utils, Screen, Http, AndroidDirectory, ImageSource, alert } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	run();
}

function run() {
	console.log(crypto.randomUUID());

	const buf = new BigUint64Array(3);

	crypto.getRandomValues(buf);

	console.log(buf);

	const text = 'An obscure body in the S-K System, your majesty. The inhabitants refer to it as the planet Earth.';

	async function digestMessage(message) {
		const encoder = new TextEncoder();
		const data = encoder.encode(message);
		console.time('digestMessage');
		const hash = await crypto.subtle.digest('SHA-256', data);
		console.timeEnd('digestMessage');
		return hash;
	}

	digestMessage(text).then((digestBuffer) => {
		console.log(digestBuffer.byteLength);
		console.log(new Uint8Array(digestBuffer));
	});

	// async function a() {
	// 	const key = await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, true, ['sign', 'verify']);
	//     console.log(key.algorithm);
	// }

	// a();
}

export function encodeDecode() {
	const encoded = btoa('Osei');

	console.log(encoded);

	console.log(atob(encoded) === 'Osei');
}
