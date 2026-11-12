export * from './animation-common';
export * from './animation-shared';
export * from './animation-types';

import { AnimationBase, Properties } from './animation-common';
import type { AnimationDefinitionInternal, PropertyAnimation } from './animation-shared';
import { CubicBezierAnimationCurve } from '../../core-types/animation-types';
import { CoreTypes } from '../../core-types';
import { Color } from '../../color';
import { requestAnimationFrame, cancelAnimationFrame } from '../../animation-frame';
import { opacityProperty, backgroundColorProperty, rotateProperty, translateXProperty, translateYProperty, scaleXProperty, scaleYProperty, heightProperty, widthProperty } from '../styling/style-properties';

type Easing = (t: number) => number;

/** Cubic bezier easing (same control points as CSS / Core Animation). */
function bezier(x1: number, y1: number, x2: number, y2: number): Easing {
	const a = (p1: number, p2: number) => 1 - 3 * p2 + 3 * p1;
	const b = (p1: number, p2: number) => 3 * p2 - 6 * p1;
	const c = (p1: number) => 3 * p1;
	const at = (t: number, p1: number, p2: number) => ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t;
	const slope = (t: number, p1: number, p2: number) => 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1);
	return (x: number) => {
		if (x <= 0 || x >= 1) return x;
		// Newton-Raphson for t(x)
		let t = x;
		for (let i = 0; i < 8; i++) {
			const dx = at(t, x1, x2) - x;
			const d = slope(t, x1, x2);
			if (Math.abs(dx) < 1e-5 || Math.abs(d) < 1e-6) break;
			t -= dx / d;
		}
		return at(Math.min(1, Math.max(0, t)), y1, y2);
	};
}

const CURVES: Record<string, Easing> = {
	[CoreTypes.AnimationCurve.linear]: (t) => t,
	[CoreTypes.AnimationCurve.ease]: bezier(0.25, 0.1, 0.25, 1),
	[CoreTypes.AnimationCurve.easeIn]: bezier(0.42, 0, 1, 1),
	[CoreTypes.AnimationCurve.easeOut]: bezier(0, 0, 0.58, 1),
	[CoreTypes.AnimationCurve.easeInOut]: bezier(0.42, 0, 0.58, 1),
	[CoreTypes.AnimationCurve.spring]: bezier(0.5, 1.6, 0.4, 0.8),
};

export function _resolveAnimationCurve(curve: any): Easing {
	if (curve instanceof CubicBezierAnimationCurve) {
		return bezier(curve.x1, curve.y1, curve.x2, curve.y2);
	}
	if (typeof curve === 'function') {
		return curve;
	}
	return CURVES[curve] ?? CURVES[CoreTypes.AnimationCurve.easeInOut];
}

const mix = (from: number, to: number, t: number) => from + (to - from) * t;

/**
 * Reads the current value and returns an applier for progress 0..1.
 *
 * A CSS keyframe animation (valueSource `keyframe`) writes the style's keyframe values, as iOS
 * and Android do: KeyframeAnimation sets them when it starts and they win over local values, so
 * local writes wouldn't show until it ends.
 */
