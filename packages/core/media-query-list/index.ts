import { EventData, Observable } from '../data/observable';
import { Screen } from '../platform';
import { Application, ApplicationEventData } from '../application';
import { matchQuery, MediaQueryType } from '../css-mediaquery';
import { Trace } from '../trace';

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
	const { widthPixels, heightPixels } = Screen.mainScreen;

	let matches: boolean;

	try {
		matches = matchQuery(mediaQueryString, {
			type: MediaQueryType.screen,
			width: widthPixels,
			height: heightPixels,
			'device-width': widthPixels,
			'device-height': heightPixels,
			orientation: Application.orientation(),
			'prefers-color-scheme': Application.systemAppearance(),
		});
	} catch (err) {
		matches = false;
		Trace.write(err, Trace.categories.Style, Trace.messageType.error);
	}

	return matches;
}

function matchMedia(mediaQueryString: string): MediaQueryListImpl {
	isMediaInitializationEnabled = true;
	const mediaQueryList = new MediaQueryListImpl();
	isMediaInitializationEnabled = false;

	mediaQueryList._media = mediaQueryString;
	mediaQueryList._matches = validateMediaQuery(mediaQueryString);
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

		Object.defineProperties(this, {
			_isInitialized: {
				value: true,
			},
			_media: {
				writable: true,
			},
			_matches: {
				writable: true,
			},
			_onChange: {
				writable: true,
				value: null,
			},
			mediaQueryChangeListeners: {
				value: new Map<(this: MediaQueryList, ev: MediaQueryListEvent) => any, (data: EventData) => void>(),
			},
		});
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
		this._throwInvocationErrorIfNeeded();

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
		this._throwInvocationErrorIfNeeded();

		if (this.mediaQueryChangeListeners.has(callback)) {
			// Call this method first since it throws in the case of bad parameters
			this.removeEventListener(MediaQueryListImpl.changeEvent, this.mediaQueryChangeListeners.get(callback));
			this.mediaQueryChangeListeners.delete(callback);
		}
	}

	public get onchange(): (this: MediaQueryList, ev: MediaQueryListEvent) => any {
		this._throwInvocationErrorIfNeeded();

		return this._onChange;
	}

	public set onchange(callback: (this: MediaQueryList, ev: MediaQueryListEvent) => any) {
		this._throwInvocationErrorIfNeeded();

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
