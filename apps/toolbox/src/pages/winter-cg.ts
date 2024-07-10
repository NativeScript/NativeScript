import { Page, EventData, Application, File, Folder, knownFolders, path, getFileAccess, Utils, Screen, Http, AndroidDirectory, ImageSource, alert } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	run();
}

function run() {
	console.log(crypto.randomUUID());

	const array = new Uint32Array(10);
	crypto.getRandomValues(array);

	console.log('Your lucky numbers:');
	for (const num of array) {
		console.log(num);
	}

	const text = 'An obscure body in the S-K System, your majesty. The inhabitants refer to it as the planet Earth.';

	async function digestMessage(message) {
		const encoder = new TextEncoder();
		const data = encoder.encode(message);
		const hash = await crypto.subtle.digest('SHA-256', data);
		return hash;
	}

	digestMessage(text).then((digestBuffer) => {
		console.log(digestBuffer.byteLength);
		console.log(new Uint8Array(digestBuffer));
	});

	gen_hmac();

	gen_rsa_oaep();
}

export function encodeDecode() {
	const encoded = btoa('Osei');

	console.log(encoded);

	console.log(atob(encoded) === 'Osei');
}

async function gen_hmac() {
	let message = 'Hello World';
	let enc = new TextEncoder();
	const encoded = enc.encode(message);

	const key = await crypto.subtle.generateKey(
		{
			name: 'HMAC',
			hash: { name: 'SHA-512' },
		},
		true,
		['sign', 'verify'],
	);

	const signature = await crypto.subtle.sign('HMAC', key, encoded);

	let result = await crypto.subtle.verify('HMAC', key, signature, encoded);

	console.log('gen_hmac is valid? ', result);
}

async function gen_rsa_oaep() {
	let message = 'Hello World';
	let enc = new TextEncoder();
	const encoded = enc.encode(message);

	const kp = await crypto.subtle.generateKey(
		{
			name: 'RSA-OAEP',
			modulusLength: 4096,
			publicExponent: new Uint8Array([1, 0, 1]),
			hash: 'SHA-256',
		},
		true,
		['encrypt', 'decrypt'],
	);

	try {
		const ciphertext = await crypto.subtle.encrypt(
			{
				name: 'RSA-OAEP',
			},
			kp.publicKey,
			encoded,
		);
		let decrypted = await crypto.subtle.decrypt(
			{
				name: 'RSA-OAEP',
			},
			kp.privateKey,
			ciphertext,
		);

		let dec = new TextDecoder();
		const decryptedValue = dec.decode(decrypted);

		console.log('decryptedValue', decryptedValue, decryptedValue === message);
	} catch (error) {
		console.log('gen: error', error);
	}
}
