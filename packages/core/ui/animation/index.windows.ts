export * from './animation-common';
export * from './animation-shared';
export * from './animation-types';

export function _resolveAnimationCurve(curve: any): any {
	return curve;
}

import { AnimationBase, Properties } from './animation-common';
import type { View } from '../core/view';
import { _ensureNativeTransforms } from '../core/view';

function _applyFinalValue(target: any, property: string, to: any): void {
	try {
		switch (property) {
			case Properties.opacity: target.opacity = to; break;
			case Properties.translate: target.translateX = to?.x ?? 0; target.translateY = to?.y ?? 0; break;
			case Properties.scale: target.scaleX = to?.x ?? 1; target.scaleY = to?.y ?? 1; break;
			case Properties.rotate: target.rotate = to?.z ?? to; break;
			case Properties.width: target.width = typeof to === 'object' ? (to?.value ?? to) : to; break;
			case Properties.height: target.height = typeof to === 'object' ? (to?.value ?? to) : to; break;
			default: break;
		}
	} catch (_e) {}
}

// Per-native-view, per-property storyboard conflict tracking.
// When a new animation starts on the same native element + property, the previous
// storyboard is stopped immediately and its promise resolved so the chain continues.
const _activeStoryboards = new WeakMap<object, Map<string, () => void>>();

function _cancelActiveStoryboard(native: object, property: string): void {
	const map = _activeStoryboards.get(native);
	if (!map) return;
	const cancel = map.get(property);
	if (cancel) { cancel(); map.delete(property); }
}

function _registerActiveStoryboard(native: object, property: string, cancel: () => void): void {
	let map = _activeStoryboards.get(native);
	if (!map) { map = new Map(); _activeStoryboards.set(native, map); }
	map.set(property, cancel);
}

function _clearActiveStoryboard(native: object, property: string): void {
	_activeStoryboards.get(native)?.delete(property);
}

const num = (v: any, d = 0) => (typeof v === 'number' ? v : (v && typeof v.value === 'number' ? v.value : (v && typeof v.x === 'number' ? v.x : d)));

// Duration struct: { TimeSpan: { Duration: <100ns ticks> }, Type: 1 (DurationType.TimeSpan) }.
// Keep ticks as a JS number — the struct marshaler uses number_value; a BigInt would read as 0.
function _duration(ms: number): Microsoft.UI.Xaml.Duration {
	return { TimeSpan: { Duration: Math.max(0, Math.round(ms)) * 10000 }, Type: 1 } as never;
}

// Easing function objects are stateless in XAML — the same CubicEase/BackEase can be shared
// across all concurrent animations that use the same curve. Cache per curve name so 100
// simultaneous animations only pay the WinRT construction cost once.
const _xamlEasingCache = new Map<string, any>();

export class Animation extends AnimationBase {
	constructor(animationDefinitions: any[], playSequentially?: boolean) {
		super(animationDefinitions, playSequentially);
	}

	// Per-instance cancel hooks for in-flight storyboards.
	private _activeCancels: Array<() => void> = [];

	// Maps a NativeScript curve to a XAML easing function; returns null for linear/unknown (native linear).
	// Results are cached in the module-level _xamlEasingCache — easing objects are stateless in XAML
	// so 100 animations with the same curve share one object instead of paying 100× WinRT construction.
	private _xamlEasing(curve: any): any {
		try {
			const A: any = Microsoft.UI.Xaml.Media.Animation;
			const EM: any = A.EasingMode;
			let name: string | null = null;
			if (typeof curve === 'string') name = curve;
			else if (curve && typeof curve === 'object' && typeof curve.name === 'string') name = curve.name;
			// Normalise 'ease' (CSS) → 'easeInOut' so both map to the same cache entry.
			const cacheKey = (name === 'ease' ? 'easeInOut' : (name ?? 'linear'));
			if (_xamlEasingCache.has(cacheKey)) return _xamlEasingCache.get(cacheKey);
			let ease: any = null;
			switch (name) {
				case 'easeIn': { const e = new A.CubicEase(); e.EasingMode = EM.EaseIn; ease = e; break; }
				case 'easeOut': { const e = new A.CubicEase(); e.EasingMode = EM.EaseOut; ease = e; break; }
				case 'ease':
				case 'easeInOut': { const e = new A.CubicEase(); e.EasingMode = EM.EaseInOut; ease = e; break; }
				case 'spring': { const e = new A.BackEase() as Microsoft.UI.Xaml.Media.Animation.BackEase; e.EasingMode = EM.EaseOut; e.Amplitude = 0.3; ease = e; break; }
				default: ease = null; break; // 'linear', cubic-bezier objects, raw functions → linear
			}
			_xamlEasingCache.set(cacheKey, ease);
			return ease;
		} catch (_e) { return null; }
	}

