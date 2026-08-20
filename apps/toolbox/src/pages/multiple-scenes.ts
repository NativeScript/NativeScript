import { Application, Button, Color, Dialogs, EventData, isAndroid, isIOS, Label, NativeWindowEvents, Observable, Page, StackLayout, WindowEvents } from '@nativescript/core';
import type { NativeWindow, NativeWindowEventData, PrimaryWindowChangedEventData, WindowCloseEventData, WindowContentRequest, WindowOpenEventData } from '@nativescript/core';

let viewModel: MultipleScenesModel;

export function navigatingTo(args: EventData) {
	installWindowContentResolver();
	viewModel = new MultipleScenesModel();
	(<Page>args.object).bindingContext = viewModel;
}

export function navigatingFrom(args: EventData) {
	viewModel?.destroy();
	viewModel = undefined;
}

/**
 * The demo can open two different kinds of window. The kind is chosen when the window is
 * requested and travels to the new window as `openWindow({ data })`.
 */
type DemoWindowKind = 'newSceneBasic' | 'newSceneAlt';

const DEMO_WINDOW_KINDS: Record<DemoWindowKind, { title: string; background: string; accent: string; titleColor: string }> = {
	newSceneBasic: { title: 'Basic demo window', background: '#cdffdb', accent: '#ff4444', titleColor: '#1c4d2e' },
	newSceneAlt: { title: 'Alternate demo window', background: '#65adf1', accent: '#006ead', titleColor: '#00305c' },
};

/** Per-window events the demo mirrors into its log and its live window list. */
const TRACKED_WINDOW_EVENTS: string[] = [NativeWindowEvents.attached, NativeWindowEvents.detached, NativeWindowEvents.activate, NativeWindowEvents.deactivate, NativeWindowEvents.background, NativeWindowEvents.foreground, NativeWindowEvents.contentLoaded, NativeWindowEvents.displayed, NativeWindowEvents.close, NativeWindowEvents.orientationChanged, NativeWindowEvents.systemAppearanceChanged, NativeWindowEvents.layoutDirectionChanged];

// --- Window content ---

let contentResolverInstalled = false;

function installWindowContentResolver() {
	if (contentResolverInstalled) {
		return;
	}
	contentResolverInstalled = true;

	// The resolver stays installed for the rest of the process: a window that detaches and
	// re-attaches (iOS scene reconnect, Android activity recreation) asks for its content
	// again, long after this page may have been navigated away from.
	Application.setWindowContentResolver(resolveWindowContent);
}

function resolveWindowContent(request: WindowContentRequest): Page | undefined {
	// `data` is exactly what openWindow({ data }) was called with, carried across by the
	// platform: NSUserActivity.userInfo on iOS, intent extras on Android.
	const kind = request.data?.kind as DemoWindowKind;

	// Returning undefined hands the window back to the default main-entry behaviour, which
	// is what every window this demo did not open should get - the primary window, a cold
	// start, or a window the system restored on its own.
	if (request.isPrimary || !DEMO_WINDOW_KINDS[kind]) {
		return undefined;
	}

	viewModel?.logEvent(`content resolved for ${request.window.id} (${kind})`);

	return createDemoWindowPage(kind, request.window);
}

/**
 * Views built in plain code are only reachable through the closures that created them, so
 * an unreferenced button can be collected while its window is still on screen and stop
 * responding to taps. Holding the buttons here keeps them alive for the window's lifetime.
 */
const liveCloseButtons = new Set<Button>();

function createDemoWindowPage(kind: DemoWindowKind, window: NativeWindow): Page {
	const style = DEMO_WINDOW_KINDS[kind];

	const page = new Page();
	page.backgroundColor = new Color(style.background);

	const layout = new StackLayout();
	layout.padding = 32;
	page.content = layout;

	const title = new Label();
	title.text = style.title;
	title.fontSize = 32;
	title.fontWeight = 'bold';
	title.color = new Color(style.titleColor);
	title.textAlignment = 'center';
	title.textWrap = true;
	title.marginBottom = 24;
	layout.addChild(title);

	const identity = new Label();
	identity.text = `id: ${window.id}\nrole: ${window.role}\n${describeNativeSurface(window)}`;
	identity.fontSize = 18;
	identity.textAlignment = 'center';
	identity.textWrap = true;
	identity.marginBottom = 16;
	layout.addChild(identity);

	const traits = new Label();
	traits.fontSize = 18;
	traits.textAlignment = 'center';
	traits.textWrap = true;
	traits.marginBottom = 28;
	const refreshTraits = () => {
		traits.text = describeWindowTraits(window);
	};
	refreshTraits();
	// Each window reports its own traits, so rotating or theming one window updates only it.
	// No unsubscribe is needed: the framework drops every listener on a window right after
	// its `close` event.
	for (const eventName of [NativeWindowEvents.orientationChanged, NativeWindowEvents.systemAppearanceChanged, NativeWindowEvents.layoutDirectionChanged, NativeWindowEvents.attached, NativeWindowEvents.detached]) {
		window.on(eventName, refreshTraits);
	}
	layout.addChild(traits);

	const closeButton = new Button();
	closeButton.text = 'Close this window';
	closeButton.fontSize = 22;
	closeButton.fontWeight = 'bold';
	closeButton.backgroundColor = new Color(style.accent);
	closeButton.color = new Color('white');
	closeButton.borderRadius = 8;
	closeButton.padding = 16;
	closeButton.width = 300;
	closeButton.horizontalAlignment = 'center';
	closeButton.on('tap', () => window.close());
	liveCloseButtons.add(closeButton);
	window.on(NativeWindowEvents.close, () => liveCloseButtons.delete(closeButton));
	layout.addChild(closeButton);

	return page;
}

