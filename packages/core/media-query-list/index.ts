import { ApplicationEventName, ApplicationEventNames } from '../application/application-event-names';
import type { ApplicationEventData } from '../application/application-interfaces';
import { checkIfMediaQueryMatches } from '../css-mediaquery';
import { EventData, Observable } from '../data/observable';
import { getNativeScriptGlobals } from '../globals/global-utils';
import { Optional } from '../utils/typescript-utils';

export type MediaQueryEventCallback = (this: MediaQueryList, ev: MediaQueryListEvent) => any;

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

	private mOnchange: MediaQueryEventCallback;
	private mMediaQueryChangeListeners: Map<MediaQueryEventCallback, (data: EventData) => void>;

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

		if (!this.mMediaQueryChangeListeners) {
			this.mMediaQueryChangeListeners = new Map();
		}
		this.mMediaQueryChangeListeners.set(callback, wrapperCallback);
	}

	removeListener(callback: MediaQueryEventCallback): void {
		const mediaChangeListeners = this.mMediaQueryChangeListeners;

		if (mediaChangeListeners && mediaChangeListeners.has(callback)) {
			// Call this method first since it throws in the case of bad parameters
			this.removeEventListener(MediaQueryList.changeEvent, mediaChangeListeners.get(callback));
			mediaChangeListeners.delete(callback);
		}
	}

	public get onchange(): MediaQueryEventCallback {
		return this.mOnchange;
	}

	public set onchange(callback: MediaQueryEventCallback) {
		// Remove old listener if any
		if (this.mOnchange) {
			this.removeListener(this.mOnchange);
		}

		if (callback) {
			this.addListener(callback);
		}

		this.mOnchange = callback;
	}

	toJSON() {
		return {
			media: this.media,
			matches: this.matches,
			onchange: this.onchange,
		} as this;
	}
}