	// Native WinUI3 Storyboard animation (compositor-thread, vsync-aligned). Animates the SAME
	// TransformGroup objects that _ensureNativeTransforms creates (scale/rotate/translate) so animated
	// and static transforms stay consistent. Replaces the old setTimeout interpolation loop.
	private _startStoryboardForProperty(native: any, property: string, to: any, dur: number, del: number, _tid2: string, target?: any, curve?: any, iterations?: number) {
		return new Promise<void>((resolve) => {
			const A: any = Microsoft.UI.Xaml.Media.Animation;
			const dur2 = Math.max(0, Math.round(dur || 0));
			const del2 = Math.max(0, Math.round(del || 0));
			const ease = this._xamlEasing(curve);
			const infinite = typeof iterations === 'number' && (iterations <= 0 || !isFinite(iterations));
			const reps = typeof iterations === 'number' && iterations > 1 && isFinite(iterations) ? iterations : 1;

			_cancelActiveStoryboard(native, property);

			let sb: any;
			try {
				sb = new A.Storyboard();

				// addDouble accepts an optional per-call ease override (pass null to force linear).
				// The default (undefined) falls through to the outer `ease` computed from `curve`.
				const addDouble = (targetObj: any, prop: string, toVal: number, dependent?: boolean, fromVal?: number, easeOverride?: any) => {
					const da = new A.DoubleAnimation();
					// Width/Height start as NaN (Auto) when not explicitly sized, so the animation must be
					// seeded with an explicit From (the rendered size) or it can't interpolate.
					if (typeof fromVal === 'number' && isFinite(fromVal)) da.From = fromVal;
					da.To = toVal;
					da.Duration = _duration(dur2) as never;
					if (dependent) da.EnableDependentAnimation = true;
					const effectiveEase = easeOverride !== undefined ? easeOverride : ease;
					if (effectiveEase) da.EasingFunction = effectiveEase;
					A.Storyboard.SetTarget(da, targetObj);
					A.Storyboard.SetTargetProperty(da, prop);
					sb.Children.Append(da);
				};

				const measuredSize = (actual: number, explicit: number): number | undefined => {
					if (typeof actual === 'number' && actual > 0) return actual;
					if (typeof explicit === 'number' && isFinite(explicit) && explicit > 0) return explicit;
					return undefined;
				};

				// BackEase (spring) overshoots its target value.  For Height/Width this means the
				// animated value can go negative mid-animation, which WinUI3 rejects with
				// "Invalid attribute value Unknown for property Height/Width".
				// Substitute null (linear) for dimensional properties when the curve is spring.
				const isSpring = curve === 'spring' || (curve && typeof curve === 'object' && curve.name === 'spring');
				const dimEase = isSpring ? null : ease;

				switch (property) {
					case Properties.opacity:
						addDouble(native, 'Opacity', num(to, 1));
						break;
					case Properties.width:
						addDouble(native, 'Width', num(to, 0), true, measuredSize(native.ActualWidth, native.Width), dimEase);
						break;
					case Properties.height:
						addDouble(native, 'Height', num(to, 0), true, measuredSize(native.ActualHeight, native.Height), dimEase);
						break;
					case Properties.translate: {
						const tr = _ensureNativeTransforms(native);
						if (!tr) { resolve(); return; }
						const toX = num(to && to.x !== undefined ? to.x : to, 0);
						const toY = (to && typeof to.y === 'number') ? to.y : 0;
						addDouble(tr.translate, 'X', toX);
						addDouble(tr.translate, 'Y', toY);
						break;
					}
					case Properties.scale: {
						const tr = _ensureNativeTransforms(native);
						if (!tr) { resolve(); return; }
						const sx = num(to && to.x !== undefined ? to.x : to, 1);
						const sy = (to && typeof to.y === 'number') ? to.y : sx;
						addDouble(tr.scale, 'ScaleX', sx);
						addDouble(tr.scale, 'ScaleY', sy);
						break;
					}
					case Properties.rotate: {
						const tr = _ensureNativeTransforms(native);
						if (!tr) { resolve(); return; }
						const ang = (to && typeof to.z === 'number') ? to.z : num(to, 0);
						addDouble(tr.rotate, 'Angle', ang);
						break;
					}
					case Properties.backgroundColor: {
						const toColor = to && typeof to === 'object' && to.r !== undefined ? to : null;
						if (!toColor) { resolve(); return; }
						// Fast path: the View caches its SolidColorBrush in _colorAnimBrush, set by
						// _setNativeSolidColor. Avoids native.Background getter + instanceof QI (2 WinRT calls).
						let brush: any = (target as any)?._colorAnimBrush ?? null;
						if (!brush) {
							try { if (native.Background instanceof Microsoft.UI.Xaml.Media.SolidColorBrush) brush = native.Background; } catch (_e) {}
							if (!brush) {
								brush = new Microsoft.UI.Xaml.Media.SolidColorBrush({ A: 255, R: 0, G: 0, B: 0 } as any);
								try { native.Background = brush; } catch (_e) {}
							}
						}
						// Resources.Insert wires Button VSM theme brushes — only needed for actual Button
						// controls. `'IsDefault' in native` is a free prototype check (no WinRT getter).
						if ('IsDefault' in native) {
							try { (native as any).Resources.Insert('ButtonBackground', brush); } catch (_e) {}
							try { (native as any).Resources.Insert('ButtonBackgroundPointerOver', brush); } catch (_e) {}
							try { (native as any).Resources.Insert('ButtonBackgroundPressed', brush); } catch (_e) {}
						}
						// Use ColorAnimationUsingKeyFrames + EasingColorKeyFrame/LinearColorKeyFrame instead
						// of ColorAnimation.  ColorAnimation.To requires IReference<Windows.UI.Color> (a COM
						// nullable wrapper) which the JS→Rust bridge cannot produce from a plain JS object.
						// EasingColorKeyFrame.Value is a plain Windows.UI.Color struct — the bridge handles
						// it via append_struct_object_bytes without any COM boxing.
						const cauk = new A.ColorAnimationUsingKeyFrames();
						cauk.EnableDependentAnimation = true;
						let kf: any;
						if (ease) {
							kf = new A.EasingColorKeyFrame();
							kf.EasingFunction = ease;
						} else {
							kf = new A.LinearColorKeyFrame();
						}
						kf.Value = { A: Math.round(toColor.a ?? 255), R: Math.round(toColor.r ?? 0), G: Math.round(toColor.g ?? 0), B: Math.round(toColor.b ?? 0) } as any;
						// KeyTime is a struct: { TimeSpan: { Duration: 100ns-ticks } }
						kf.KeyTime = { TimeSpan: { Duration: Math.max(0, dur2) * 10000 } } as any;
						cauk.KeyFrames.Append(kf);
						A.Storyboard.SetTarget(cauk, brush);
						A.Storyboard.SetTargetProperty(cauk, 'Color');
						sb.Children.Append(cauk);
						break;
					}
					default: resolve(); return;
				}

				// RepeatBehavior: Type 0=Count, 1=Duration, 2=Forever; nested TimeSpan unused.
				const repeatBehavior = (count: number, type: number) =>
					({ Count: count, Duration: { Duration: 0 }, Type: type } as never);
				if (infinite) {
					try { sb.RepeatBehavior = repeatBehavior(0, 2); } catch (_e) {}
				} else if (reps > 1) {
					try { sb.RepeatBehavior = repeatBehavior(reps, 0); } catch (_e) {}
				}
			} catch (_e) {
				resolve();
				return;
			}

			let settled = false;
			let safety: any;
			const finalize = () => {
				if (settled) return;
				settled = true;
				clearTimeout(safety);
				_clearActiveStoryboard(native, property);
				if (target) { try { _applyFinalValue(target, property, to); } catch (_e) {} }
				resolve();
			};
			const cancel = () => {
				if (settled) return;
				settled = true;
				clearTimeout(safety);
				_clearActiveStoryboard(native, property);
				try { sb.Stop(); } catch (_e) {}
				resolve();
			};

			// Completed fires once for a finite storyboard (after all iterations); never for Forever.
			try { sb.Completed = (() => finalize()) as never; } catch (_e) {}

			_registerActiveStoryboard(native, property, cancel);
			this._activeCancels.push(cancel);

			const begin = () => { try { sb.Begin(); } catch (_e) { finalize(); } };
			if (del2 > 0) setTimeout(begin, del2); else begin();

			// Safety net so the promise can't hang if Completed never fires (element detached, etc.).
			// Skipped for infinite animations — those resolve only via cancel().
			if (!infinite) {
				const total = del2 + dur2 * Math.max(1, reps) + 400;
				safety = setTimeout(finalize, total);
			}
		});
	}

