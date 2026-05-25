export * from './animation-common';
export * from './animation-shared';
export * from './animation-types';

export function _resolveAnimationCurve(curve: any): any {
	return curve;
}

import { AnimationBase, Properties } from './animation-common';
import type { View } from '../core/view';
import { layout } from '../../utils';

export class Animation extends AnimationBase {
	constructor(animationDefinitions: any[], playSequentially?: boolean) {
		super(animationDefinitions, playSequentially);
	}


	// Track running composition animations so we can stop them on cancel
	private _runningCompositionAnims: Array<{ visual: any; prop: string }> = [];

	// Track running XAML storyboards so we can stop them on cancel
	private _runningStoryboards: Array<{ storyboard: any; native: any; props: string[] }> = [];

	private _ensureNativeTransforms(native: any) {
		try {
			let tg = native.RenderTransform;
			if (!tg || !(tg instanceof Windows.UI.Xaml.Media.TransformGroup)) {
				tg = new Windows.UI.Xaml.Media.TransformGroup();
				const st = new Windows.UI.Xaml.Media.ScaleTransform();
				const rt = new Windows.UI.Xaml.Media.RotateTransform();
				const tt = new Windows.UI.Xaml.Media.TranslateTransform();
				tg.Children.Append(st);
				tg.Children.Append(rt);
				tg.Children.Append(tt);
				native.RenderTransform = tg;
			}

			const children = tg.Children;
			let scaleTransform: any = null;
			let rotateTransform: any = null;
			let translateTransform: any = null;
			const count = children?.Size || 0;
			for (let i = 0; i < count; i++) {
				const c = children.GetAt(i);
				if (c instanceof Windows.UI.Xaml.Media.ScaleTransform) scaleTransform = c;
				else if (c instanceof Windows.UI.Xaml.Media.RotateTransform) rotateTransform = c;
				else if (c instanceof Windows.UI.Xaml.Media.TranslateTransform) translateTransform = c;
			}
			if (!scaleTransform) {
				scaleTransform = new Windows.UI.Xaml.Media.ScaleTransform();
				children.Append(scaleTransform);
			}
			if (!rotateTransform) {
				rotateTransform = new Windows.UI.Xaml.Media.RotateTransform();
				children.Append(rotateTransform);
			}
			if (!translateTransform) {
				translateTransform = new Windows.UI.Xaml.Media.TranslateTransform();
				children.Append(translateTransform);
			}

			return { scaleTransform, rotateTransform, translateTransform };
		} catch (_e) {
			return { scaleTransform: null, rotateTransform: null, translateTransform: null };
		}
	}

