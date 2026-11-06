import { describe, it, expect, vi, afterEach } from 'vitest';

import { StyleScope } from './style-scope';
import { StackLayout } from '../layouts/stack-layout';
import { Label } from '../label';
import { KeyframeAnimation } from '../animation/keyframe-animation';

function play(css: string, className?: string): KeyframeAnimation[] {
	const played: KeyframeAnimation[] = [];
	vi.spyOn(KeyframeAnimation.prototype, 'play').mockImplementation(function (this: KeyframeAnimation) {
		played.push(this);
		return Promise.resolve();
	});

	const scope = new StyleScope();
	scope.css = css;
	const root: any = new StackLayout();
	root._styleScope = scope;
	const view: any = new Label();
	root.addChild(view);
	view._styleScope = scope;
	if (className) {
		view.className = className;
	}
	view._cssState.onLoaded();

	return played;
}

describe('css animations using variables', () => {
	afterEach(() => vi.restoreAllMocks());

	it('resolve an animation shorthand held in a variable', () => {
		const [animation] = play(`
			@keyframes spin { from { opacity: 0; } to { opacity: 1; } }
			label { --animate-spin: spin 2s linear infinite; animation: var(--animate-spin); }
		`);

		expect(animation).toBeDefined();
		expect(animation.iterations).toBe(Number.POSITIVE_INFINITY);
		expect(animation.animations.map((a) => a.opacity)).toEqual([0, 1]);
	});

	it('resolve animation longhands per view', () => {
		const played = play(
			`
			@keyframes fade { from { opacity: 0; } to { opacity: 1; } }
			label { animation-name: fade; animation-duration: var(--speed); }
			.slow { --speed: 4s; }
		`,
			'slow',
		);

		expect(played.length).toBe(1);
		expect(played[0].animations[1].duration).toBe(4000);
	});

	it('resolve variables inside keyframes against the view', () => {
		const [animation] = play(`
			@keyframes pulse { from { opacity: var(--from); } to { opacity: var(--to, 1); } }
			label { --from: 0.25; animation: pulse 1s; }
		`);

		expect(animation.animations.map((a) => a.opacity)).toEqual([0.25, 1]);
	});

	it('keep styling the view when keyframes cannot be resolved', () => {
		const played = play(`
			@keyframes broken { from { opacity: var(--missing); } to { opacity: 1; } }
			label { color: red; animation: broken 1s; }
		`);

		expect(played.length).toBe(0);
	});

	it('still play animations without variables', () => {
		const [animation] = play(`
			@keyframes fade { from { opacity: 0; } to { opacity: 1; } }
			label { animation: fade 1s; }
		`);

		expect(animation.animations.map((a) => a.opacity)).toEqual([0, 1]);
	});
});
