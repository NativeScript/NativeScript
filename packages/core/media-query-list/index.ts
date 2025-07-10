import { EventData, Observable } from '../data/observable';
import { Screen } from '../platform';
import { getApplicationProperties, toggleApplicationEventListeners } from '../application/helpers-common';
import type { ApplicationEventData } from '../application/application-interfaces';
import { matchQuery, MediaQueryType } from '../css-mediaquery';
import { Trace } from '../trace';

const mediaQueryLists: MediaQueryListImpl[] = [];

// In browser, developers cannot create MediaQueryList instances without calling matchMedia
let isMediaInitializationEnabled: boolean = false;

function onDeviceChange(args: ApplicationEventData) {
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
	const { widthPixels, heightPixels } = Screen.mainScreen;

	let matches: boolean;

	try {
		const appProperties = getApplicationProperties();
		matches = matchQuery(mediaQueryString, {
			type: MediaQueryType.screen,
			width: widthPixels,
			height: heightPixels,
			'device-width': widthPixels,
			'device-height': heightPixels,
			orientation: appProperties.orientation,
			'prefers-color-scheme': appProperties.systemAppearance,
		});
	} catch (err) {
		matches = false;
		Trace.write(err, Trace.categories.MediaQuery, Trace.messageType.error);
	}

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
