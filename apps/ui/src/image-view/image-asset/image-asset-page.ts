import * as vmModule from './view-model-page';

const viewModel = vmModule.imageViewModel;

export function pageLoaded(args) {
	const page = args.object;
	page.bindingContext = viewModel;
}
