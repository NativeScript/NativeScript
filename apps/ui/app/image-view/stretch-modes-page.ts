import { Image, Stretch } from '@nativescript/core/ui/image';
import { Label } from '@nativescript/core/ui/label';
import { LayoutBase } from '@nativescript/core/ui/layouts/layout-base';

const sources = [
	{ w: 32, h: 18, src: 'i32x18' },
	{ w: 32, h: 32, src: 'i32x32' },
	{ w: 18, h: 32, src: 'i18x32' },
].map(({ w, h, src }) => ({ w, h, src: `res://${src}` }));
const stretchModes: Stretch[] = ['none', 'aspectFill', 'aspectFit', 'fill'];
const widths = [+8, 0, -8];
const heights = [+8, 0, -8];

export function navigatingTo(args) {
	const variants: { src: string; stretch: Stretch; width: number; height: number }[] = [];

	// Better way for cartesian product?
	sources.forEach((src) => stretchModes.forEach((stretch) => widths.forEach((width) => heights.forEach((height) => variants.push({ src: src.src, stretch, width: src.w + width, height: src.h + height })))));

	const grid: LayoutBase = args.object.getViewById('root');
	const label: Label = args.object.getViewById('label');
	let lastTap = null;
	variants.forEach(({ src, stretch, width, height }) => {
		const image = new Image();
		image.src = src;

		image.backgroundColor = 'yellow';
		image.width = <any>(width + 'px');
		image.height = <any>(height + 'px');

		image.stretch = stretch;
		image.borderColor = 'yellow';
		image.margin = '1px';
		(<any>image).tag = `${width} ${height} ${stretch} ${src.substr(src.lastIndexOf('/') + 1)}`;
		image.addEventListener('tap', (args: any) => {
			if (lastTap) {
				lastTap.borderColor = 'yellow';
			}
			label.text = args.object.tag;
			args.object.borderColor = 'red';
			lastTap = args.object;
		});
		grid.addChild(image);
	});
}
