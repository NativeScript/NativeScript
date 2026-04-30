import { Observable, EventData, Page, View, Screen } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new FilterModel();
}

export class FilterModel extends Observable {
	width = 0;
	height = 0;
	constructor() {
		super();
		this.width = Screen.mainScreen.widthPixels;
		this.height = Screen.mainScreen.heightPixels;
	}

	get blurSrc() {
		return `https://picsum.photos/seed/blur/${this.width}/${this.height}`;
	}

	get greySrc() {
		return `https://picsum.photos/seed/grey/${this.width}/${this.height}`;
	}

	get sepiaSrc() {
		return `https://picsum.photos/seed/sepia/${this.width}/${this.height}`;
	}

	get brightnessSrc() {
		return `https://picsum.photos/seed/brightness/${this.width}/${this.height}`;
	}

	get contrastSrc() {
		return `https://picsum.photos/seed/contrast/${this.width}/${this.height}`;
	}

	get saturateSrc() {
		return `https://picsum.photos/seed/saturate/${this.width}/${this.height}`;
	}

	get hueSrc() {
		return `https://picsum.photos/seed/hue/${this.width}/${this.height}`;
	}

	get invertSrc() {
		return `https://picsum.photos/seed/invert/${this.width}/${this.height}`;
	}

	get sepiaBrightnessSrc() {
		return `https://picsum.photos/seed/sepiaBrightness/${this.width}/${this.height}`;
	}

	get imageSrc() {
		return `https://picsum.photos/${this.width}/${this.height}?random=${Math.floor(Math.random() * 1000)}`;
	}
}

function animateFilter(view: View, duration: number, stepFn: (progress: number) => string): Promise<void> {
	return new Promise((resolve) => {
		const frameTime = 16;
		const steps = Math.ceil(duration / frameTime);
		let step = 0;

		let id;
		const doFrame = () => {
			step++;
			const progress = step / steps;
			view.style.filter = stepFn(Math.min(progress, 1));

			if (step >= steps) {
				cancelAnimationFrame(id);
				resolve();
			} else {
				requestAnimationFrame(doFrame);
			}
		};
		id = requestAnimationFrame(doFrame);
	});
}

export async function onAnimateBlur(args: EventData) {
	const label = page.getViewById<View>('blurAnimLabel');
	if (!label) return;

	// blur in: 0 -> 15 over 600ms
	await animateFilter(label, 600, (p) => `blur(${p * 15})`);
	// blur out: 15 -> 0 over 600ms
	await animateFilter(label, 600, (p) => `blur(${(1 - p) * 15})`);
	label.style.filter = '';
}

export async function onPulseBlur(args: EventData) {
	const image = page.getViewById<View>('blurAnimImage');
	if (!image) return;

	for (let i = 0; i < 3; i++) {
		await animateFilter(image, 300, (p) => `blur(${p * 10})`);
		await animateFilter(image, 300, (p) => `blur(${(1 - p) * 10})`);
	}
	image.style.filter = '';
}

export async function onAnimateBlurGray(args: EventData) {
	const container = page.getViewById<View>('blurGrayContainer');
	if (!container) return;

	// animate blur 0->10 and grayscale 0%->100% together
	await animateFilter(container, 800, (p) => `blur(${p * 10}) grayscale(${p * 100}%)`);
	// animate back
	await animateFilter(container, 800, (p) => `blur(${(1 - p) * 10}) grayscale(${(1 - p) * 100}%)`);
	container.style.filter = '';
}

export async function onBreatheBrightness(args: EventData) {
	const container = page.getViewById<View>('brightnessContainer');
	if (!container) return;

	for (let i = 0; i < 3; i++) {
		// dim down: 1.0 -> 0.3
		await animateFilter(container, 500, (p) => `brightness(${1.0 - p * 0.7})`);
		// brighten up: 0.3 -> 1.5
		await animateFilter(container, 500, (p) => `brightness(${0.3 + p * 1.2})`);
		// settle back: 1.5 -> 1.0
		await animateFilter(container, 300, (p) => `brightness(${1.5 - p * 0.5})`);
	}
	container.style.filter = '';
}

export async function onSweepHue(args: EventData) {
	const container = page.getViewById<View>('hueContainer');
	if (!container) return;

	// sweep 0 -> 360 degrees
	await animateFilter(container, 2000, (p) => `hue-rotate(${p * 360}deg)`);
	container.style.filter = '';
}

export async function onFadeSepia(args: EventData) {
	const view = page.getViewById<View>('sepiaAnim');
	if (!view) return;

	// fade in: 0% -> 100%
	await animateFilter(view, 800, (p) => `sepia(${p * 100}%)`);
	// hold
	await new Promise((r) => setTimeout(r, 400));
	// fade out: 100% -> 0%
	await animateFilter(view, 800, (p) => `sepia(${(1 - p) * 100}%)`);
	view.style.filter = '';
}

