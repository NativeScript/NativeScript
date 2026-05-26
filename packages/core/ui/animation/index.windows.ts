export * from './animation-common';
export * from './animation-shared';
export * from './animation-types';

export function _resolveAnimationCurve(curve: any): any {
	return curve;
}

import { AnimationBase, Properties } from './animation-common';
import type { View } from '../core/view';
import { _ensureNativeTransforms } from '../core/view';
import { layout } from '../../utils';

function _applyFinalValue(target: any, property: string, to: any): void {
	try {
		switch (property) {
			case Properties.opacity: target.opacity = to; break;
			case Properties.translate: target.translateX = to?.x ?? 0; target.translateY = to?.y ?? 0; break;
			case Properties.scale: target.scaleX = to?.x ?? 1; target.scaleY = to?.y ?? 1; break;
			case Properties.rotate: target.rotate = to?.z ?? to; break;
			default: break;
		}
	} catch (_e) {}
}

export class Animation extends AnimationBase {
	constructor(animationDefinitions: any[], playSequentially?: boolean) {
		super(animationDefinitions, playSequentially);
	}


	// Track running XAML storyboards so we can stop them on cancel
	private _runningStoryboards: Array<{ storyboard: any; native: any; props: string[] }> = [];


	private _startStoryboardForProperty(native: any, property: string, to: any, dur: number, del: number, tid2: string, target?: any) {
		return new Promise<void>((resolve) => {
					try {
						const sb = new Windows.UI.Xaml.Media.Animation.Storyboard();
				// DurationHelper.FromTimeSpan expects a raw TimeSpan struct by value.
				// BeginTime expects IReference<TimeSpan> — box it via PropertyValue.
				const makeTimeSpanStruct = (ms: number) => ({ Duration: Math.round(ms * 10000) });
				const makeTimeSpanRef = (ms: number) =>
					Windows.Foundation.PropertyValue.CreateTimeSpan(makeTimeSpanStruct(ms)) as any;

				const duration = Windows.UI.Xaml.DurationHelper.FromTimeSpan(makeTimeSpanStruct(dur));
				const beginTime = del > 0 ? makeTimeSpanRef(del) : null;

				switch (property) {
					case Properties.scale: {
						const transforms = _ensureNativeTransforms(native);
						const st = transforms?.scale;
						if (!st) break;
						const sx = (to && (to.x ?? to)) || 1;
						const sy = (to && (to.y ?? to)) || 1;
						const daX = new Windows.UI.Xaml.Media.Animation.DoubleAnimation();
						daX.To = sx;
						daX.Duration = duration;
						if (beginTime) daX.BeginTime = beginTime;
						Windows.UI.Xaml.Media.Animation.Storyboard.SetTarget(daX, st);
						Windows.UI.Xaml.Media.Animation.Storyboard.SetTargetProperty(daX, 'ScaleX');
						sb.Children.Append(daX);

						const daY = new Windows.UI.Xaml.Media.Animation.DoubleAnimation();
						daY.To = sy;
						daY.Duration = duration;
						if (beginTime) daY.BeginTime = beginTime;
						Windows.UI.Xaml.Media.Animation.Storyboard.SetTarget(daY, st);
						Windows.UI.Xaml.Media.Animation.Storyboard.SetTargetProperty(daY, 'ScaleY');
						sb.Children.Append(daY);
						break;
					}
					case Properties.rotate: {
						const transforms = _ensureNativeTransforms(native);
						const rt = transforms?.rotate;
						if (!rt) break;
						const angle = (to && (to.z ?? to)) || 0;
						const da = new Windows.UI.Xaml.Media.Animation.DoubleAnimation();
						da.To = angle;
						da.Duration = duration;
						if (beginTime) da.BeginTime = beginTime;
						Windows.UI.Xaml.Media.Animation.Storyboard.SetTarget(da, rt);
						Windows.UI.Xaml.Media.Animation.Storyboard.SetTargetProperty(da, 'Angle');
						sb.Children.Append(da);
						break;
					}
					case Properties.translate: {
						const transforms = _ensureNativeTransforms(native);
						const tt = transforms?.translate;
						if (!tt) break;
						const vx = (to && (to.x ?? to)) || 0;
						const vy = (to && (to.y ?? 0)) || 0;
						const dax = new Windows.UI.Xaml.Media.Animation.DoubleAnimation();
						dax.To = layout.toDeviceIndependentPixels(vx);
						dax.Duration = duration;
						if (beginTime) dax.BeginTime = beginTime;
						Windows.UI.Xaml.Media.Animation.Storyboard.SetTarget(dax, tt);
						Windows.UI.Xaml.Media.Animation.Storyboard.SetTargetProperty(dax, 'X');
						sb.Children.Append(dax);
						const day = new Windows.UI.Xaml.Media.Animation.DoubleAnimation();
						day.To = layout.toDeviceIndependentPixels(vy);
						day.Duration = duration;
						if (beginTime) day.BeginTime = beginTime;
						Windows.UI.Xaml.Media.Animation.Storyboard.SetTarget(day, tt);
						Windows.UI.Xaml.Media.Animation.Storyboard.SetTargetProperty(day, 'Y');
						sb.Children.Append(day);
						break;
					}
					case Properties.opacity: {
						const da = new Windows.UI.Xaml.Media.Animation.DoubleAnimation();
						da.To = to;
						da.Duration = duration;
						if (beginTime) da.BeginTime = beginTime;
						Windows.UI.Xaml.Media.Animation.Storyboard.SetTarget(da, native);
						Windows.UI.Xaml.Media.Animation.Storyboard.SetTargetProperty(da, 'Opacity');
						sb.Children.Append(da);
						break;
					}
					case Properties.backgroundColor: {
						// ColorAnimation.To expects IReference<Windows.UI.Color> which cannot
						// be boxed without a WinRT helper. Use a JS lerp loop instead:
						// read current brush color, interpolate, and write directly to brush.Color
						// (a struct property setter that works correctly after the struct ABI fix).
						try {
							const toColor = to && typeof to === 'object' && to.r !== undefined ? to : null;
							if (!toColor) { resolve(); return; }

							const toA = Math.round(toColor.a ?? 255);
							const toR = Math.round(toColor.r ?? 0);
							const toG = Math.round(toColor.g ?? 0);
							const toB = Math.round(toColor.b ?? 0);

							let fromA = 255, fromR = 0, fromG = 0, fromB = 0;
							try {
								const existing = native.Background;
								if (existing instanceof Windows.UI.Xaml.Media.SolidColorBrush) {
									const c = (existing as Windows.UI.Xaml.Media.SolidColorBrush).Color;
									fromA = (c as any).A ?? 255;
									fromR = (c as any).R ?? 0;
									fromG = (c as any).G ?? 0;
									fromB = (c as any).B ?? 0;
								}
							} catch (_e) {}

							const brush = new Windows.UI.Xaml.Media.SolidColorBrush(
								Windows.UI.ColorHelper.FromArgb(fromA, fromR, fromG, fromB)
							);
							native.Background = brush;
							try { (native as any).Resources.Insert('ButtonBackground', brush); } catch (_re) {}
							try { (native as any).Resources.Insert('ButtonBackgroundPointerOver', brush); } catch (_re) {}
							try { (native as any).Resources.Insert('ButtonBackgroundPressed', brush); } catch (_re) {}

							let colorSettled = false;
							let colorTimer: any;
							const colorDone = () => {
								if (colorSettled) return;
								colorSettled = true;
								clearTimeout(colorTimer);
								try { brush.Color = Windows.UI.ColorHelper.FromArgb(toA, toR, toG, toB); } catch (_e) {}
								resolve();
							};
							const animStart = Date.now() + del;
							const step = () => {
								if (colorSettled) return;
								const now = Date.now();
								if (now < animStart) { colorTimer = setTimeout(step, animStart - now); return; }
								const t = Math.min(1, (now - animStart) / Math.max(1, dur));
								const a = Math.round(fromA + (toA - fromA) * t);
								const r = Math.round(fromR + (toR - fromR) * t);
								const g = Math.round(fromG + (toG - fromG) * t);
								const b = Math.round(fromB + (toB - fromB) * t);
								try { brush.Color = Windows.UI.ColorHelper.FromArgb(a, r, g, b); } catch (_e) {}
								if (t < 1) { colorTimer = setTimeout(step, 16); } else { colorDone(); }
							};
							colorTimer = setTimeout(step, 0);
							setTimeout(colorDone, dur + del + 300);
						} catch (_e) { resolve(); }
						return;
					}
					default:
						break;
				}

				try {
					let settled = false;
					const done = () => {
						if (settled) return;
						settled = true;
						clearTimeout(safetyTimer);
						// Set final NS property value before stopping so sb.Stop() doesn't revert native value
						if (target) {
							try { _applyFinalValue(target, property, to); } catch (_e) {}
						}
						try { sb.Stop(); } catch (_e) {}
						for (let i = 0; i < this._runningStoryboards.length; i++) {
							if (this._runningStoryboards[i].storyboard === sb) {
								this._runningStoryboards.splice(i, 1);
								break;
							}
						}
						resolve();
					};
					// Safety timeout: resolve even if Completed never fires
					const safetyTimer = setTimeout(done, Math.max(0, dur + del + 300));
					// addEventListener is the reliable path in the V8 WinRT projection.
					// Direct property assignment (sb.Completed = fn) silently fails for
					// WinRT events that require a typed delegate — same root cause as Button.Click.
					const onCompleted = () => {
						try { (sb as any).removeEventListener?.('completed', onCompleted); } catch (_e) {}
						done();
					};
					try {
						if (typeof (sb as any).addEventListener === 'function') {
							(sb as any).addEventListener('completed', onCompleted);
						} else {
							sb.Completed = (_s: any, _e: any) => done();
						}
					} catch (_e) { /* safety timer covers */ }
					this._runningStoryboards.push({ storyboard: sb, native, props: [property] });
					sb.Begin();
				} catch (err) {
					console.error('[Animation.Windows] Storyboard begin failed', err);
					resolve();
				}
			} catch (err) {
				console.error('[Animation.Windows] Storyboard fallback building failed', err);
				resolve();
			}
		});
	}