	// Batched single-Storyboard path for homogeneous backgroundColor animation sets.
	// Instead of spawning N storyboards (one per target), this builds ONE Storyboard with N
	// ColorAnimations, each having a BeginTime for its cascade delay.  This reduces WinRT
	// crossings from ~8N to ~5N+2 and, more importantly, cuts the number of Storyboard.Begin()
	// calls from N to 1 — eliminating the ~4ms-per-tick setTimeout storm on large batches.
	//
	// BeginTime is a nullable TimeSpan (IReference<TimeSpan> in ABI).  Pass null for del=0
	// (immediate start) and Windows.Foundation.PropertyValue.CreateTimeSpan() to box a
	// non-zero delay into the reference wrapper the compositor expects.
	private _playBatchedColorAnims(anims: any[]): Promise<void> {
		const A: any = Microsoft.UI.Xaml.Media.Animation;
		let sb: any;
		try { sb = new A.Storyboard(); } catch (_e) { return Promise.resolve(); }

		let maxEnd = 0;
		// Collect (native, property) pairs for conflict-tracking registration after cancel is created.
		const registered: Array<{ native: any; prop: string }> = [];

		for (const anim of anims) {
			const target = anim.target;
			const native = target?.nativeViewProtected;
			if (!native) continue;

			const to = anim.value;
			const toColor = to && typeof to === 'object' && to.r !== undefined ? to : null;
			if (!toColor) continue;

			const dur2 = Math.max(0, Math.round(anim.duration ?? 300));
			const del2 = Math.max(0, Math.round(anim.delay ?? 0));
			const ease = this._xamlEasing(anim.curve);

			// Cancel any previous storyboard running on this element+property.
			_cancelActiveStoryboard(native, anim.property);
			registered.push({ native, prop: anim.property });

			let brush: any = target._colorAnimBrush ?? null;
			if (!brush) {
				try { if (native.Background instanceof Microsoft.UI.Xaml.Media.SolidColorBrush) brush = native.Background; } catch (_e) {}
				if (!brush) {
					brush = new Microsoft.UI.Xaml.Media.SolidColorBrush({ A: 255, R: 0, G: 0, B: 0 } as any);
					try { native.Background = brush; } catch (_e) {}
				}
			}
			if ('IsDefault' in native) {
				try { (native as any).Resources.Insert('ButtonBackground', brush); } catch (_e) {}
				try { (native as any).Resources.Insert('ButtonBackgroundPointerOver', brush); } catch (_e) {}
				try { (native as any).Resources.Insert('ButtonBackgroundPressed', brush); } catch (_e) {}
			}

			try {
				// ColorAnimationUsingKeyFrames: EasingColorKeyFrame.Value is a plain Windows.UI.Color
				// struct — no IReference<Color> boxing needed (unlike ColorAnimation.To).
				const cauk = new A.ColorAnimationUsingKeyFrames();
				cauk.EnableDependentAnimation = true;
				// BeginTime is IReference<TimeSpan> — box via PropertyValue for non-zero delays.
				// For del2=0, leave unset (null → immediate start).
				if (del2 > 0) {
					try {
						const ts = Windows.Foundation.PropertyValue.CreateTimeSpan({ Duration: del2 * 10000 } as any);
						cauk.BeginTime = ts as never;
					} catch (_e) {
						// PropertyValue unavailable — animation will start at t=0 instead of del2
					}
				}
				let kf: any;
				if (ease) {
					kf = new A.EasingColorKeyFrame();
					kf.EasingFunction = ease;
				} else {
					kf = new A.LinearColorKeyFrame();
				}
				kf.Value = { A: Math.round(toColor.a ?? 255), R: Math.round(toColor.r ?? 0), G: Math.round(toColor.g ?? 0), B: Math.round(toColor.b ?? 0) } as any;
				// KeyTime drives the per-animation duration: { TimeSpan: { Duration: 100ns-ticks } }
				kf.KeyTime = { TimeSpan: { Duration: Math.max(0, dur2) * 10000 } } as any;
				cauk.KeyFrames.Append(kf);
				A.Storyboard.SetTarget(cauk, brush);
				A.Storyboard.SetTargetProperty(cauk, 'Color');
				sb.Children.Append(cauk);
			} catch (_e) {}

			if (del2 + dur2 > maxEnd) maxEnd = del2 + dur2;
		}

		return new Promise<void>((resolve) => {
			let settled = false;
			let safety: any;
			const finalize = () => {
				if (settled) return;
				settled = true;
				clearTimeout(safety);
				for (const { native, prop } of registered) { _clearActiveStoryboard(native, prop); }
				for (const anim of anims) {
					try { _applyFinalValue(anim.target, anim.property, anim.value); } catch (_e) {}
				}
				resolve();
			};
			const cancel = () => {
				if (settled) return;
				settled = true;
				clearTimeout(safety);
				for (const { native, prop } of registered) { _clearActiveStoryboard(native, prop); }
				try { sb.Stop(); } catch (_e) {}
				resolve();
			};

			try { sb.Completed = (() => finalize()) as never; } catch (_e) {}

			// Register one shared cancel on every element+property so a subsequent animation
			// on any of these elements will correctly stop this batch storyboard first.
			for (const { native, prop } of registered) { _registerActiveStoryboard(native, prop, cancel); }
			this._activeCancels.push(cancel);

			// Safety net: max(BeginTime + Duration) + 400ms buffer.
			safety = setTimeout(finalize, maxEnd + 400);

			try { sb.Begin(); } catch (_e) { finalize(); }
		});
	}

