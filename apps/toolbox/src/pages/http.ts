import { Page, EventData, Application, File, Folder, knownFolders, path, getFileAccess, Utils, Http } from '@nativescript/core';
import { AbortController } from '@nativescript/core/abortcontroller';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
}

export async function makeRequest(args) {
	try {
		// const result = await fetch('https://httpbin.org/get');
		const controller = new AbortController();
		console.log('getting json with okhttp!');
		// const result = await Http.getJSON('https://httpbin.org/get')
		setTimeout(() => {
			controller.abort();
		}, 0);
		const result = await Http.request({
			method: 'GET',
			url: 'https://httpbin.org/get',
			signal: controller.signal as any,
		});

		console.log(result);
	} catch (e) {
		console.log(e.stack);
	}
}