	play(resetDelay?: boolean): any {
		const playPromise = super.play(resetDelay);
		

		const run = async () => {
			try {
				if (this._playSequentially) {
					for (const anim of this._propertyAnimations) {
						await this._playKeyframeAnimation(anim);
					}
					
				} else {
					await Promise.all(this._propertyAnimations.map((anim) => this._playKeyframeAnimation(anim)));
				}

				this._resolveAnimationFinishedPromise();
			} catch (err) {
				this._rejectAnimationFinishedPromise();
			}
		};

		run();
		return playPromise;
	}

	public cancel(): void {
		// Stop any running XAML storyboards
		try {
			for (const it of this._runningStoryboards) {
				try { it.storyboard.Stop(); } catch (_e) { }
			}
		} catch (_e) { }
		this._runningStoryboards.length = 0;

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

			const native = (target as any).nativeViewProtected;
			if (native) {
				// Use XAML Storyboard for all properties — reliable, no Composition fallback needed
				this._startStoryboardForProperty(native, property, to, duration, delay, '', target).then(() => resolve());
			} else {
				// No native view yet — apply final value immediately so the animation doesn't hang
				_applyFinalValue(target, property, to);
				resolve();
			}
		});
	}

	_createiOSAnimationFunction(_animation: Properties, _delay?: number): any {
		return null;
	}

	static _getTransformAnimationInfo(_view: View, _transformation: any): any {
		return {};
	}
}