// --- Window description helpers ---

function describeNativeSurface(window: NativeWindow): string {
	if (window.ios) {
		const scene = window.ios.scene;
		return scene ? `scene: ${scene.session.persistentIdentifier}` : 'no scene (pre-scene lifecycle)';
	}

	if (window.android) {
		const activity = window.android.activity;
		return `activity: ${activity.getClass().getSimpleName()}@${activity.hashCode()}`;
	}

	return 'no native surface attached';
}

function describeWindowTraits(window: NativeWindow): string {
	return [window.isPrimary ? 'primary' : 'secondary', window.orientation(), window.systemAppearance() ?? 'appearance unknown', window.layoutDirection() ?? 'direction unknown'].join(' · ');
}

// --- Capability detection ---

interface MultiWindowCapability {
	canOpenWindows: boolean;
	status: string;
	note: string;
	showIosSceneSetup: boolean;
}

/**
 * Multi-window is a device/configuration capability, not a platform one: an iPhone and an
 * iPad run the same iOS build but only one of them can show two scenes.
 */
function detectMultiWindowCapability(): MultiWindowCapability {
	if (isIOS) {
		if (!Application.ios.supportsScenes()) {
			return {
				canOpenWindows: false,
				status: 'Scene lifecycle is off - the app is running the pre-scene UIApplication lifecycle.',
				note: 'Per-window events below still work, but there can only ever be one window.',
				showIosSceneSetup: true,
			};
		}

		if (!Application.ios.supportsMultipleScenes()) {
			return {
				canOpenWindows: false,
				status: 'Scene lifecycle is on, but this device allows only one scene at a time.',
				note: 'UIApplication.supportsMultipleScenes is false - either the device is an iPhone or UIApplicationSupportsMultipleScenes is missing from Info.plist. Try an iPad.',
				showIosSceneSetup: false,
			};
		}

		return {
			canOpenWindows: true,
			status: 'Scene lifecycle is on and this device allows multiple scenes.',
			note: 'Each new window is a UIWindowScene. Use Split View or Stage Manager to see them side by side.',
			showIosSceneSetup: false,
		};
	}

	if (isAndroid) {
		return {
			canOpenWindows: true,
			status: 'Windows map to activities launched into their own task.',
			note: 'Application.openWindow() is experimental on Android and logs a warning the first time it runs: whether a second window really appears depends on the activity launchMode in AndroidManifest.xml and on how the device treats new documents in recents. Split screen or a desktop/foldable mode shows both.',
			showIosSceneSetup: false,
		};
	}

	return {
		canOpenWindows: false,
		status: 'Multi-window is not available on this platform.',
		note: '',
		showIosSceneSetup: false,
	};
}

interface WindowRow {
	id: string;
	summary: string;
	traits: string;
	native: string;
	canClose: boolean;
	requestClose: () => void;
}

export class MultipleScenesModel extends Observable {
	private _capability = detectMultiWindowCapability();
	private _windows: WindowRow[] = [];
	private _events: string[] = [];
	private _trackedWindows = new Map<string, { window: NativeWindow; handler: (args: NativeWindowEventData) => void }>();

	private _onWindowOpen = (args: WindowOpenEventData) => {
		this.logEvent(`windowOpen: ${args.window.id}`);
		this.trackWindow(args.window);
		this.refreshWindows();
	};

	private _onWindowClose = (args: WindowCloseEventData) => {
		this.logEvent(`windowClose: ${args.window.id}`);
		this.refreshWindows();
	};

	private _onPrimaryWindowChanged = (args: PrimaryWindowChangedEventData) => {
		this.logEvent(`primaryWindowChanged: ${args.window.id}`);
		this.refreshWindows();
	};

