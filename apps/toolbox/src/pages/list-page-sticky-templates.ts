import { EventData, Observable, Page } from '@nativescript/core';

interface CountryItem {
	name: string;
	code: string;
	flag: string;
	favorite?: boolean;
}
type CountryGroups = Array<{ title: string; items: CountryItem[] }>;

export class ListPageStickyTemplatesModel extends Observable {
	// Section lengths intentionally vary (including single-item sections) so a
	// flat-index template lookup cannot line up with the correct per-section result.
	groups: CountryGroups = [
		{
			title: 'A',
			items: [
				{ name: 'Argentina', code: '(AR)', flag: '🇦🇷' },
				{ name: 'Australia', code: '(AU)', flag: '🇦🇺', favorite: true },
				{ name: 'Austria', code: '(AT)', flag: '🇦🇹' },
				{ name: 'Azerbaijan', code: '(AZ)', flag: '🇦🇿' },
			],
		},
		{
			title: 'B',
			items: [
				{ name: 'Belgium', code: '(BE)', flag: '🇧🇪' },
				{ name: 'Brazil', code: '(BR)', flag: '🇧🇷' },
			],
		},
		{
			title: 'C',
			items: [
				{ name: 'Canada', code: '(CA)', flag: '🇨🇦', favorite: true },
				{ name: 'Chile', code: '(CL)', flag: '🇨🇱' },
				{ name: 'Colombia', code: '(CO)', flag: '🇨🇴' },
				{ name: 'Croatia', code: '(HR)', flag: '🇭🇷' },
				{ name: 'Cyprus', code: '(CY)', flag: '🇨🇾' },
			],
		},
		{
			title: 'D',
			items: [{ name: 'Denmark', code: '(DK)', flag: '🇩🇰' }],
		},
		{
			title: 'E',
			items: [{ name: 'Ecuador', code: '(EC)', flag: '🇪🇨', favorite: true }],
		},
		{
			title: 'F',
			items: [
				{ name: 'Fiji', code: '(FJ)', flag: '🇫🇯' },
				{ name: 'Finland', code: '(FI)', flag: '🇫🇮' },
				{ name: 'France', code: '(FR)', flag: '🇫🇷', favorite: true },
			],
		},
		{
			title: 'G',
			items: [
				{ name: 'Germany', code: '(DE)', flag: '🇩🇪' },
				{ name: 'Ghana', code: '(GH)', flag: '🇬🇭', favorite: true },
				{ name: 'Greece', code: '(GR)', flag: '🇬🇷' },
				{ name: 'Guyana', code: '(GY)', flag: '🇬🇾' },
			],
		},
	];

	selectItemTemplate(item: CountryItem, index: number, items: Array<CountryItem>) {
		if (item?.favorite) {
			return 'favorite';
		}
		return index === items.length - 1 ? 'last' : 'main';
	}

	onItemTap(args): void {
		const group = this.groups[args.section];
		const item = group?.items[args.index];
		if (!item) {
			console.log(`Tapped section ${args.section} row ${args.index}: no data item found!`);
			return;
		}
		const expected = this.selectItemTemplate(item, args.index, group.items);
		console.log(`Tapped section ${args.section} row ${args.index}: ${item.name} — expected template '${expected}'`);
	}
}

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new ListPageStickyTemplatesModel();
}
