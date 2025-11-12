import { ApplicationEventName, ApplicationEventNames } from '../application/application-event-names';
import type { ApplicationEventData } from '../application/application-interfaces';
import { getApplicationProperties } from '../application/helpers-common';
import { matchQuery, MediaQueryType } from '../css-mediaquery';
import { EventData, Observable } from '../data/observable';
import { getNativeScriptGlobals } from '../globals/global-utils';
import { Screen } from '../platform/screen';
import { Trace } from '../trace';
import { Optional } from '../utils/typescript-utils';

type MediaQueryLegacyEventCb = (this: MediaQueryList, ev: MediaQueryListEvent) => any;

export interface MediaQueryListEvent {
	readonly matches: boolean;
	readonly media: string;
}

export interface MediaQueryListEventData extends EventData, MediaQueryListEvent {}

const globalEvents = getNativeScriptGlobals().events;
const applicationEvents: ApplicationEventName[] = [ApplicationEventNames.orientationChangedEvent, ApplicationEventNames.systemAppearanceChangedEvent];
const mediaQueryLists: MediaQueryList[] = [];

function toggleApplicationEventListeners(toAdd: boolean) {
	for (const eventName of applicationEvents) {
		if (toAdd) {
			globalEvents.on(eventName, onDeviceChange);
		} else {
			globalEvents.off(eventName, onDeviceChange);
		}
	}
}

function onDeviceChange(args: ApplicationEventData) {
	for (const mql of mediaQueryLists) {
		const matches = checkIfMediaQueryMatches(mql.media);
		if (mql.matches !== matches) {
			mql.notify({
				eventName: MediaQueryList.changeEvent,
				object: mql,
				matches: matches,
				media: mql.media,
			});
		}
	}
}

export function checkIfMediaQueryMatches(mediaQueryString: string): boolean {
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

export function matchMedia(mediaQueryString: string): MediaQueryList {
	return Reflect.construct(MediaQueryListInternal, [mediaQueryString], MediaQueryList) as any;
}

// For internal usage
class MediaQueryListInternal extends Observable {
	declare readonly mMedia: string;
	declare mMatches: boolean;

	constructor(media: string) {
		super();

		this.mMedia = media;
		this.mMatches = checkIfMediaQueryMatches(media);
	}
}

export class MediaQueryList extends Observable {
	public static readonly changeEvent = 'change';

	private readonly mMedia: string;
	private mMatches: boolean;

	private _onChange: (this: MediaQueryList, ev: MediaQueryListEvent) => any;
	private mediaQueryChangeListeners: Map<MediaQueryLegacyEventCb, (data: EventData) => void>;

	constructor() {
		super();
		throw new TypeError('Illegal constructor');
	}

	get media(): string {
		return this.mMedia;
	}

	get matches(): boolean {
		return this.mMatches;
	}

	public override notify<T extends Optional<MediaQueryListEventData, 'object' | 'media' | 'matches'>>(data: T): void {
		// Update match state
		if (data.eventName === MediaQueryList.changeEvent) {
			this.mMatches = data.matches;
		}
		super.notify<T>(data);
	}

	public override addEventListener(eventName: 'change', callback: (data: MediaQueryListEventData) => void, thisArg?: any, once?: boolean): void {
		const hasChangeListeners = this.hasListeners(MediaQueryList.changeEvent);

		super.addEventListener(eventName, callback, thisArg, once);

		if (eventName === MediaQueryList.changeEvent && !hasChangeListeners) {
			mediaQueryLists.push(this);

			if (mediaQueryLists.length === 1) {
				toggleApplicationEventListeners(true);
			}
		}
	}

	public override removeEventListener(eventName: 'change', callback?: (data: MediaQueryListEventData) => void, thisArg?: any): void {
		super.removeEventListener(eventName, callback, thisArg);

		if (eventName === MediaQueryList.changeEvent) {
			const hasChangeListeners = this.hasListeners(MediaQueryList.changeEvent);

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

	addListener(callback: (this: MediaQueryList, ev: MediaQueryList) => any): void {
		// This kind of implementation helps maintain listener registration order
		// regardless of using the deprecated methods or property onchange
		const wrapperCallback = (_data) => {
			callback.call(this, <MediaQueryList>{
				matches: this.matches,
				media: this.media,
			});
		};

		// Call this method first since it throws in the case of bad parameters
		this.addEventListener(MediaQueryList.changeEvent, wrapperCallback);

		if (!this.mediaQueryChangeListeners) {
			this.mediaQueryChangeListeners = new Map();
		}
		this.mediaQueryChangeListeners.set(callback, wrapperCallback);
	}

	removeListener(callback: (this: MediaQueryList, ev: MediaQueryListEvent) => any): void {
		const mediaChangeListeners = this.mediaQueryChangeListeners;

		if (mediaChangeListeners && mediaChangeListeners.has(callback)) {
			// Call this method first since it throws in the case of bad parameters
			this.removeEventListener(MediaQueryList.changeEvent, mediaChangeListeners.get(callback));
			mediaChangeListeners.delete(callback);
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
}
