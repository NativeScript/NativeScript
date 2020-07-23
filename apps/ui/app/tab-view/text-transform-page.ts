import { Page } from '@nativescript/core/ui/page';

const CSS = `
#tab1 { text-transform: none; }
#tab2 { text-transform: lowercase; }
#tab3 { text-transform: uppercase; }
#tab4 { text-transform: capitalize; }
`;

export function applyTap(args) {
	var page = <Page>args.object.page;
	page.css = CSS;
}

export function resetTap(args) {
	var page = <Page>args.object.page;
	page.css = '';
}