export async function onFlashInvert(args: EventData) {
	const label = page.getViewById<View>('invertAnim');
	if (!label) return;

	for (let i = 0; i < 4; i++) {
		await animateFilter(label, 150, (p) => `invert(${p * 100}%)`);
		await animateFilter(label, 150, (p) => `invert(${(1 - p) * 100}%)`);
	}
	label.style.filter = '';
}

export async function onGrowShadow(args: EventData) {
	const label = page.getViewById<View>('shadowAnim');
	if (!label) return;

	// grow shadow: offset and blur increase
	await animateFilter(label, 800, (p) => {
		const offset = p * 15;
		const blur = p * 20;
		return `drop-shadow(${offset} ${offset} ${blur} rgba(0,0,0,0.6))`;
	});
	// shrink shadow back
	await animateFilter(label, 800, (p) => {
		const offset = (1 - p) * 15;
		const blur = (1 - p) * 20;
		return `drop-shadow(${offset} ${offset} ${blur} rgba(0,0,0,0.6))`;
	});
	label.style.filter = '';
}

export async function onCascade(args: EventData) {
	const container = page.getViewById<View>('cascadeContainer');
	if (!container) return;

	// phase 1: blur in
	await animateFilter(container, 500, (p) => `blur(${p * 8})`);
	// phase 2: add grayscale while blurred
	await animateFilter(container, 500, (p) => `blur(8) grayscale(${p * 100}%)`);
	// phase 3: add sepia while blurred + gray
	await animateFilter(container, 500, (p) => `blur(8) grayscale(100%) sepia(${p * 100}%)`);
	// phase 4: unwind everything together
	await animateFilter(container, 1000, (p) => {
		const inv = 1 - p;
		return `blur(${inv * 8}) grayscale(${inv * 100}%) sepia(${inv * 100}%)`;
	});
	container.style.filter = '';
}

export async function onPulseContrast(args: EventData) {
	const container = page.getViewById<View>('contrastContainer');
	if (!container) return;

	for (let i = 0; i < 3; i++) {
		// increase contrast: 100% -> 300%
		await animateFilter(container, 400, (p) => `contrast(${100 + p * 200}%)`);
		// decrease contrast: 300% -> 100%
		await animateFilter(container, 400, (p) => `contrast(${300 - p * 200}%)`);
	}
	container.style.filter = '';
}

export async function onWaveSaturation(args: EventData) {
	const container = page.getViewById<View>('saturateContainer');
	if (!container) return;

	for (let i = 0; i < 2; i++) {
		// desaturate: 100% -> 0%
		await animateFilter(container, 500, (p) => `saturate(${100 - p * 100}%)`);
		// oversaturate: 0% -> 400%
		await animateFilter(container, 500, (p) => `saturate(${p * 400}%)`);
		// settle back: 400% -> 100%
		await animateFilter(container, 400, (p) => `saturate(${400 - p * 300}%)`);
	}
	container.style.filter = '';
}

export async function onFullSpectrum(args: EventData) {
	const container = page.getViewById<View>('spectrumContainer');
	if (!container) return;

	// 1. Blur in
	await animateFilter(container, 400, (p) => `blur(${p * 5})`);

	// 2. Add brightness while blurred
	await animateFilter(container, 400, (p) => `blur(5) brightness(${1 + p * 0.5})`);

	// 3. Add hue rotation
	await animateFilter(container, 600, (p) => `blur(5) brightness(1.5) hue-rotate(${p * 180}deg)`);

	// 4. Transition to sepia + drop shadow
	await animateFilter(container, 500, (p) => `blur(${5 - p * 5}) sepia(${p * 100}%) drop-shadow(${p * 5}px ${p * 5}px ${p * 10}px rgba(0,0,0,0.5))`);

	// 5. Flash invert
	await animateFilter(container, 200, (p) => `sepia(100%) invert(${p * 100}%) drop-shadow(5px 5px 10px rgba(0,0,0,0.5))`);
	await animateFilter(container, 200, (p) => `sepia(100%) invert(${(1 - p) * 100}%) drop-shadow(5px 5px 10px rgba(0,0,0,0.5))`);

	// 6. Fade out all effects
	await animateFilter(container, 800, (p) => {
		const inv = 1 - p;
		return `sepia(${inv * 100}%) drop-shadow(${inv * 5}px ${inv * 5}px ${inv * 10}px rgba(0,0,0,${inv * 0.5}))`;
	});

	container.style.filter = '';
}
