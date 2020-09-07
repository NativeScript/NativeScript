import { Page } from '@nativescript/core/ui/page';
import { ImageSource } from '@nativescript/core/image-source';
import { GridLayout, ItemSpec } from '@nativescript/core/ui/layouts/grid-layout';
import { StackLayout } from '@nativescript/core/ui/layouts/stack-layout';
import { Label } from '@nativescript/core/ui/label';
import { Image } from '@nativescript/core/ui/image';

export function createPage() {
	var stack = new StackLayout();
	var grid = new GridLayout();
	stack.addChild(grid);

	grid.addColumn(new ItemSpec(80, 'pixel'));
	grid.addColumn(new ItemSpec(1, 'star'));
	grid.addRow(new ItemSpec(1, 'auto'));
	grid.addRow(new ItemSpec(1, 'auto'));

	var defaultImageSource = ImageSource.fromFileSync(__dirname + '/test.png');

	var img = new Image();
	img.src = defaultImageSource;

	img.width = 80;
	img.height = 80;
	img.verticalAlignment = 'bottom';
	GridLayout.setRowSpan(img, 2);
	grid.addChild(img);

	var titleLabel = new Label();
	titleLabel.textWrap = true;
	titleLabel.text = 'some text goes here';
	GridLayout.setColumn(titleLabel, 1);
	grid.addChild(titleLabel);

	var commentsLabel = new Label();
	commentsLabel.text = 'comments';
	commentsLabel.verticalAlignment = 'bottom';
	GridLayout.setRow(commentsLabel, 1);
	GridLayout.setColumn(commentsLabel, 1);
	grid.addChild(commentsLabel);

	var page = new Page();
	page.content = stack;
	page.css = 'GridLayout { background-color: yellow } image { background-color: green } label { background-color: red } stackpnael { background-color: pink }';

	return page;
}
