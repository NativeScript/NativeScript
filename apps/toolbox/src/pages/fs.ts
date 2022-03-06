import { EventData, Page, knownFolders, path, File } from '@nativescript/core';
import { open } from '@nativescript/core/file-system/v2';
let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
}

export function openRandomTmp() {
	File.fromPath(path.join(knownFolders.temp().path, 'random.txt'));
	open(path.join(knownFolders.temp().path, 'random.txt'), (error, fd) => {
		console.info('openRandomTmp', error, fd);
	});
}
