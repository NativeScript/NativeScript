import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buildOpenURLOptions, deliverShortcutItem, forwardContinueUserActivity, forwardOpenURLContexts, oneShotCompletion } from './scene-delegate-bridge';

const SOURCE_APPLICATION_KEY = 'UIApplicationOpenURLOptionsSourceApplicationKey';
const ANNOTATION_KEY = 'UIApplicationOpenURLOptionsAnnotationKey';
const OPEN_IN_PLACE_KEY = 'UIApplicationOpenURLOptionsOpenInPlaceKey';

/** Mirrors the NSMutableDictionary surface the bridge builds the legacy options with. */
class FakeMutableDictionary {
	private readonly values = new Map<string, any>();

	static alloc() {
		return {
			init: () => new FakeMutableDictionary(),
		};
	}

	setObjectForKey(value: any, key: string): void {
		this.values.set(key, value);
	}

	objectForKey(key: string): any {
		return this.values.has(key) ? this.values.get(key) : undefined;
	}

	get allKeys(): string[] {
		return [...this.values.keys()];
	}
}

/** NSSet as the scene callback delivers it: read through `allObjects`, not by iteration. */
function createURLContexts(contexts: Array<{ URL: any; options?: any }>) {
	return {
		allObjects: {
			count: contexts.length,
			objectAtIndex: (index: number) => contexts[index],
		},
	} as any;
}

function createSceneOpenURLOptions(overrides: Record<string, any> = {}) {
	return {
		sourceApplication: null,
		annotation: null,
		openInPlace: false,
		...overrides,
	} as any;
}

/**
 * `addDelegateHandler` chains handlers onto the delegate prototype, so a delegate under test is
 * a class-shaped object with a prototype plus the live instance UIApplication hands back.
 */
function createDelegate(prototypeMethods: Record<string, any> = {}) {
	const prototype = { ...prototypeMethods };
	const instance = Object.create(prototype);

	return {
		delegate: { prototype } as any,
		instance,
		application: { delegate: instance } as any,
	};
}

beforeEach(() => {
	(global as any).NSMutableDictionary = FakeMutableDictionary;
	(global as any).UIApplicationOpenURLOptionsSourceApplicationKey = SOURCE_APPLICATION_KEY;
	(global as any).UIApplicationOpenURLOptionsAnnotationKey = ANNOTATION_KEY;
	(global as any).UIApplicationOpenURLOptionsOpenInPlaceKey = OPEN_IN_PLACE_KEY;
});

afterEach(() => {
	delete (global as any).NSMutableDictionary;
	delete (global as any).UIApplicationOpenURLOptionsSourceApplicationKey;
	delete (global as any).UIApplicationOpenURLOptionsAnnotationKey;
	delete (global as any).UIApplicationOpenURLOptionsOpenInPlaceKey;
});

describe('buildOpenURLOptions', () => {
	it('carries every option the scene reported', () => {
		const annotation = { some: 'annotation' };
		const options = buildOpenURLOptions(createSceneOpenURLOptions({ sourceApplication: 'com.example.sender', annotation, openInPlace: true })) as unknown as FakeMutableDictionary;

		expect(options.objectForKey(SOURCE_APPLICATION_KEY)).toBe('com.example.sender');
		expect(options.objectForKey(ANNOTATION_KEY)).toBe(annotation);
		expect(options.objectForKey(OPEN_IN_PLACE_KEY)).toBe(true);
	});

	it('leaves out keys the scene had no value for', () => {
		const options = buildOpenURLOptions(createSceneOpenURLOptions()) as unknown as FakeMutableDictionary;

		expect(options.allKeys).toEqual([OPEN_IN_PLACE_KEY]);
		expect(options.objectForKey(OPEN_IN_PLACE_KEY)).toBe(false);
	});

	it('survives a scene that reported no options at all', () => {
		const options = buildOpenURLOptions(undefined) as unknown as FakeMutableDictionary;

		expect(options.allKeys).toEqual([]);
	});
});