	private _startStoryboardForProperty(native: any, property: string, to: any, dur: number, del: number, tid2: string) {
		return new Promise<void>((resolve) => {
					try {
						const sb = new Windows.UI.Xaml.Media.Animation.Storyboard();
						console.log(`[Animation.Windows] Building Storyboard for ${property} target=${tid2}`);
				const makeTimeSpan = (ms: number) => {
					return Windows.Foundation.PropertyValue.CreateTimeSpan({ Duration: Math.round(ms * 10000) }) as any;
				};

				const duration = Windows.UI.Xaml.DurationHelper.FromTimeSpan(makeTimeSpan(dur));
				const beginTime = del > 0 ? makeTimeSpan(del) : null;

				switch (property) {
					case Properties.scale: {
						const transforms = this._ensureNativeTransforms(native);
						const st = transforms.scaleTransform;
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
						const transforms = this._ensureNativeTransforms(native);
						const rt = transforms.rotateTransform;
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
						const transforms = this._ensureNativeTransforms(native);
						const tt = transforms.translateTransform;
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
						try {
							let brush = native.Background;
							const toColor = to && typeof to === 'object' && to.r !== undefined ? to : null;
							const makeWinColor = (c: any) => {
								try {
									const a = Math.round((c.a ?? 255));
									const r = Math.round((c.r ?? 0));
									const g = Math.round((c.g ?? 0));
									const b = Math.round((c.b ?? 0));
									return Windows.UI.ColorHelper.FromArgb(a, r, g, b);
								} catch (_e) { return Windows.UI.ColorHelper.FromArgb(255, 0, 0, 0); }
							};
							const winColor = toColor ? makeWinColor(to) : (typeof to === 'string' ? Windows.UI.ColorHelper.FromArgb(255, 0, 0, 0) : makeWinColor({ r: 0, g: 0, b: 0, a: 255 }));
							try {
								if (!brush || !(brush instanceof Windows.UI.Xaml.Media.SolidColorBrush)) {
									brush = new Windows.UI.Xaml.Media.SolidColorBrush(winColor);
									native.Background = brush;
								}
								const ca = new Windows.UI.Xaml.Media.Animation.ColorAnimation();
								ca.To = winColor;
								ca.Duration = duration;
								if (beginTime) ca.BeginTime = beginTime;
								Windows.UI.Xaml.Media.Animation.Storyboard.SetTarget(ca, brush);
								Windows.UI.Xaml.Media.Animation.Storyboard.SetTargetProperty(ca, 'Color');
								sb.Children.Append(ca);
							} catch (err) {
								console.error('[Animation.Windows] Storyboard color build failed', err);
							}
							break;
							} catch (_e) { break; }
					}
					default:
						break;
				}

				try {
					sb.Completed = (_s: any, _e: any) => {
						try { sb.Stop(); } catch (_err) { }
						// remove from running storyboards
						for (let i = 0; i < this._runningStoryboards.length; i++) {
							if (this._runningStoryboards[i].storyboard === sb) {
								this._runningStoryboards.splice(i, 1);
								break;
							}
						}
						resolve();
					};
							this._runningStoryboards.push({ storyboard: sb, native, props: [property] });
							console.log(`[Animation.Windows] Storyboard begin for ${property} target=${tid2}`);
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
		// Stop any running Composition animations
		try {
			for (const it of this._runningCompositionAnims) {
				try {
					if (it && it.visual && typeof it.visual.StopAnimation === 'function') {
						it.visual.StopAnimation(it.prop);
					}
				} catch (_e) { }
			}
		} catch (_e) { }
		this._runningCompositionAnims.length = 0;

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

			// Debug trace: log animation start
			try {
				const tgt = animation.target as View;
				const tid = (tgt && (tgt as any).id) || (tgt && (tgt as any)._domId) || '(no-id)';
				console.log(`[Animation.Windows] start prop=${animation.property} target=${tid} value=${JSON.stringify(animation.value)} duration=${animation.duration} delay=${animation.delay}`);
			} catch (_e) { }

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

			// Try native Composition animations when possible (faster and smoother)
			try {
				const tgt2 = target as View;
				const tid2 = (tgt2 && (tgt2 as any).id) || (tgt2 && (tgt2 as any)._domId) || '(no-id)';
				console.log(`[Animation.Windows] attempting Composition for prop=${property} target=${tid2}`);
				if (target && (target as any).nativeViewProtected && typeof Windows !== 'undefined' && Windows && Windows.UI && Windows.UI.Xaml && Windows.UI.Xaml.Hosting && Windows.UI.Xaml.Hosting.ElementCompositionPreview) {
					const native = (target as any).nativeViewProtected;
					console.log(`[Animation.Windows] nativeViewProtected present=${!!native} for ${tid2}`);

						// Some XAML controls (Button / templated controls) don't reflect Visual animations reliably
						// Prefer Storyboard for those controls for visible effects until Composition issues are resolved.
						try {
							if (native instanceof Windows.UI.Xaml.Controls.Button) {
								console.log(`[Animation.Windows] Native is Button; using Storyboard for ${property} on ${tid2}`);
								this._startStoryboardForProperty(native, property, to, dur, del, tid2).then(() => {
									resolve();
								});
								return;
							}
						} catch (_e) { }
					const visual = Windows.UI.Xaml.Hosting.ElementCompositionPreview.GetElementVisual(native);
					console.log(`[Animation.Windows] ElementVisual present=${!!visual} for ${tid2}`);
					// Check if system animations are enabled (accessibility setting)
					try {
						if (Windows && Windows.UI && Windows.UI.ViewManagement && Windows.UI.ViewManagement.UISettings) {
							try {
								const uiSettings = new Windows.UI.ViewManagement.UISettings();
								if (typeof uiSettings.AnimationsEnabled !== 'undefined') {
									console.log(`[Animation.Windows] UISettings.AnimationsEnabled=${uiSettings.AnimationsEnabled}`);
									if (!uiSettings.AnimationsEnabled) {
										console.warn('[Animation.Windows] System animations appear disabled; Composition animations may be suppressed');
									}
								}
							} catch (_e) { }
						}
					} catch (_e) { }

					// Ensure sensible pivot for scale/rotation (center of element)
					try {
						const w = (native && (native.ActualWidth || (native.RenderSize && native.RenderSize.Width) || native.Width)) || 0;
						const h = (native && (native.ActualHeight || (native.RenderSize && native.RenderSize.Height) || native.Height)) || 0;
						visual.CenterPoint = new Windows.Foundation.Numerics.Vector3(w / 2, h / 2, 0);
						visual.RotationAxis = new Windows.Foundation.Numerics.Vector3(0, 0, 1);
						console.log(`[Animation.Windows] visual.CenterPoint set to ${w/2},${h/2} for ${tid2}`);
					} catch (e) {
						console.error('[Animation.Windows] set CenterPoint failed', e);
					}
					const compositor = visual && visual.Compositor;
					const dur = typeof duration === 'number' ? duration : 300;
					const del = typeof delay === 'number' ? delay : 0;

					const readVec3 = (v: any) => {
						if (!v) return '{null}';
						try {
							const x = v.x ?? v.X ?? (v.X !== undefined ? v.X : undefined);
							const y = v.y ?? v.Y ?? (v.Y !== undefined ? v.Y : undefined);
							const z = v.z ?? v.Z ?? (v.Z !== undefined ? v.Z : undefined);
							return `{x:${x},y:${y},z:${z}}`;
						} catch (_e) {
							return String(v);
						}
					};
					let makeTimeSpan = (ms: number) => {
						try {
							const ts = new Windows.Foundation.TimeSpan();
							ts.Duration = Math.round(ms * 10000);
							return ts;
						} catch (e1) {
							try {
								return Windows.Foundation.PropertyValue.CreateTimeSpan({ Duration: Math.round(ms * 10000) } as any) as unknown as Windows.Foundation.TimeSpan;
							} catch (e2) {
								return { Duration: Math.round(ms * 10000) } as any;
							}
						}
					};

					const finishAfter = (ms: number) => setTimeout(() => resolve(), Math.max(0, Math.round(ms)));

					let finishTimer: any = null;
					let resolved = false;
					const startFinishTimer = (ms: number) => {
						finishTimer = setTimeout(() => {
							if (!resolved) {
								resolved = true;
								resolve();
							}
						}, Math.max(0, Math.round(ms)));
					};

					switch (property) {
						case Properties.opacity: {
							try {
								const animObj = compositor.CreateScalarKeyFrameAnimation();
								const startOpacity = typeof visual.Opacity === 'number' ? visual.Opacity : (startValues && startValues.opacity) || 1;
								try { animObj.InsertKeyFrame(0.0, startOpacity); } catch (_e) { }
								animObj.InsertKeyFrame(1.0, to);
								try { animObj.Duration = makeTimeSpan(dur); } catch (err) { console.error('[Animation.Windows] set Duration failed', err); }
								if (del > 0) {
									try { animObj.DelayTime = makeTimeSpan(del); } catch (err) { console.error('[Animation.Windows] set DelayTime failed', err); }
								}
								visual.StartAnimation('Opacity', animObj);
								this._runningCompositionAnims.push({ visual, prop: 'Opacity' });
								console.log(`[Animation.Windows] started Composition anim=Opacity target=${tid2} from=${startOpacity} to=${to} dur=${dur}`);
								startFinishTimer(dur + del + 20);
								// Probe to see if Composition actually moved the visual; if not, fallback to XAML Storyboard
								setTimeout(() => {
									try {
										const cur = typeof visual.Opacity === 'number' ? visual.Opacity : (startValues && startValues.opacity) || 1;
										console.log(`[Animation.Windows] probe visual.Opacity=${cur} for ${tid2}`);
										const target = to;
										if (Math.abs(cur - (startValues && startValues.opacity || 1)) < 0.01 && Math.abs(target - (startValues && startValues.opacity || 1)) > 0.05) {
											console.log(`[Animation.Windows] Composition seems inert; falling back to Storyboard for Opacity on ${tid2}`);
											// Composition didn't move; switch to Storyboard fallback
											try { visual.StopAnimation('Opacity'); } catch (_e) { }
											for (let i = 0; i < this._runningCompositionAnims.length; i++) {
												if (this._runningCompositionAnims[i].visual === visual && this._runningCompositionAnims[i].prop === 'Opacity') {
													this._runningCompositionAnims.splice(i, 1);
													break;
												}
											}
											clearTimeout(finishTimer);
											this._startStoryboardForProperty(native, property, to, dur, del, tid2).then(() => {
												if (!resolved) { resolved = true; resolve(); }
											});
										}
									} catch (_e) { }
								}, del + Math.max(150, Math.round(dur / 3)));
							return;
							} catch (err) {
								console.error('[Animation.Windows] Composition opacity failed', err);
							}
							break;
						}
						case Properties.translate: {
							try {
								const animObj = compositor.CreateVector3KeyFrameAnimation();
								const vx = (to && (to.x ?? to)) || 0;
								const vy = (to && (to.y ?? 0)) || 0;
								const startOffset = (visual && visual.Offset) || new Windows.Foundation.Numerics.Vector3(0, 0, 0);
								try { animObj.InsertKeyFrame(0.0, startOffset); } catch (_e) { }
								animObj.InsertKeyFrame(1.0, new Windows.Foundation.Numerics.Vector3(layout.toDeviceIndependentPixels(vx), layout.toDeviceIndependentPixels(vy), 0));
								try { animObj.Duration = makeTimeSpan(dur); } catch (err) { console.error('[Animation.Windows] set Duration failed', err); }
								if (del > 0) {
									try { animObj.DelayTime = makeTimeSpan(del); } catch (err) { console.error('[Animation.Windows] set DelayTime failed', err); }
								}
								visual.StartAnimation('Offset', animObj);
								this._runningCompositionAnims.push({ visual, prop: 'Offset' });
								console.log(`[Animation.Windows] started Composition anim=Offset target=${tid2} from=${readVec3(startOffset)} to=${vx},${vy} dur=${dur}`);
								startFinishTimer(dur + del + 20);
								// Probe for movement and fallback to Storyboard if necessary
								setTimeout(() => {
									try {
										const cur = visual && visual.Offset ? visual.Offset : startOffset;
										console.log(`[Animation.Windows] probe visual.Offset=${readVec3(cur)} for ${tid2}`);
										const changedX = Math.abs((cur.x ?? cur.X ?? 0) - (startOffset.x ?? startOffset.X ?? 0));
										const targetX = layout.toDeviceIndependentPixels(vx);
										if (changedX < 0.01 && Math.abs(targetX - (startOffset.x ?? startOffset.X ?? 0)) > 0.05) {
											console.log(`[Animation.Windows] Composition seems inert; falling back to Storyboard for Offset on ${tid2}`);
											try { visual.StopAnimation('Offset'); } catch (_e) { }
											for (let i = 0; i < this._runningCompositionAnims.length; i++) {
												if (this._runningCompositionAnims[i].visual === visual && this._runningCompositionAnims[i].prop === 'Offset') {
													this._runningCompositionAnims.splice(i, 1);
													break;
												}
											}
											clearTimeout(finishTimer);
											this._startStoryboardForProperty(native, property, to, dur, del, tid2).then(() => {
												if (!resolved) { resolved = true; resolve(); }
											});
										}
									} catch (_e) { }
								}, del + Math.max(150, Math.round(dur / 3)));
								return;
							} catch (err) { console.error('[Animation.Windows] Composition translate failed', err); }
							break;
						}
						case Properties.scale: {
							try {
								const animObj = compositor.CreateVector3KeyFrameAnimation();
								const sx = (to && (to.x ?? to)) || 1;
								const sy = (to && (to.y ?? to)) || 1;
								const startScale = (visual && visual.Scale) || new Windows.Foundation.Numerics.Vector3(1, 1, 1);
								try { animObj.InsertKeyFrame(0.0, startScale); } catch (_e) { }
								animObj.InsertKeyFrame(1.0, new Windows.Foundation.Numerics.Vector3(sx, sy, 1));
								try { animObj.Duration = makeTimeSpan(dur); } catch (err) { console.error('[Animation.Windows] set Duration failed', err); }
								if (del > 0) {
									try { animObj.DelayTime = makeTimeSpan(del); } catch (err) { console.error('[Animation.Windows] set DelayTime failed', err); }
								}
								visual.StartAnimation('Scale', animObj);
								this._runningCompositionAnims.push({ visual, prop: 'Scale' });
								console.log(`[Animation.Windows] started Composition anim=Scale target=${tid2} from=${readVec3(startScale)} to=${sx},${sy} dur=${dur}`);
								startFinishTimer(dur + del + 20);
								// Probe for visible change; fallback to Storyboard if needed
								setTimeout(() => {
									try {
										const cur = visual && visual.Scale ? visual.Scale : startScale;
										console.log(`[Animation.Windows] probe visual.Scale=${readVec3(cur)} for ${tid2}`);
										const curX = cur.x ?? cur.X ?? 0;
										if (Math.abs(curX - (startScale.x ?? startScale.X ?? 0)) < 0.01 && Math.abs(sx - (startScale.x ?? startScale.X ?? 0)) > 0.05) {
											console.log(`[Animation.Windows] Composition seems inert; falling back to Storyboard for Scale on ${tid2}`);
											try { visual.StopAnimation('Scale'); } catch (_e) { }
											for (let i = 0; i < this._runningCompositionAnims.length; i++) {
												if (this._runningCompositionAnims[i].visual === visual && this._runningCompositionAnims[i].prop === 'Scale') {
													this._runningCompositionAnims.splice(i, 1);
													break;
												}
											}
											clearTimeout(finishTimer);
											this._startStoryboardForProperty(native, property, to, dur, del, tid2).then(() => {
												if (!resolved) { resolved = true; resolve(); }
											});
										}
									} catch (_e) { }
								}, del + Math.max(150, Math.round(dur / 3)));
								return;
							} catch (err) { console.error('[Animation.Windows] Composition scale failed', err); }
							break;
						}
						case Properties.rotate: {
							try {
								const animObj = compositor.CreateScalarKeyFrameAnimation();
								const angle = (to && (to.z ?? to)) || 0;
								const startAngle = typeof visual.RotationAngleInDegrees === 'number' ? visual.RotationAngleInDegrees : (startValues && startValues.rotate) || 0;
								try { animObj.InsertKeyFrame(0.0, startAngle); } catch (_e) { }
								animObj.InsertKeyFrame(1.0, angle);
								try { animObj.Duration = makeTimeSpan(dur); } catch (err) { console.error('[Animation.Windows] set Duration failed', err); }
								if (del > 0) {
									try { animObj.DelayTime = makeTimeSpan(del); } catch (err) { console.error('[Animation.Windows] set DelayTime failed', err); }
								}
								// Rotation property on Visual is RotationAngleInDegrees
								visual.StartAnimation('RotationAngleInDegrees', animObj);
								this._runningCompositionAnims.push({ visual, prop: 'RotationAngleInDegrees' });
								console.log(`[Animation.Windows] started Composition anim=Rotation target=${tid2} from=${startAngle} to=${angle} dur=${dur}`);
								startFinishTimer(dur + del + 20);
								setTimeout(() => {
									try {
										const cur = typeof visual.RotationAngleInDegrees === 'number' ? visual.RotationAngleInDegrees : (startValues && startValues.rotate) || 0;
										console.log(`[Animation.Windows] probe visual.RotationAngleInDegrees=${cur} for ${tid2}`);
										if (Math.abs(cur - (startValues && startValues.rotate || 0)) < 0.01 && Math.abs(angle - (startValues && startValues.rotate || 0)) > 0.05) {
											console.log(`[Animation.Windows] Composition seems inert; falling back to Storyboard for Rotation on ${tid2}`);
											try { visual.StopAnimation('RotationAngleInDegrees'); } catch (_e) { }
											for (let i = 0; i < this._runningCompositionAnims.length; i++) {
												if (this._runningCompositionAnims[i].visual === visual && this._runningCompositionAnims[i].prop === 'RotationAngleInDegrees') {
													this._runningCompositionAnims.splice(i, 1);
													break;
												}
											}
											clearTimeout(finishTimer);
											this._startStoryboardForProperty(native, property, to, dur, del, tid2).then(() => {
												if (!resolved) { resolved = true; resolve(); }
											});
										}
									} catch (_e) { }
								}, del + Math.max(150, Math.round(dur / 3)));
								return;
							} catch (err) { console.error('[Animation.Windows] Composition rotate failed', err); }
							break;
						}
					}
					// If we reach here, Composition wasn't available or didn't support this property.
					// Apply final values immediately (no RAF fallback).
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
							{
								const ColorClass: any = (global as any).Color || (typeof require === 'function' && require('../../color').Color) || null;
								if (ColorClass && to instanceof Object && to.r !== undefined) {
									(target as any).backgroundColor = new ColorClass(to.r, to.g, to.b, to.a ?? 255);
								}
							}
							break;
						default:
							break;
					}
				}
			} catch (err) {
				console.error('[Animation.Windows] composition path error', err);
				// Fallback: apply final values and resolve so the animation doesn't hang
				try {
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
							{
								const ColorClass: any = (global as any).Color || (typeof require === 'function' && require('../../color').Color) || null;
								if (ColorClass && to instanceof Object && to.r !== undefined) {
									(target as any).backgroundColor = new ColorClass(to.r, to.g, to.b, to.a ?? 255);
								}
							}
							break;
						default:
							break;
					}
				} catch (_e) { }
				resolve();
				return;
			}

			resolve();
		});
	}

	_createiOSAnimationFunction(_animation: Properties, _delay?: number): any {
		return null;
	}

	static _getTransformAnimationInfo(_view: View, _transformation: any): any {
		return {};
	}
}
