export * from './animation-common';
export * from './animation-shared';
export * from './animation-types';

export function _resolveAnimationCurve(curve: any): any {
	return curve;
}

import { AnimationBase, Properties } from './animation-common';
import type { View } from '../core/view';

export class Animation extends AnimationBase {
	constructor(animationDefinitions: any[], playSequentially?: boolean) {
		super(animationDefinitions, playSequentially);
	}

	private _runningHandles: Set<number> = new Set<number>();

	play(resetDelay?: boolean): any {
		const playPromise = super.play(resetDelay);

		const run = async () => {
			try {
				if (this._playSequentially) {
					for (const anim of this._propertyAnimations) {
						await this._playKeyframeAnimation(anim);
					}
				} else {
					await Promise.all(this._propertyAnimations.map((a) => this._playKeyframeAnimation(a)));
				}

				this._resolveAnimationFinishedPromise();
			} catch (err) {
				this._rejectAnimationFinishedPromise();
			}
		};

		run();

		return playPromise;
	}

	cancel(): void {
		// Stop any running RAF animations
		this._runningHandles.forEach((id) => cancelAnimationFrame(id as any));

		this._runningHandles.clear();
		super.cancel();
		this._rejectAnimationFinishedPromise();
	}

	_resolveAnimationCurve(curve: any): any {
		return curve;
	}

	_playKeyframeAnimation(animation: any, _delay?: number): any {
		return new Promise<void>((resolve, _reject) => {
			if (!animation || !animation.target) {
				resolve();
				return;
			}

			const target = animation.target as View;
			const property = animation.property;
			const to = animation.value;
			const duration = typeof animation.duration === 'number' ? animation.duration : 300;
			const delay = typeof animation.delay === 'number' ? animation.delay : 0;
			const iterations = typeof animation.iterations === 'number' && animation.iterations > 0 ? animation.iterations : 1;
			const curve = typeof animation.curve === 'function' ? animation.curve : (t: number) => t;

			let startValues: any = null;

			function getNumeric(v: any, fallback = 0) {
				return typeof v === 'number' ? v : fallback;
			}

			// Determine start values
			switch (property) {
				case Properties.opacity:
					startValues = { opacity: getNumeric((target as any).opacity ?? (target as any).get?.('opacity') ?? 1, 1) };
					break;
				case Properties.translate:
					startValues = {
						x: getNumeric((target as any).translateX ?? 0, 0),
						y: getNumeric((target as any).translateY ?? 0, 0),
					};
					break;
				case Properties.scale:
					startValues = {
						x: getNumeric((target as any).scaleX ?? (target as any).scale ?? 1, 1),
						y: getNumeric((target as any).scaleY ?? (target as any).scale ?? 1, 1),
					};
					break;
				case Properties.rotate:
					startValues = { rotate: getNumeric((target as any).rotate ?? 0, 0) };
					break;
				case Properties.backgroundColor:
					const bg = (target as any).backgroundColor ?? (target as any).style?.backgroundColor ?? null;
					startValues = { color: bg };
					break;
				default:
					startValues = {};
					break;
			}

			let rafId: number | null = null;
			let startTime: number | null = null;
			let iter = 0;

			const that = this;

			const step = (timestamp: number) => {
				if (startTime === null) startTime = timestamp;
				const elapsed = timestamp - startTime;

				if (elapsed < delay) {
					rafId = requestAnimationFrame(step);
					this._runningHandles.add(rafId as number);
					return;
				}

				const t = Math.min(1, (elapsed - delay) / duration);
				const eased = curve(t);

				switch (property) {
					case Properties.opacity: {
						const from = startValues.opacity ?? 1;
						const value = from + (to - from) * eased;
						(target as any).opacity = value;
						break;
					}
					case Properties.translate: {
						const fromX = startValues.x ?? 0;
						const fromY = startValues.y ?? 0;
						const valueX = fromX + ((to.x ?? 0) - fromX) * eased;
						const valueY = fromY + ((to.y ?? 0) - fromY) * eased;
						(target as any).translateX = valueX;
						(target as any).translateY = valueY;
						break;
					}
					case Properties.scale: {
						const fromX = startValues.x ?? 1;
						const fromY = startValues.y ?? 1;
						const valueX = fromX + ((to.x ?? 1) - fromX) * eased;
						const valueY = fromY + ((to.y ?? 1) - fromY) * eased;
						(target as any).scaleX = valueX;
						(target as any).scaleY = valueY;
						break;
					}
					case Properties.rotate: {
						const from = startValues.rotate ?? 0;
						const value = from + ((to.z ?? to) - from) * eased;
						(target as any).rotate = value;
						break;
					}
					case Properties.backgroundColor: {
						const startColor = startValues.color;
						const endColor = to; // expected Color instance
						if (startColor && endColor) {
							const sc = startColor instanceof Object && startColor.r !== undefined ? startColor : null;
							const ec = endColor instanceof Object && endColor.r !== undefined ? endColor : null;
							if (sc && ec) {
								const r = Math.round(sc.r + (ec.r - sc.r) * eased);
								const g = Math.round(sc.g + (ec.g - sc.g) * eased);
								const b = Math.round(sc.b + (ec.b - sc.b) * eased);
								const a = Math.round((sc.a ?? 255) + ((ec.a ?? 255) - (sc.a ?? 255)) * eased);
								const ColorClass: any = (global as any).Color || (typeof require === 'function' && require('../../color').Color) || null;
								if (ColorClass) {
									(target as any).backgroundColor = new ColorClass(r, g, b, a);
								}
							}
						}
						break;
					}
					default:
						break;
				}

				if (t < 1) {
					rafId = requestAnimationFrame(step);
					this._runningHandles.add(rafId as number);
				} else {
					iter++;
					if (iter < iterations) {
						// restart
						startTime = null;
						rafId = requestAnimationFrame(step);
						this._runningHandles.add(rafId as number);
					} else {
						// ensure final value
						switch (property) {
							case Properties.opacity:
								(target as any).opacity = to;
								break;
							case Properties.translate:
								(target as any).translateX = to.x ?? 0;
								(target as any).translateY = to.y ?? 0;
								break;
							case Properties.scale:
								(target as any).scaleX = to.x ?? 1;
								(target as any).scaleY = to.y ?? 1;
								break;
							case Properties.rotate:
								(target as any).rotate = to.z ?? to;
								break;
							case Properties.backgroundColor:
								const ColorClass: any = (global as any).Color || (typeof require === 'function' && require('../../color').Color) || null;
								if (ColorClass && to instanceof Object && to.r !== undefined) {
									(target as any).backgroundColor = new ColorClass(to.r, to.g, to.b, to.a ?? 255);
								}
								break;
							default:
								break;
						}

						if (rafId) {
							this._runningHandles.delete(rafId as number);
							cancelAnimationFrame(rafId as any);
						}

						resolve();
					}
				}
			};

			rafId = requestAnimationFrame(step);
			this._runningHandles.add(rafId as number);
		});
	}

	_createiOSAnimationFunction(_animation: Properties, _delay?: number): any {
		return null;
	}

	static _getTransformAnimationInfo(_view: View, _transformation: any): any {
		return {};
	}
}
