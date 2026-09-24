import { Observable } from '../data/observable';
import { notifyCssEnvironmentChanged, registerCssEnvironmentVariable } from '../ui/styling/css-env';
import type { SafeAreaInsets } from './safe-area-interfaces';

export const ZERO_INSETS: SafeAreaInsets = Object.freeze({ top: 0, right: 0, bottom: 0, left: 0 });

const EDGES = ['top', 'right', 'bottom', 'left'] as const;

export class SafeAreaCommon extends Observable {
	public static insetsChangedEvent = 'insetsChanged';

	private _insets: SafeAreaInsets = ZERO_INSETS;
	private _maxInsets: SafeAreaInsets = ZERO_INSETS;
	private _subscribed = false;

	/**
	 * Opt in to tracking which view already consumed an edge. Off by default, because
	 * turning it on changes what existing layouts inset.
	 */
	public trackConsumption = false;

	constructor() {
		super();

		// The spec types these as <length>; dip is NativeScript's css pixel.
		for (const edge of EDGES) {
			registerCssEnvironmentVariable(`safe-area-inset-${edge}`, 0, () => `${this.insets[edge]}dip`);
			registerCssEnvironmentVariable(`safe-area-max-inset-${edge}`, 0, () => `${this.maxInsets[edge]}dip`);
		}
	}

	get insets(): SafeAreaInsets {
		this.ensureSubscribed();

		return this._insets;
	}

	get maxInsets(): SafeAreaInsets {
		this.ensureSubscribed();

		return this._maxInsets;
	}

	/**
	 * Reads the window insets, or returns null while there is no window.
	 */
	protected read(): SafeAreaInsets | null {
		return null;
	}

	/**
	 * Subscribes to platform inset changes, returning false to be retried later.
	 */
	protected subscribe(): boolean {
		return false;
	}

	public refresh(): boolean {
		this.ensureSubscribed();

		const insets = this.read();

		return insets ? this._setInsets(insets.top, insets.right, insets.bottom, insets.left) : false;
	}

	public _setInsets(top: number, right: number, bottom: number, left: number): boolean {
		const previous = this._insets;
		if (previous.top === top && previous.right === right && previous.bottom === bottom && previous.left === left) {
			return false;
		}

		this._insets = Object.freeze({ top, right, bottom, left });

		const max = this._maxInsets;
		if (top > max.top || right > max.right || bottom > max.bottom || left > max.left) {
			this._maxInsets = Object.freeze({
				top: Math.max(max.top, top),
				right: Math.max(max.right, right),
				bottom: Math.max(max.bottom, bottom),
				left: Math.max(max.left, left),
			});
		}

		notifyCssEnvironmentChanged();
		this.notify({
			eventName: SafeAreaCommon.insetsChangedEvent,
			object: this,
			insets: this._insets,
			previousInsets: previous,
		});

		return true;
	}

	public _resetMaxInsets(): void {
		this._maxInsets = this._insets;
	}

	// There is no window yet while the first stylesheets are parsed, so this retries.
	private ensureSubscribed(): void {
		if (this._subscribed) {
			return;
		}

		this._subscribed = this.subscribe();
		if (!this._subscribed) {
			return;
		}

		// Seeded silently: this runs from a getter, and nothing has resolved yet.
		const insets = this.read();
		if (insets) {
			this._insets = Object.freeze({ top: insets.top, right: insets.right, bottom: insets.bottom, left: insets.left });
			this._maxInsets = this._insets;
		}
	}
}