describe('forwardOpenURLContexts', () => {
	it('calls the legacy handler once per URL context', () => {
		const applicationOpenURLOptions = vi.fn();
		const { delegate, application } = createDelegate({ applicationOpenURLOptions });
		const first = { absoluteString: 'myapp://first' };
		const second = { absoluteString: 'myapp://second' };

		const forwarded = forwardOpenURLContexts(
			delegate,
			application,
			createURLContexts([
				{ URL: first, options: createSceneOpenURLOptions() },
				{ URL: second, options: createSceneOpenURLOptions() },
			]),
		);

		expect(forwarded).toBe(true);
		expect(applicationOpenURLOptions).toHaveBeenCalledTimes(2);
		expect(applicationOpenURLOptions.mock.calls[0][0]).toBe(application);
		expect(applicationOpenURLOptions.mock.calls[0][1]).toBe(first);
		expect(applicationOpenURLOptions.mock.calls[1][1]).toBe(second);
	});

	it('hands the legacy handler the options dictionary of its own context', () => {
		const applicationOpenURLOptions = vi.fn();
		const { delegate, application } = createDelegate({ applicationOpenURLOptions });

		forwardOpenURLContexts(
			delegate,
			application,
			createURLContexts([
				{ URL: {}, options: createSceneOpenURLOptions({ sourceApplication: 'com.example.first' }) },
				{ URL: {}, options: createSceneOpenURLOptions({ sourceApplication: 'com.example.second' }) },
			]),
		);

		expect(applicationOpenURLOptions.mock.calls[0][2].objectForKey(SOURCE_APPLICATION_KEY)).toBe('com.example.first');
		expect(applicationOpenURLOptions.mock.calls[1][2].objectForKey(SOURCE_APPLICATION_KEY)).toBe('com.example.second');
	});

	it('runs the legacy handler against the live app delegate instance', () => {
		let receiver: any;
		const { delegate, application, instance } = createDelegate({
			applicationOpenURLOptions() {
				receiver = this;
			},
		});

		forwardOpenURLContexts(delegate, application, createURLContexts([{ URL: {}, options: createSceneOpenURLOptions() }]));

		expect(receiver).toBe(instance);
	});

	it('reports nothing forwarded when no legacy handler is registered', () => {
		const { delegate, application } = createDelegate();

		expect(forwardOpenURLContexts(delegate, application, createURLContexts([{ URL: {}, options: createSceneOpenURLOptions() }]))).toBe(false);
	});

	it('reports nothing forwarded when there is no delegate at all', () => {
		expect(forwardOpenURLContexts(undefined, undefined, createURLContexts([{ URL: {}, options: createSceneOpenURLOptions() }]))).toBe(false);
	});

	it('reports nothing forwarded for an empty set of contexts', () => {
		const applicationOpenURLOptions = vi.fn();
		const { delegate, application } = createDelegate({ applicationOpenURLOptions });

		expect(forwardOpenURLContexts(delegate, application, createURLContexts([]))).toBe(false);
		expect(applicationOpenURLOptions).not.toHaveBeenCalled();
	});
});