function animator(animation: PropertyAnimation, keyframe: boolean): ((t: number) => void) | null {
	const target: any = animation.target;
	const to: any = animation.value;
	const set = (property: { name: string; keyframe: string }, value: any) => {
		if (keyframe) {
			target.style[property.keyframe] = value;
		} else {
			target[property.name] = value;
		}
	};
	switch (animation.property) {
		case Properties.opacity: {
			const from = target.opacity ?? 1;
			return (t) => set(opacityProperty, mix(from, to, t));
		}
		case Properties.backgroundColor: {
			const from: Color = target.backgroundColor instanceof Color ? target.backgroundColor : new Color(0, 0, 0, 0);
			const end: Color = to instanceof Color ? to : new Color(to);
			return (t) => set(backgroundColorProperty, new Color(Math.round(mix(from.a, end.a, t)), Math.round(mix(from.r, end.r, t)), Math.round(mix(from.g, end.g, t)), Math.round(mix(from.b, end.b, t))));
		}
		case Properties.translate: {
			const from = [target.translateX || 0, target.translateY || 0];
			return (t) => {
				set(translateXProperty, mix(from[0], to.x, t));
				set(translateYProperty, mix(from[1], to.y, t));
			};
		}
		case Properties.scale: {
			const from = [target.scaleX ?? 1, target.scaleY ?? 1];
			return (t) => {
				set(scaleXProperty, mix(from[0], to.x, t));
				set(scaleYProperty, mix(from[1], to.y, t));
			};
		}
		case Properties.rotate: {
			const from = target.rotate || 0;
			const end = typeof to === 'number' ? to : to.z;
			return (t) => set(rotateProperty, mix(from, end, t));
		}
		case Properties.width:
		case Properties.height: {
			const key = animation.property;
			const property = key === Properties.width ? widthProperty : heightProperty;
			const measured = key === Properties.width ? target.getActualSize?.().width : target.getActualSize?.().height;
			const from = typeof target[key] === 'number' ? target[key] : measured;
			// percentages / auto can't be tweened: jump at the end
			if (typeof to !== 'number' || typeof from !== 'number') {
				return (t) => t >= 1 && set(property, to);
			}
			return (t) => set(property, mix(from, to, t));
		}
		default:
			return null;
	}
}

/** Frame-driven tweens of the view properties (the views render through GTK). */
export class Animation extends AnimationBase {
	private _frame = 0;
	private _cancelled = false;
	private _valueSource: 'animation' | 'keyframe' = 'animation';

	constructor(animationDefinitions: Array<AnimationDefinitionInternal>, playSequentially?: boolean) {
		super(animationDefinitions, playSequentially);
		if (animationDefinitions.length > 0 && animationDefinitions[0].valueSource !== undefined) {
			this._valueSource = animationDefinitions[0].valueSource;
		}
	}

	public play(): any {
		if (this.isPlaying) {
			return this._rejectAlreadyPlaying();
		}
		const promise = super.play();
		this._cancelled = false;
		const animations = this._propertyAnimations ?? [];
		if (this._playSequentially) {
			animations
				.reduce((chain, animation) => chain.then(() => this._run([animation])), Promise.resolve())
				.then(
					() => this._done(),
					() => {},
				);
		} else {
			this._run(animations).then(
				() => this._done(),
				() => {},
			);
		}
		return promise;
	}

	private _done() {
		if (!this._cancelled) {
			this._resolveAnimationFinishedPromise();
		}
	}

	/** Runs animations in parallel on one frame loop. */
	private _run(animations: PropertyAnimation[]): Promise<void> {
		return new Promise((resolve, reject) => {
			const running = animations.map((animation) => ({ animation, apply: null as ((t: number) => void) | null, start: 0, easing: _resolveAnimationCurve(animation.curve) })).filter((r) => r.animation.target);
			const startedAt = Date.now();
			const tick = () => {
				if (this._cancelled) {
					reject();
					return;
				}
				const now = Date.now();
				let pending = false;
				for (const r of running) {
					const { animation } = r;
					const delay = animation.delay ?? 0;
					const duration = Math.max(1, animation.duration ?? 300);
					const iterations = animation.iterations ?? 1;
					const elapsed = now - startedAt - delay;
					if (elapsed < 0) {
						pending = true;
						continue;
					}
					// capture start values when the property starts moving
					r.apply ??= animator(animation, this._valueSource === 'keyframe');
					if (!r.apply) continue;
					const cycle = elapsed / duration;
					const finished = cycle >= iterations;
					const t = finished ? 1 : cycle % 1;
					r.apply(r.easing(t));
					pending ||= !finished;
				}
				if (pending) {
					this._frame = requestAnimationFrame(tick);
				} else {
					resolve();
				}
			};
			this._frame = requestAnimationFrame(tick);
		});
	}

	public cancel(): void {
		if (!this.isPlaying) {
			return;
		}
		this._cancelled = true;
		cancelAnimationFrame(this._frame);
		this._rejectAnimationFinishedPromise();
	}

	public _resolveAnimationCurve(curve: any): any {
		return _resolveAnimationCurve(curve);
	}
}