	play(_resetDelay?: boolean): any {
		const playPromise = super.play();

		const run = async () => {
			try {
				if (this._playSequentially) {
					for (const anim of this._propertyAnimations) {
						await this._playKeyframeAnimation(anim);
					}
				} else {
					const anims = this._propertyAnimations;
					// Fast path: all parallel animations target backgroundColor with finite iterations.
					// Merge into one Storyboard with per-animation BeginTime — single Begin() call,
					// no per-animation setTimeout storm, compositor handles all cascade timing.
					const canBatch = anims.length > 1 && anims.every(a =>
						a.property === Properties.backgroundColor &&
						a.target?.nativeViewProtected &&
						a.value && typeof a.value === 'object' && a.value.r !== undefined &&
						!(typeof a.iterations === 'number' && (a.iterations <= 0 || !isFinite(a.iterations)))
					);
					if (canBatch) {
						await this._playBatchedColorAnims(anims);
					} else {
						await Promise.all(anims.map((anim) => this._playKeyframeAnimation(anim)));
					}
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
		// Stop in-flight storyboards and resolve their promises.
		try {
			const cancels = this._activeCancels.splice(0);
			for (const c of cancels) { try { c(); } catch (_e) { } }
		} catch (_e) { }

		super.cancel();
		// Only reject if play() set _reject via super.play().
		if (this.isPlaying) {
			this._rejectAnimationFinishedPromise();
		}
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
			const iterations = typeof animation.iterations === 'number' && animation.iterations !== 0 ? animation.iterations : 1;

			const native = (target as any).nativeViewProtected;
			if (native) {
				this._startStoryboardForProperty(native, property, to, duration, delay, '', target, animation.curve, iterations).then(() => resolve());
			} else {
				// No native view yet — apply final value immediately so the animation doesn't hang.
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
