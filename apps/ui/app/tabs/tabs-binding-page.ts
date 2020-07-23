import { TabsBindingNavigationViewModel } from './tabs-binding-view-model';

export function tabsLoaded(args) {
	const page = args.object.page;
	page.bindingContext = new TabsBindingNavigationViewModel();
}
