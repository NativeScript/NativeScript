import { Observable, PropertyChangeData } from '../data/observable';

export class FontScaleObservableBase extends Observable {
	public static readonly FONT_SCALE = 'fontScale';
	public static readonly IS_EXTRA_SMALL = 'isExtraSmall';
	public static readonly IS_EXTRA_LARGE = 'isExtraLarge';

	public static get VALID_FONT_SCALES(): number[] {
		if (global.isIOS) {
			// iOS supports a wider number of font scales than Android does.
			return [0.5, 0.7, 0.85, 1, 1.15, 1.3, 1.5, 2, 2.5, 3, 3.5, 4];
		}

		if (global.isAndroid) {
			return [0.85, 1, 1.15, 1.3];
		}

		return [];
	}

	public readonly fontScale = 1;
	public readonly isExtraSmall = false;
	public readonly isExtraLarge = false;

	constructor() {
		super();

		let internalObservable = this._setupNativeObservable();

		const selfRef = new WeakRef(this);
		function callback(args: PropertyChangeData) {
			const self = selfRef.get();
			if (self) {
				self.set(args.propertyName, args.value);

				return;
			}

			internalObservable.off(Observable.propertyChangeEvent, callback);
			internalObservable = null;
		}

		internalObservable.on(Observable.propertyChangeEvent, callback);

		const fontScale = internalObservable.get(FontScaleObservableBase.FONT_SCALE) ?? 1;
		this.set(FontScaleObservableBase.IS_EXTRA_SMALL, global.isAndroid ? false : fontScale < 0.85);
		this.set(FontScaleObservableBase.IS_EXTRA_LARGE, global.isAndroid ? false : fontScale > 1.5);
		this.set(FontScaleObservableBase.FONT_SCALE, fontScale);
	}

	protected _setupNativeObservable(): Observable {
		return new Observable();
	}
}

export function getClosestValidFontScale(fontScale: number): number {
	fontScale = Number(fontScale) || 1;

	return FontScaleObservableBase.VALID_FONT_SCALES.sort((a, b) => Math.abs(fontScale - a) - Math.abs(fontScale - b)).shift();
}
