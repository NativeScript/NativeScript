import { getViewById, View, Page, Button, SegmentedBar, SegmentedBarItem, Label, Animation, AnimationDefinition } from '@nativescript/core';

export function easeAnimate(args) {
	const clicked = args.object as Button;
	const page: Page = clicked.page;
	const target = getViewById(page, 'target') as Label;
	const select = getViewById(page, 'select') as SegmentedBar;
	const item: SegmentedBarItem = select.items[select.selectedIndex];
	const easeType: string = clicked.text;
	const extent = 128;
	let duration = easeType === 'spring' ? 800 : 500;
	let delay = easeType === 'spring' ? 0 : 200;
	let animateKey: string = null;
	let animateValueTo: any = null;
	let animateValueFrom: any = null;

	switch (item.title) {
		case 'height':
			animateKey = 'height';
			target.originX = target.originY = 0;
			animateValueTo = 0;
			animateValueFrom = extent;
			break;
		case 'width':
			animateKey = 'width';
			target.originX = target.originY = 0;
			animateValueTo = 0;
			animateValueFrom = extent;
			break;
		case 'opacity':
			animateKey = 'opacity';
			animateValueTo = 0;
			animateValueFrom = 1;
			break;
		case 'color':
			animateKey = 'backgroundColor';
			animateValueTo = 'blue';
			animateValueFrom = 'purple';
			break;
		case 'rotate':
			animateKey = 'rotate';
			target.originX = target.originY = 0.5;
			animateValueTo = 180;
			animateValueFrom = 0;
			break;
		case 'scale':
			animateKey = 'scale';
			target.originX = target.originY = 0.5;
			animateValueTo = { x: 1.5, y: 1.5 };
			animateValueFrom = { x: 1, y: 1 };
			break;
	}
	target
		.animate({
			[animateKey]: animateValueTo,
			duration,
			curve: easeType,
		})
		.then(() => {
			return target.animate({
				[animateKey]: animateValueFrom,
				delay,
				duration,
				curve: easeType,
			});
		})
		.catch((e) => console.log(e));
}
