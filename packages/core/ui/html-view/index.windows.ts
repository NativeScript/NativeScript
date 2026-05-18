export * from './html-view-common';

import { HtmlViewBase } from './html-view-common';

export class HtmlView extends HtmlViewBase {
	get windows(): undefined {
		return undefined;
	}
}
