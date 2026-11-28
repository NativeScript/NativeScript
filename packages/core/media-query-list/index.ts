import { EventData, Observable } from '../data/observable';
import { Screen } from '../platform/screen';
import { getApplicationProperties, toggleApplicationEventListeners } from '../application/helpers-common';
import type { ApplicationEventData } from '../application/application-interfaces';
import { isEvaluableMediaQuery, matchQuery, MediaQueryType } from '../css-mediaquery';
import { Trace } from '../trace';

const mediaQueryLists: MediaQueryListImpl[] = [];

// In browser, developers cannot create MediaQueryList instances without calling matchMedia
let isMediaInitializationEnabled: boolean = false;

// Query results only change with orientation, appearance or screen metrics.
const matchResultCache = new Map<string, boolean>();
let isCacheInvalidationRegistered = false;

function clearMatchResultCache() {
	matchResultCache.clear();
}

function registerCacheInvalidation() {
	if (isCacheInvalidationRegistered) {
		return;
	}

	isCacheInvalidationRegistered = true;
	toggleApplicationEventListeners(true, clearMatchResultCache);
}

function onDeviceChange(args: ApplicationEventData) {
	// Listener order is not guaranteed, so never re-evaluate against stale results
	clearMatchResultCache();

	for (const mql of mediaQueryLists) {
		const matches = checkIfMediaQueryMatches(mql.media);
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

function checkIfMediaQueryMatches(mediaQueryString: string): boolean {
	const cachedResult = matchResultCache.get(mediaQueryString);
	if (cachedResult !== undefined) {
		return cachedResult;
	}

	let matches: boolean;

	if (isEvaluableMediaQuery(mediaQueryString)) {
		registerCacheInvalidation();

		// Native reads are deferred until a feature in the query asks for them
		let screenPixels: { width: number; height: number };
		let appProperties: ReturnType<typeof getApplicationProperties>;
		const getScreenPixels = () => (screenPixels ??= { width: Screen.mainScreen.widthPixels, height: Screen.mainScreen.heightPixels });
		const getAppProperties = () => (appProperties ??= getApplicationProperties());

		try {
			matches = matchQuery(mediaQueryString, {
				type: MediaQueryType.screen,
				get width() {
					return getScreenPixels().width;
				},
				get height() {
					return getScreenPixels().height;
				},
				get 'device-width'() {
					return getScreenPixels().width;
				},
				get 'device-height'() {
					return getScreenPixels().height;
				},
				get orientation() {
					return getAppProperties().orientation;
				},
				get 'prefers-color-scheme'() {
					return getAppProperties().systemAppearance;
				},
			});
		} catch (err) {
			matches = false;
			Trace.write(err, Trace.categories.MediaQuery, Trace.messageType.error);
		}
	} else {
		matches = false;
		Trace.write(`Media query '${mediaQueryString}' cannot be evaluated and will never match`, Trace.categories.MediaQuery, Trace.messageType.warn);
	}

	matchResultCache.set(mediaQueryString, matches);

	return matches;
}

function matchMedia(mediaQueryString: string): MediaQueryListImpl {
	isMediaInitializationEnabled = true;
	const mediaQueryList = new MediaQueryListImpl();
	isMediaInitializationEnabled = false;

	mediaQueryList._media = mediaQueryString;
	mediaQueryList._matches = checkIfMediaQueryMatches(mediaQueryString);
	return mediaQueryList;
}

class MediaQueryListImpl extends Observable implements MediaQueryList {
	public static readonly changeEvent = 'change';

	public _media: string;
	public _matches: boolean;

	private _onChange: (this: MediaQueryList, ev: MediaQueryListEvent) => any;
	private mediaQueryChangeListeners: Map<(this: MediaQueryList, ev: MediaQueryListEvent) => any, (data: EventData) => void>;

	constructor() {
		super();

		if (!isMediaInitializationEnabled) {
			throw new TypeError('Illegal constructor');
		}

		Object.defineProperties(this, {
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
			_throwInvocationError: {
				value: null,
			},
		});
	}

	get media(): string {
		this._throwInvocationError?.();

		return this._media;
	}

	get matches(): boolean {
		this._throwInvocationError?.();

		return this._matches;
	}

	// @ts-ignore
	public addEventListener(eventName: string, callback: (data: EventData) => void, thisArg?: any, once?: boolean): void {
		this._throwInvocationError?.();

		const hasChangeListeners = this.hasListeners(MediaQueryListImpl.changeEvent);

		// Call super method first since it throws in the case of bad parameters
		super.addEventListener(eventName, callback, thisArg, once);

		if (eventName === MediaQueryListImpl.changeEvent && !hasChangeListeners) {
			mediaQueryLists.push(this);

			if (mediaQueryLists.length === 1) {
				toggleApplicationEventListeners(true, onDeviceChange);
			}
		}
	}

	// @ts-ignore
	public removeEventListener(eventName: string, callback?: (data: EventData) => void, thisArg?: any): void {
		this._throwInvocationError?.();

		// Call super method first since it throws in the case of bad parameters
		super.removeEventListener(eventName, callback, thisArg);

		if (eventName === MediaQueryListImpl.changeEvent) {
			const hasChangeListeners = this.hasListeners(MediaQueryListImpl.changeEvent);

			if (!hasChangeListeners) {
				const index = mediaQueryLists.indexOf(this);
				if (index >= 0) {
					mediaQueryLists.splice(index, 1);

					if (!mediaQueryLists.length) {
						toggleApplicationEventListeners(false, onDeviceChange);
					}
				}
			}
		}
	}

	addListener(callback: (this: MediaQueryList, ev: MediaQueryListEvent) => any): void {
		this._throwInvocationError?.();

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
		this._throwInvocationError?.();

		if (this.mediaQueryChangeListeners.has(callback)) {
			// Call this method first since it throws in the case of bad parameters
			this.removeEventListener(MediaQueryListImpl.changeEvent, this.mediaQueryChangeListeners.get(callback));
			this.mediaQueryChangeListeners.delete(callback);
		}
	}

	public get onchange(): (this: MediaQueryList, ev: MediaQueryListEvent) => any {
		this._throwInvocationError?.();

		return this._onChange;
	}

	public set onchange(callback: (this: MediaQueryList, ev: MediaQueryListEvent) => any) {
		this._throwInvocationError?.();

		// Remove old listener if any
		if (this._onChange) {
			this.removeListener(this._onChange);
		}

		if (callback) {
			this.addListener(callback);
		}

		this._onChange = callback;
	}

	private _throwInvocationError() {
		throw new TypeError('Illegal invocation');
	}
}

export { matchMedia, MediaQueryListImpl as MediaQueryList, checkIfMediaQueryMatches };