	constructor() {
		super();

		Application.on(WindowEvents.windowOpen, this._onWindowOpen);
		Application.on(WindowEvents.windowClose, this._onWindowClose);
		Application.on(WindowEvents.primaryWindowChanged, this._onPrimaryWindowChanged);

		for (const window of Application.getWindows()) {
			this.trackWindow(window);
		}

		this.refreshWindows();
	}

	destroy() {
		Application.off(WindowEvents.windowOpen, this._onWindowOpen);
		Application.off(WindowEvents.windowClose, this._onWindowClose);
		Application.off(WindowEvents.primaryWindowChanged, this._onPrimaryWindowChanged);

		for (const { window, handler } of this._trackedWindows.values()) {
			for (const eventName of TRACKED_WINDOW_EVENTS) {
				window.off(eventName, handler);
			}
		}
		this._trackedWindows.clear();
	}

	get statusText(): string {
		return this._capability.status;
	}

	get capabilityNote(): string {
		return this._capability.note;
	}

	get canOpenWindows(): boolean {
		return this._capability.canOpenWindows;
	}

	get showIosSceneSetup(): boolean {
		return this._capability.showIosSceneSetup;
	}

	get windowCount(): number {
		return this._windows.length;
	}

	get windows(): WindowRow[] {
		return this._windows;
	}

	get events(): string[] {
		return this._events;
	}

	onOpenBasicWindow() {
		this.openWindow('newSceneBasic');
	}

	onOpenAltWindow() {
		this.openWindow('newSceneAlt');
	}

	onRefresh() {
		this.refreshWindows();
		this.logEvent('window list refreshed');
	}

	onClearEvents() {
		this._events = [];
		this.notifyPropertyChange('events', this._events);
	}

	onShowDetails() {
		const lines = [this._capability.status, ''];

		for (const window of Application.getWindows()) {
			lines.push(`${window.id} · ${window.role} · ${window.state}`);
			lines.push(`  ${describeWindowTraits(window)}`);
			lines.push(`  ${describeNativeSurface(window)}`);
			lines.push(`  root view: ${window.rootView ?? 'none'}`);
		}

		// getWindows() defaults to the view-carrying roles; 'all' also reports surfaces such
		// as CarPlay or an external display, which host no NativeScript view tree.
		const otherSurfaces = Application.getWindows('all').filter((surface) => surface.role !== 'application' && surface.role !== 'embedded');
		if (otherSurfaces.length) {
			lines.push('', 'Other surfaces:');
			for (const surface of otherSurfaces) {
				lines.push(`${surface.id} · ${surface.role} · ${surface.state}`);
			}
		}

		Dialogs.alert({
			title: 'Window details',
			message: lines.join('\n'),
			okButtonText: 'OK',
		});
	}

	logEvent(event: string) {
		const entry = `${new Date().toLocaleTimeString()}: ${event}`;
		console.log(entry);

		this._events = [entry, ...this._events].slice(0, 30);
		this.notifyPropertyChange('events', this._events);
	}

	private openWindow(kind: DemoWindowKind) {
		this.logEvent(`openWindow requested (${kind})`);
		// The payload is handed to the new window's content request on both platforms.
		Application.openWindow({ data: { kind } });
	}

	private trackWindow(window: NativeWindow) {
		if (this._trackedWindows.has(window.id)) {
			return;
		}

		const handler = (args: NativeWindowEventData) => {
			this.logEvent(`${args.eventName}: ${window.id}`);

			if (args.eventName === NativeWindowEvents.close) {
				// The framework clears a window's listeners right after `close`, so only the
				// demo's own reference has to go, otherwise the list would keep showing it.
				this._trackedWindows.delete(window.id);
			}

			this.refreshWindows();
		};

		for (const eventName of TRACKED_WINDOW_EVENTS) {
			window.on(eventName, handler);
		}

		this._trackedWindows.set(window.id, { window, handler });
	}

	private refreshWindows() {
		this._windows = Application.getWindows().map((window) => ({
			id: window.id,
			summary: `${window.id} · ${window.role} · ${window.state}`,
			traits: describeWindowTraits(window),
			native: describeNativeSurface(window),
			canClose: !window.isPrimary && window.state !== 'closed',
			requestClose: () => this.closeWindow(window.id),
		}));

		this.notifyPropertyChange('windows', this._windows);
		this.notifyPropertyChange('windowCount', this._windows.length);
	}

	private closeWindow(id: string) {
		const window = Application.getWindowById(id);

		if (!window) {
			this.logEvent(`no window registered with id ${id}`);
			return;
		}

		this.logEvent(`close requested for ${id}`);
		window.close();
	}
}
