import { compileQuery, matches, Environment } from 'media-query-fns';
import { EventData, Observable } from '../data/observable';
import { Screen } from '../platform';
import { Application, ApplicationEventData } from '../application';

const mediaQueryLists: MediaQueryListImpl[] = [];
const applicationEvents: string[] = [Application.orientationChangedEvent, Application.systemAppearanceChangedEvent];

// In browser, developers cannot create MediaQueryList instances without calling matchMedia
let isMediaInitializationEnabled: boolean = false;

function toggleApplicationEventListeners(toAdd: boolean) {
	for (const eventName of applicationEvents) {
		if (toAdd) {
			Application.on(eventName, onDeviceChange);
		} else {
			Application.off(eventName, onDeviceChange);
		}
	}
}

function onDeviceChange(args: ApplicationEventData) {
	for (const mql of mediaQueryLists) {
		const matches = validateMediaQuery(mql.media);
		if (mql.matches !== matches) {
			mql._matches = matches;

			mql.notify({
				eventName: MediaQueryListImpl.changeEvent,
				object: mql,
				matches: mql.matches,
				media: mql.media,
			});
		}
	}
}

function validateMediaQuery(mediaQueryString: string): boolean {
	const complexQuery = compileQuery(mediaQueryString);
	return matches(complexQuery, {
		widthPx: Screen.mainScreen.widthPixels,
		heightPx: Screen.mainScreen.heightPixels,
		deviceWidthPx: Screen.mainScreen.widthPixels,
		deviceHeightPx: Screen.mainScreen.heightPixels,
		prefersColorScheme: Application.systemAppearance(),
	} as any);
}

function matchMedia(mediaQueryString: string): MediaQueryListImpl {
	isMediaInitializationEnabled = true;
	const mediaQueryList = new MediaQueryListImpl();
	isMediaInitializationEnabled = false;

	Object.defineProperties(mediaQueryList, {
		_isInitialized: {
			value: true,
		},
		_media: {
			writable: true,
			value: mediaQueryString,
		},
		_matches: {
			writable: true,
			value: validateMediaQuery(mediaQueryString),
		},
		_onChange: {
			writable: true,
			value: null,
		},
		mediaQueryChangeListeners: {
			value: new Map<(this: MediaQueryList, ev: MediaQueryListEvent) => any, (data: EventData) => void>(),
		},
	});

	return mediaQueryList;
}

class MediaQueryListImpl extends Observable implements MediaQueryList {
	public static readonly changeEvent = 'change';

	public _media: string;
	public _matches: boolean;

	private readonly _isInitialized: boolean = false;
	private _onChange: (this: MediaQueryList, ev: MediaQueryListEvent) => any;
	private mediaQueryChangeListeners: Map<(this: MediaQueryList, ev: MediaQueryListEvent) => any, (data: EventData) => void>;

	constructor() {
		super();

		if (!isMediaInitializationEnabled) {
			throw new TypeError('Illegal constructor.');
		}
	}

	get media(): string {
		this._throwInvocationErrorIfNeeded();

		return this._media;
	}

	get matches(): boolean {
		this._throwInvocationErrorIfNeeded();

		return this._matches;
	}

	// @ts-ignore
	public addEventListener(eventName: string, callback: (data: EventData) => void, thisArg?: any): void {
		this._throwInvocationErrorIfNeeded();

		const hasChangeListeners = this.hasListeners(MediaQueryListImpl.changeEvent);

		// Call super method first since it throws in the case of bad parameters
		super.addEventListener(eventName, callback, thisArg);

		if (eventName === MediaQueryListImpl.changeEvent && !hasChangeListeners) {
			mediaQueryLists.push(this);

			if (mediaQueryLists.length === 1) {
				toggleApplicationEventListeners(true);
			}
		}
	}

	// @ts-ignore
	public removeEventListener(eventName: string, callback?: (data: EventData) => void, thisArg?: any): void {
		this._throwInvocationErrorIfNeeded();

		// Call super method first since it throws in the case of bad parameters
		super.removeEventListener(eventName, callback, thisArg);

		if (eventName === MediaQueryListImpl.changeEvent) {
			const hasChangeListeners = this.hasListeners(MediaQueryListImpl.changeEvent);

			if (!hasChangeListeners) {
				const index = mediaQueryLists.indexOf(this);
				if (index >= 0) {
					mediaQueryLists.splice(index, 1);

					if (!mediaQueryLists.length) {
						toggleApplicationEventListeners(false);
					}
				}
			}
		}
	}

	addListener(callback: (this: MediaQueryList, ev: MediaQueryListEvent) => any): void {
		// This kind of implementation helps maintain listener registration order
		// regardless of using the deprecated methods or property onchange
		const wrapperCallback = (data) => {
			callback.call(this, <MediaQueryListEvent>{
				matches: this.matches,
				media: this.media,
			});
		};

		// Call this method first since it throws in the case of bad parameters
		this.addEventListener(MediaQueryListImpl.changeEvent, wrapperCallback);
		this.mediaQueryChangeListeners.set(callback, wrapperCallback);
	}

	removeListener(callback: (this: MediaQueryList, ev: MediaQueryListEvent) => any): void {
		if (this.mediaQueryChangeListeners.has(callback)) {
			// Call this method first since it throws in the case of bad parameters
			this.removeEventListener(MediaQueryListImpl.changeEvent, this.mediaQueryChangeListeners.get(callback));
			this.mediaQueryChangeListeners.delete(callback);
		}
	}

	public get onchange(): (this: MediaQueryList, ev: MediaQueryListEvent) => any {
		return this._onChange;
	}

	public set onchange(callback: (this: MediaQueryList, ev: MediaQueryListEvent) => any) {
		// Remove old listener if any
		if (this._onChange) {
			this.removeListener(this._onChange);
		}

		if (callback) {
			this.addListener(callback);
		}

		this._onChange = callback;
	}

	private _throwInvocationErrorIfNeeded() {
		if (!this._isInitialized) {
			throw new TypeError('Illegal invocation');
		}
	}
}

export { matchMedia, MediaQueryListImpl as MediaQueryList, validateMediaQuery };
