export * from './search-bar-common';

import { SearchBarBase } from './search-bar-common';

// TODO(linux): placeholder until the GTK implementation lands
export class SearchBar extends SearchBarBase {
	createNativeView() {
		return gtk_label_new('SearchBar');
	}

	public dismissSoftInput() {}
}
