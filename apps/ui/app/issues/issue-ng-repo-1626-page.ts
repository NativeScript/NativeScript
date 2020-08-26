import { fromObject } from '@nativescript/core/data/observable';

export function onLoaded(args) {
	const page = args.object;
	page.bindingContext = fromObject({
		items: [
			{ id: 1, name: 'Ter Stegen', role: 'Goalkeeper' },
			{ id: 3, name: 'Piqué', role: 'Defender' },
			{ id: 4, name: 'I. Rakitic', role: 'Midfielder' },
			{ id: 5, name: 'Sergio', role: 'Midfielder' },
			{ id: 6, name: 'Denis Suárez', role: 'Midfielder\nSecond line for the sake of testing' },
			{ id: 7, name: 'Arda', role: 'Midfielder' },
			{ id: 8, name: 'A. Iniesta', role: 'Midfielder' },
			{ id: 9, name: 'Suárez', role: 'Forward' },
			{ id: 10, name: 'Messi', role: 'Forward' },
			{ id: 11, name: 'Neymar', role: 'Forward\nSecond line for the sake of testing' },
			{ id: 12, name: 'Rafinha', role: 'Midfielder\nSecond line for the sake of testing' },
			{ id: 13, name: 'Cillessen', role: 'Goalkeeper\nSecond line for the sake of testing' },
			{ id: 14, name: 'Mascherano', role: 'Defender' },
			{ id: 17, name: 'Paco Alcácer', role: 'Forward' },
			{ id: 18, name: 'Jordi Alba', role: 'Defender\nSecond line for the sake of testing' },
			{ id: 19, name: 'Digne', role: 'Defender' },
			{ id: 20, name: 'Sergi Roberto', role: 'Midfielder\nSecond line for the sake of testing' },
			{ id: 21, name: 'André Gomes', role: 'Midfielder\nSecond line for the sake of testing' },
			{ id: 22, name: 'Aleix Vidal', role: 'Midfielder' },
			{ id: 23, name: 'Umtiti', role: 'Defender' },
			{ id: 24, name: 'Mathieu', role: 'Defender' },
			{ id: 25, name: 'Masip', role: 'Goalkeeper' },
		],
	});
}
