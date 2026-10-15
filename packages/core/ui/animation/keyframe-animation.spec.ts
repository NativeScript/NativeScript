import { describe, it, expect } from 'vitest';

import { KeyframeAnimation, KeyframeAnimationInfo, KeyframeInfo } from './keyframe-animation';
import { Label } from '../label';

function info(keyframes: Array<Partial<KeyframeInfo>>, options: Partial<KeyframeAnimationInfo> = {}): KeyframeAnimationInfo {
	return Object.assign(new KeyframeAnimationInfo(), { duration: 1000, keyframes }, options);
}

describe('KeyframeAnimation.keyframeAnimationFromInfo', () => {
	it('keeps keyframes that already start at 0% and end at 100%', () => {
		const animation = KeyframeAnimation.keyframeAnimationFromInfo(
			info([
				{ duration: 0, declarations: [{ property: 'opacity', value: 0 }] },
				{ duration: 1, declarations: [{ property: 'opacity', value: 1 }] },
			]),
		);

		expect(animation.animations.length).toBe(2);
		expect(animation.animations.map((a) => a.opacity)).toEqual([0, 1]);
	});

	it('starts from the view’s own values when there is no 0% keyframe', () => {
		const animation = KeyframeAnimation.keyframeAnimationFromInfo(info([{ duration: 1, declarations: [{ property: 'rotate', value: { x: 0, y: 0, z: 360 } }] }]));
		const view = new Label();
		view.rotate = 45;

		(animation as any)._fillImplicitKeyframes(view);

		expect(animation.animations.length).toBe(2);
		expect(animation.animations[0].rotate).toEqual({ x: 0, y: 0, z: 45 });
		expect(animation.animations[1].rotate).toEqual({ x: 0, y: 0, z: 360 });
		expect(animation.animations[1].duration).toBe(1000);
	});

	it('ends at the view’s own values when there is no 100% keyframe', () => {
		const animation = KeyframeAnimation.keyframeAnimationFromInfo(
			info([
				{ duration: 0, declarations: [{ property: 'opacity', value: 0 }] },
				{ duration: 0.5, declarations: [{ property: 'opacity', value: 0.5 }] },
			]),
		);
		const view = new Label();
		view.opacity = 0.8;

		(animation as any)._fillImplicitKeyframes(view);

		expect(animation.animations.map((a) => a.opacity)).toEqual([0, 0.5, 0.8]);
		expect(animation.animations.map((a) => a.duration)).toEqual([0.01, 500, 500]);
	});

	it('fills only the properties the keyframes animate', () => {
		const animation = KeyframeAnimation.keyframeAnimationFromInfo(info([{ duration: 0.5, declarations: [{ property: 'opacity', value: 0 }] }]));

		(animation as any)._fillImplicitKeyframes(new Label());

		expect(animation.animations.length).toBe(3);
		for (const keyframe of animation.animations) {
			expect('rotate' in keyframe).toBe(false);
			expect('opacity' in keyframe).toBe(true);
		}
		expect(animation.animations[0].opacity).toBe(1);
		expect(animation.animations[2].opacity).toBe(1);
	});

	it('does not animate from an auto size', () => {
		const animation = KeyframeAnimation.keyframeAnimationFromInfo(info([{ duration: 1, declarations: [{ property: 'width', value: 100 }] }]));

		(animation as any)._fillImplicitKeyframes(new Label());

		expect('width' in animation.animations[0]).toBe(false);
		expect(animation.animations[1].width).toBe(100);
	});

	it('does not change the info it was built from', () => {
		const animationInfo = info([{ duration: 1, declarations: [{ property: 'opacity', value: 0 }] }]);

		KeyframeAnimation.keyframeAnimationFromInfo(animationInfo);

		expect(animationInfo.keyframes.length).toBe(1);
	});
});
