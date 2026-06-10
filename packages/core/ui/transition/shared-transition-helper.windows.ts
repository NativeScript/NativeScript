import type { TransitionInteractiveState, TransitionNavigationType } from '.';
import { SharedTransition, SharedTransitionAnimationType, SharedTransitionState } from './shared-transition';
import { isNumber } from '../../utils/types';

// Supplied by the Frame after it captures FROM-element rects and performs the normal page swap.
// An earlier design kept both pages mounted + removed host children asynchronously — that froze
// later navigation. We only animate the incoming elements' transforms; no host surgery.
interface MorphPair {
	toNative: any; // incoming shared element native
	fromRect: { x: number; y: number; w: number; h: number }; // outgoing element's rect, in host coords
	tag?: string;
}
interface WinTransitionContext {
	host: any;
	pairs: MorphPair[];
	durationMs?: number;
}

// Duration as an ArrayBuffer: the nested TimeSpan field zeros out if passed as a plain object.
function durationBuffer(ms: number): ArrayBuffer {
	const buf = new ArrayBuffer(16);
	const dv = new DataView(buf);
	dv.setBigInt64(0, BigInt(Math.max(1, Math.round(ms)) * 10000), true);
	dv.setInt32(8, 1, true);
	return buf;
}

// GC guard: hold running storyboards until Completed fires.
const _active = new Set<any>();

function rectInHost(nativeEl: any, host: any): { x: number; y: number; w: number; h: number } | null {
	try {
		const gt = nativeEl.TransformToVisual(host);
		const p = gt.TransformPoint(new Windows.Foundation.Point(0, 0));
		return { x: p.X, y: p.Y, w: nativeEl.ActualWidth || 0, h: nativeEl.ActualHeight || 0 };
	} catch (_e) {
		return null;
	}
}

/**
 * Windows Shared Element Transition. iOS snapshots each element into a floated UIImageView; Windows has no
 * such API, so we morph the REAL incoming element: a TransformGroup (scale + translate) places it over the
 * outgoing element's captured rect, then animates to identity. No snapshots, no host-tree surgery.
 */
export class SharedTransitionHelper {
	static animate(state: SharedTransitionState, context: WinTransitionContext, type: TransitionNavigationType): void {
		const present = state?.activeType !== SharedTransitionAnimationType.dismiss;
		const notify = (name: string) => {
			try { SharedTransition.notifyEvent(name, { id: state.instance?.id, type, action: present ? 'present' : 'dismiss' }); } catch (_e) { }
		};
		try {
			const A: any = Microsoft.UI.Xaml.Media.Animation;
			const host = context?.host;
			const pairs = (context && context.pairs) || [];
			if (!host || !pairs.length) { return; }
			const dur = isNumber(context.durationMs) ? context.durationMs : 350;
			const pageEndTags = (state.pageEnd && state.pageEnd.sharedTransitionTags) || {};

			try { host.UpdateLayout(); } catch (_e) { }

			const sb = new A.Storyboard();
			const addDouble = (targetObj: any, prop: string, from: number, to: number) => {
				const da = new A.DoubleAnimation();
				da.From = from;
				da.To = to;
				da.Duration = durationBuffer(dur) as never;
				const ease = new A.CubicEase();
				ease.EasingMode = A.EasingMode.EaseInOut;
				da.EasingFunction = ease;
				A.Storyboard.SetTarget(da, targetObj);
				A.Storyboard.SetTargetProperty(da, prop);
				sb.Children.Append(da);
			};

			const restores: Array<() => void> = [];
			let morphed = 0;

			for (const pair of pairs) {
				const toNative = pair.toNative;
				const fromRect = pair.fromRect;
				if (!toNative || !fromRect) continue;
				const toRect = rectInHost(toNative, host);
				if (!toRect || toRect.w <= 0 || toRect.h <= 0 || fromRect.w <= 0 || fromRect.h <= 0) continue;

				const tx = fromRect.x - toRect.x;
				const ty = fromRect.y - toRect.y;
				const sx = fromRect.w / toRect.w;
				const sy = fromRect.h / toRect.h;

				// TransformGroup(scale, translate); CompositeTransform.TranslateX/ScaleX do NOT animate in this host.
				const st = new Microsoft.UI.Xaml.Media.ScaleTransform();
				st.ScaleX = sx;
				st.ScaleY = sy;
				const tt = new Microsoft.UI.Xaml.Media.TranslateTransform();
				tt.X = tx;
				tt.Y = ty;
				const tg = new Microsoft.UI.Xaml.Media.TransformGroup();
				tg.Children.Append(st);
				tg.Children.Append(tt);
				try { toNative.RenderTransformOrigin = Microsoft.UI.Xaml.PointHelper.FromCoordinates(0, 0); } catch (_e) { }
				toNative.RenderTransform = tg;

				const z = pair.tag && pageEndTags[pair.tag] && isNumber(pageEndTags[pair.tag].zIndex) ? pageEndTags[pair.tag].zIndex : null;
				if (z != null) { try { Microsoft.UI.Xaml.Controls.Panel.SetZIndex(toNative, z); } catch (_e) { } }

				addDouble(tt, 'X', tx, 0);
				addDouble(tt, 'Y', ty, 0);
				addDouble(st, 'ScaleX', sx, 1);
				addDouble(st, 'ScaleY', sy, 1);
				restores.push(() => { try { toNative.RenderTransform = null; } catch (_e) { } });
				morphed++;
			}

			if (morphed === 0) { return; }

			let settled = false;
			const finish = () => {
				if (settled) return;
				settled = true;
				_active.delete(sb);
				for (const r of restores) { try { r(); } catch (_e) { } }
				try { SharedTransition.updateState(state.instance.id, { activeType: present ? SharedTransitionAnimationType.dismiss : SharedTransitionAnimationType.present }); } catch (_e) { }
				if (!present) { try { SharedTransition.finishState(state.instance.id); } catch (_e) { } }
				notify(SharedTransition.finishedEvent);
			};

			_active.add(sb);
			try { sb.Completed = (() => finish()) as never; } catch (_e) { }
			notify(SharedTransition.startedEvent);
			// Defer Begin one frame: Storyboard.Begin() on a just-mounted element jumps to the end in this host.
			setTimeout(() => { try { sb.Begin(); } catch (_e) { finish(); } }, 32);
			setTimeout(finish, dur + 450); // safety: ensure finish lands if Completed never fires
		} catch (_e) {
			notify(SharedTransition.finishedEvent);
		}
	}

	// Interactive (gesture-driven) dismissal is iOS-only; no-op on Windows.
	static interactiveStart(_state: SharedTransitionState, _interactiveState: TransitionInteractiveState, _type: TransitionNavigationType): void { }
	static interactiveUpdate(_state: SharedTransitionState, _interactiveState: TransitionInteractiveState, _type: TransitionNavigationType, _percent: number): void { }
	static interactiveCancel(_state: SharedTransitionState, _interactiveState: TransitionInteractiveState, _type: TransitionNavigationType): void { }
	static interactiveFinish(_state: SharedTransitionState, _interactiveState: TransitionInteractiveState, _type: TransitionNavigationType): void { }
}
