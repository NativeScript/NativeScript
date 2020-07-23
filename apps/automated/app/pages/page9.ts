import { Page } from '@nativescript/core/ui/page';
import { ImageSource } from '@nativescript/core/image-source';
import { GridLayout, ItemSpec } from '@nativescript/core/ui/layouts/grid-layout';
import { Image } from '@nativescript/core/ui/image';

export function createPage() {
	var grid = new GridLayout();

	grid.addColumn(new ItemSpec(1, 'auto'));
	grid.addColumn(new ItemSpec(1, 'star'));

	grid.addRow(new ItemSpec(1, 'auto'));
	grid.addRow(new ItemSpec(1, 'star'));

	var image = new Image();
	image.stretch = 'fill';
	image.verticalAlignment = 'bottom';
	image.horizontalAlignment = 'center';

	image.imageSource = ImageSource.fromFileSync(__dirname + '/test.png');
	grid.addChild(image);

	var page = new Page();
	page.content = grid;
	page.css = 'GridLayout { background-color: pink } image { background-color: green }';

	return page;
}