describe('forwardContinueUserActivity', () => {
	it('forwards the activity with a callable restoration handler', () => {
		const applicationContinueUserActivityRestorationHandler = vi.fn();
		const { delegate, application } = createDelegate({ applicationContinueUserActivityRestorationHandler });
		const userActivity = { activityType: 'com.example.browsing' } as any;

		expect(forwardContinueUserActivity(delegate, application, userActivity)).toBe(true);
		expect(applicationContinueUserActivityRestorationHandler).toHaveBeenCalledTimes(1);

		const [forwardedApplication, forwardedActivity, restorationHandler] = applicationContinueUserActivityRestorationHandler.mock.calls[0];

		expect(forwardedApplication).toBe(application);
		expect(forwardedActivity).toBe(userActivity);
		expect(typeof restorationHandler).toBe('function');
		expect(() => restorationHandler(undefined)).not.toThrow();
	});

	it('reports nothing forwarded when no legacy handler is registered', () => {
		const { delegate, application } = createDelegate();

		expect(forwardContinueUserActivity(delegate, application, { activityType: 'com.example.browsing' } as any)).toBe(false);
	});

	it('reports nothing forwarded when there is no activity', () => {
		const applicationContinueUserActivityRestorationHandler = vi.fn();
		const { delegate, application } = createDelegate({ applicationContinueUserActivityRestorationHandler });

		expect(forwardContinueUserActivity(delegate, application, undefined)).toBe(false);
		expect(applicationContinueUserActivityRestorationHandler).not.toHaveBeenCalled();
	});
});

describe('oneShotCompletion', () => {
	it('delivers only the first result', () => {
		const completionHandler = vi.fn();
		const deliver = oneShotCompletion(completionHandler);

		deliver(true);
		deliver(false);

		expect(completionHandler).toHaveBeenCalledTimes(1);
		expect(completionHandler).toHaveBeenCalledWith(true);
	});

	it('tracks whether a result has been delivered', () => {
		const deliver = oneShotCompletion(vi.fn());

		expect(deliver.delivered).toBe(false);
		deliver(true);
		expect(deliver.delivered).toBe(true);
	});
});

describe('deliverShortcutItem', () => {
	const shortcutItem = { type: 'com.example.compose' } as any;

	it('forwards to the legacy handler and lets it report the result', () => {
		const applicationPerformActionForShortcutItemCompletionHandler = vi.fn();
		const { delegate, application } = createDelegate({ applicationPerformActionForShortcutItemCompletionHandler });
		const completionHandler = vi.fn();
		const deliver = oneShotCompletion(completionHandler);

		expect(deliverShortcutItem(delegate, application, shortcutItem, deliver)).toBe(true);

		const [forwardedApplication, forwardedItem, forwardedCompletion] = applicationPerformActionForShortcutItemCompletionHandler.mock.calls[0];

		expect(forwardedApplication).toBe(application);
		expect(forwardedItem).toBe(shortcutItem);
		expect(completionHandler).not.toHaveBeenCalled();

		forwardedCompletion(true);

		expect(completionHandler).toHaveBeenCalledTimes(1);
		expect(completionHandler).toHaveBeenCalledWith(true);
	});

	it('reports the action unhandled when no legacy handler is registered', () => {
		const { delegate, application } = createDelegate();
		const completionHandler = vi.fn();

		expect(deliverShortcutItem(delegate, application, shortcutItem, oneShotCompletion(completionHandler))).toBe(false);
		expect(completionHandler).toHaveBeenCalledTimes(1);
		expect(completionHandler).toHaveBeenCalledWith(false);
	});

	it('reports the result once even when a listener already reported it and a legacy handler reports again', () => {
		const { delegate, application } = createDelegate({
			applicationPerformActionForShortcutItemCompletionHandler(_app: any, _item: any, completion: (handled: boolean) => void) {
				completion(false);
			},
		});
		const completionHandler = vi.fn();
		const deliver = oneShotCompletion(completionHandler);

		deliver(true);
		deliverShortcutItem(delegate, application, shortcutItem, deliver);

		expect(completionHandler).toHaveBeenCalledTimes(1);
		expect(completionHandler).toHaveBeenCalledWith(true);
	});

	it('does not report again after a listener already reported and no legacy handler exists', () => {
		const { delegate, application } = createDelegate();
		const completionHandler = vi.fn();
		const deliver = oneShotCompletion(completionHandler);

		deliver(true);
		deliverShortcutItem(delegate, application, shortcutItem, deliver);

		expect(completionHandler).toHaveBeenCalledTimes(1);
	});
});
