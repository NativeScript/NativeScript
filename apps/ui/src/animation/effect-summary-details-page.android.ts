import { getViewById, View, Page, Button, SegmentedBar, SegmentedBarItem, Label, Animation, AnimationDefinition, Screen, TextView } from '@nativescript/core';
// import * as uiUtils from "@nativescript/core/ui/utils";
// import { isIOS } from "@nativescript/core/platform";

let toggle = false;

export function pageLoaded(args) {
	const page = args.object;
	const screenHeight = Screen.mainScreen.heightDIPs;
	const screenYCenter = screenHeight / 2;
	page.bindingContext = {
		screenHeight,
		screenYCenter,
		detailsHeight: 96,
		summary: 'Space! 🌌',
		ipsum: `Houston, Tranquillity Base here. The Eagle has landed.

For those who have seen the Earth from space, and for the hundreds and perhaps thousands more who will, the experience most certainly changes your perspective. The things that we share in our world are far more valuable than those which divide us.

As we got further and further away, it [the Earth] diminished in size. Finally it shrank to the size of a marble, the most beautiful you can imagine. That beautiful, warm, living object looked so fragile, so delicate, that if you touched it with a finger it would crumble and fall apart. Seeing this has to change a man.

What was most significant about the lunar voyage was not that man set foot on the Moon but that they set eye on the earth.

Spaceflights cannot be stopped. This is not the work of any one man or even a group of men. It is a historical process which mankind is carrying out in accordance with the natural laws of human development.

NASA is not about the ‘Adventure of Human Space Exploration’…We won’t be doing it just to get out there in space – we’ll be doing it because the things we learn out there will be making life better for a lot of people who won’t be able to go.

Science has not yet mastered prophecy. We predict too much for the next year and yet far too little for the next 10.

Science cuts two ways, of course; its products can be used for both good and evil. But there"s no turning back from science. The early warnings about technological dangers also come from science.

Here men from the planet Earth first set foot upon the Moon. July 1969 AD. We came in peace for all mankind.

When I orbited the Earth in a spaceship, I saw for the first time how beautiful our planet is. Mankind, let us preserve and increase this beauty, and not destroy it!

http://spaceipsum.com`,
	};
}

export function theFinalFrontier(args) {
	const clicked = args.object as View;
	const page: Page = clicked.page;
	const details = getViewById(page, 'details') as TextView;
	const ctx = page.bindingContext;
	const detailHeaderHeight: number = ctx.detailsHeight;

	let statusBar = 0;
	// if (isIOS) {
	//     statusBar = uiUtils.ios.getStatusBarHeight();
	// }

	const textViewHeight: number = ctx.screenHeight - statusBar - detailHeaderHeight;
	const transitions = [
		{
			target: clicked,
			height: toggle ? '100%' : detailHeaderHeight,
			duration: 200,
			curve: 'ease',
		},
		{
			target: details,
			opacity: toggle ? 0 : 1,
			height: textViewHeight,
			translate: {
				x: 0,
				y: toggle ? 50 : 0,
			},
			duration: 200,
			curve: 'easeIn',
		},
	];
	const animationSet = new Animation(transitions, false);
	animationSet.play();
	toggle = !toggle;
}
