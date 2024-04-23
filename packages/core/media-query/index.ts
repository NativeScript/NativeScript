import { compileQuery, matches, Environment } from 'media-query-fns';
import { EventData, Observable } from '../data/observable';
import { Screen } from '../platform';

export const trackedMediaQueryLists: MediaQueryList[] = [];

export function validateMediaQuery(mediaQueryString: string): boolean {
	const complexQuery = compileQuery(mediaQueryString);
	return matches(complexQuery, <Environment>{
		widthPx: Screen.mainScreen.widthPixels,
		heightPx: Screen.mainScreen.heightPixels,
		deviceWidthPx: Screen.mainScreen.widthPixels,
		deviceHeightPx: Screen.mainScreen.heightPixels,
		//prefersColorScheme: 0,
	});
}

export function matchMedia(mediaQueryString: string): MediaQueryList {
	const mediaQueryList = Object.create(MediaQueryList.prototype, {
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
	});

	return mediaQueryList;
}

export class MediaQueryList extends Observable {
	public _media: string;
	public _matches: boolean;

	private _isInitialized: boolean = false;

	constructor() {
		super();

		throw new TypeError('Illegal constructor.');
	}

	get media(): string {
		this._throwInvocationErrorIfNeeded();

		return this._media;
	}

	get matches(): boolean {
		this._throwInvocationErrorIfNeeded();

		return this._matches;
	}

	public addEventListener(eventNames: string, callback: (data: EventData) => void, thisArg?: any): void {
		this._throwInvocationErrorIfNeeded();

		super.addEventListener(eventNames, callback, thisArg);
		trackedMediaQueryLists.push(this);
	}

	public removeEventListener(eventNames: string, callback?: (data: EventData) => void, thisArg?: any): void {
		this._throwInvocationErrorIfNeeded();

		trackedMediaQueryLists.splice(trackedMediaQueryLists.indexOf(this), 1);
		super.removeEventListener(eventNames, callback, thisArg);
	}

	private _throwInvocationErrorIfNeeded() {
		if (!this._isInitialized) {
			throw new TypeError('Illegal invocation');
		}
	}
}
