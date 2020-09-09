import { fromObject } from '@nativescript/core/data/observable';

export function onLoaded(args) {
	const page = args.object;
	page.bindingContext = fromObject({
		prefix: 'This is a prefix for: ',
		languageData: [
			{
				name: 'English',
			},
			{
				name: 'Portuguese',
			},
			{
				name: 'Spanish',
			},
			{
				name: 'Russian',
			},
			{
				name: 'Greek',
			},
		],
	});
}
