/**
 * The dev `bundle.mjs` under HMR: loads the app from the dev server and, when
 * that fails before the app launched, launches a minimal screen that says why.
 *
 * Imports nothing: the dev server writes this file's compiled output into
 * `bundle.mjs` as is (`helpers/dev-boot-bundle.ts`), and it must not depend on
 * anything the dev server serves (core included), so it drives UIKit and the
 * Android SDK through the runtime directly.
 */

export interface DevBootLoaderOptions {
	/** The dev server origin the device reaches. */
	origin: string;
	/** The served dev boot module. */
	bootUrl: string;
	/** The dev server's WebSocket token, which its action routes require. */
	token: string;
	verbose?: boolean;
}

interface DevBootFailure {
	message: string;
	stack?: string;
}

// Short enough that the fallback screen is up well inside the iOS launch
// watchdog (about 20 s on a device); an unroutable host otherwise takes the
// runtime's 30 s fetch timeout plus a retry.
const REACHABILITY_TIMEOUT_MS = 6000;
const RECONNECT_INTERVAL_MS = 2000;
const ANDROID_PROBE_TIMEOUT_MS = 2000;
const ANDROID_RECONNECT_PROBE_TIMEOUT_MS = 500;
// Copies of `NS_DEV_RESTART_PATH` and `NS_DEV_BOOT_FAILED_PATH` (`hmr/server/dev-routes.ts`).
export const RESTART_PATH = '/__ns_dev__/restart';
export const BOOT_FAILED_PATH = '/__ns_dev__/boot-failed';

const g: any = globalThis;

type FallbackPlatform = 'ios' | 'android';

function fallbackPlatform(): FallbackPlatform | null {
	if (typeof g.UIApplicationMain === 'function' && typeof g.UIResponder === 'function') return 'ios';
	if (typeof g.android === 'object' && g.android && typeof g.androidx === 'object' && g.androidx) return 'android';
	return null;
}

type ImportModule = (url: string) => Promise<any>;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error(message)), ms);
		promise.then(
			(value) => {
				clearTimeout(timer);
				resolve(value);
			},
			(error) => {
				clearTimeout(timer);
				reject(error);
			},
		);
	});
}

function describe(error: unknown): DevBootFailure {
	if (error instanceof Error) return { message: error.message, stack: error.stack };
	return { message: String(error) };
}

/** Loads `/@vite/env` and the dev boot module; never rejects on iOS and Android. */
export async function bootFromDevServer(options: DevBootLoaderOptions, importModule: ImportModule = (url) => import(/* @vite-ignore */ url)): Promise<void> {
	const startedAt = Date.now();
	if (fallbackPlatform() === 'android') {
		const unreachable = probeAndroidDevServer(options.origin, ANDROID_PROBE_TIMEOUT_MS);
		if (unreachable) {
			showDevServerUnreachable(options, unreachable, startedAt, 'android', importModule);
			return;
		}
	}
	try {
		// `/@vite/env` installs `config.define` on globalThis (Vite's client
		// environment does no define substitution in served modules), so it
		// evaluates before the boot module's graph.
		await withTimeout(importModule(`${options.origin}/@vite/env`), REACHABILITY_TIMEOUT_MS, `no answer within ${REACHABILITY_TIMEOUT_MS / 1000} s`);
	} catch (error) {
		const platform = fallbackPlatform();
		if (!platform) throw error;
		showDevServerUnreachable(options, describe(error), startedAt, platform, importModule);
		return;
	}
	let failure: DevBootFailure | undefined;
	try {
		const bootModule: { bootFailure?: DevBootFailure } = await importModule(options.bootUrl);
		failure = bootModule.bootFailure;
	} catch (error) {
		failure = describe(error);
	}
	if (!failure) return;
	const platform = fallbackPlatform();
	if (!platform) throw new Error(failure.message);
	showBootFailure(options, failure, platform, importModule);
}

/**
 * Connects to the dev server's port, blocking for at most `timeoutMs`.
 * Android runs `bundle.mjs` inside
 * `Application.onCreate`, which the runtime holds while any module fetch is
 * in flight, abandoned or not: a fetch to an unroutable host would hold it
 * past the system's startup timeout (an ANR) even after the loader gave up.
 */
function probeAndroidDevServer(origin: string, timeoutMs: number): DevBootFailure | undefined {
	const match = /^https?:\/\/(\[[^\]]+\]|[^:/]+)(?::(\d+))?/.exec(origin);
	if (!match) return undefined;
	const host = match[1].replace(/^\[|\]$/g, '');
	const port = match[2] ? Number(match[2]) : origin.startsWith('https:') ? 443 : 80;
	const StrictMode = g.android.os.StrictMode;
	let previousPolicy: any;
	let socket: any;
	try {
		previousPolicy = StrictMode.getThreadPolicy();
		StrictMode.setThreadPolicy(new StrictMode.ThreadPolicy.Builder(previousPolicy).permitNetwork().build());
		socket = new g.java.net.Socket();
		socket.connect(new g.java.net.InetSocketAddress(host, port), timeoutMs);
		return undefined;
	} catch (error) {
		return { message: `no connection to port ${port} within ${timeoutMs / 1000} s: ${describe(error).message}` };
	} finally {
		try {
			socket?.close();
		} catch {}
		if (previousPolicy) StrictMode.setThreadPolicy(previousPolicy);
	}
}

function showFallback(platform: FallbackPlatform, content: { title: string; text: string; alert?: boolean }): FallbackScreen {
	return platform === 'ios' ? launchFallback(content) : showAndroidFallback(content);
}

function showDevServerUnreachable(options: DevBootLoaderOptions, failure: DevBootFailure, startedAt: number, platform: FallbackPlatform, importModule: ImportModule): void {
	console.error(`[ns-entry] the dev server at ${options.origin} is unreachable: ${failure.message}`);
	const text = `The app can't reach the dev server at ${options.origin} (${failure.message}).\n\nStart it with \`ns run\`, or check that this device is on the same network. The app restarts once the server answers.`;
	showFallback(platform, { title: 'Dev server unreachable', text, alert: true });
	// The fallback owns the app's launch now, so the app can't boot in this
	// process: the dev server restarts it. It compares `age` with its own uptime.
	const reconnect = () => {
		// Polling an unroutable host through the module loader would pile up
		// fetches that each wait out the runtime's timeout.
		if (platform === 'android' && probeAndroidDevServer(options.origin, ANDROID_RECONNECT_PROBE_TIMEOUT_MS)) {
			setTimeout(reconnect, RECONNECT_INTERVAL_MS);
			return;
		}
		const query = `reason=${encodeURIComponent('the dev server is reachable again')}&age=${Date.now() - startedAt}&token=${encodeURIComponent(options.token)}`;
		requestRoute(platform, importModule, `${options.origin}${RESTART_PATH}?${query}`, 3, (ok) => {
			if (!ok) setTimeout(reconnect, RECONNECT_INTERVAL_MS);
			else console.info('[ns-entry] the dev server is reachable again; it restarts the app');
		});
	};
	setTimeout(reconnect, RECONNECT_INTERVAL_MS);
}

function showBootFailure(options: DevBootLoaderOptions, failure: DevBootFailure, platform: FallbackPlatform, importModule: ImportModule): void {
	const details = failure.stack && failure.stack.indexOf(failure.message) === -1 ? `${failure.message}\n\n${failure.stack}` : failure.stack || failure.message;
	const screen = showFallback(platform, { title: 'The app failed to boot', text: `${details}\n\nFix the error and save: the app restarts.` });
	requestRoute(platform, importModule, `${options.origin}${BOOT_FAILED_PATH}?reason=${encodeURIComponent(failure.message)}&token=${encodeURIComponent(options.token)}`, 5, (ok, answer) => {
		const serverError = ok && answer ? answer.serverError : undefined;
		if (typeof serverError === 'string' && serverError) screen.setText(`${serverError}\n\n${details}\n\nFix the error and save: the app restarts.`);
	});
}

let routeRequests = 0;

/**
 * GETs one of the dev server's action routes. Android has no HTTP client that
 * answers on the main thread without core, so the runtime's module loader
 * makes the request there: the route answers as a module, and a fresh query
 * keeps each answer out of the module registry.
 */
function requestRoute(platform: FallbackPlatform, importModule: ImportModule, url: string, timeoutSeconds: number, done: (ok: boolean, answer?: any) => void): void {
	if (platform === 'ios') {
		httpGet(url, timeoutSeconds, (ok, body) => {
			let answer: any;
			try {
				answer = body ? JSON.parse(body) : undefined;
			} catch {}
			done(ok, answer);
		});
		return;
	}
	withTimeout(importModule(`${url}&module=1&n=${++routeRequests}`), timeoutSeconds * 1000, 'no answer').then(
		(module) => {
			const answer = module && module.default;
			done(!!answer && answer.status >= 200 && answer.status < 300, answer);
		},
		() => done(false),
	);
}

function httpGet(url: string, timeoutSeconds: number, done: (ok: boolean, body?: string) => void): void {
	try {
		const config = g.NSURLSessionConfiguration.ephemeralSessionConfiguration;
		config.timeoutIntervalForRequest = timeoutSeconds;
		const session = g.NSURLSession.sessionWithConfigurationDelegateDelegateQueue(config, null, g.NSOperationQueue.mainQueue);
		session
			.dataTaskWithURLCompletionHandler(g.NSURL.URLWithString(url), (data: any, response: any, error: any) => {
				const status = response && typeof response.statusCode === 'number' ? response.statusCode : 0;
				let body: string | undefined;
				try {
					body = data ? String(g.NSString.alloc().initWithDataEncoding(data, 4 /* NSUTF8StringEncoding */)) : undefined;
				} catch {}
				done(!error && status >= 200 && status < 300, body);
			})
			.resume();
	} catch (error) {
		console.error('[ns-entry] dev server request failed', error);
		done(false);
	}
}

interface FallbackScreen {
	setText(text: string): void;
}

let fallbackLaunched = false;

// No layout of the app defines it; it finds the fallback's view again.
const ANDROID_FALLBACK_VIEW_ID = 0x0e5d0b07;

/**
 * Shows `text` in whichever activity Android launches. It registers the
 * manifest's launcher activity class (and core's), so a boot that failed
 * before the served module declaring it ran still launches; when that module
 * ran first, its class stays registered, and the lifecycle callbacks put the
 * screen over it.
 */
function showAndroidFallback(content: { title: string; text: string }): FallbackScreen {
	let pendingText = `${content.title}\n\n${content.text}`;
	const textViews: any[] = [];
	const screen: FallbackScreen = {
		setText(text: string) {
			pendingText = `${content.title}\n\n${text}`;
			for (const view of textViews) view.setText(pendingText);
		},
	};
	if (fallbackLaunched) return screen;
	fallbackLaunched = true;

	const show = (activity: any) => {
		try {
			if (activity.findViewById(ANDROID_FALLBACK_VIEW_ID)) return;
			const textView = new g.android.widget.TextView(activity);
			textView.setId(ANDROID_FALLBACK_VIEW_ID);
			textView.setText(pendingText);
			textView.setTextIsSelectable(true);
			textView.setTypeface(g.android.graphics.Typeface.MONOSPACE);
			textView.setTextSize(13);
			textView.setTextColor(0xff000000 | 0);
			textView.setPadding(48, 192, 48, 96);
			const scrollView = new g.android.widget.ScrollView(activity);
			scrollView.setBackgroundColor(0xffffffff | 0);
			scrollView.addView(textView);
			activity.setContentView(scrollView);
			textViews.push(textView);
		} catch (error) {
			console.error('[ns-entry] could not show the fallback screen', error);
		}
	};

	const app = androidApplication();
	const base = g.androidx.appcompat.app.AppCompatActivity;
	const superOnCreate = base.prototype.onCreate;
	for (const name of fallbackActivityNames(app)) {
		try {
			base.extend(name, {
				onCreate(savedInstanceState: any) {
					superOnCreate.call(this, savedInstanceState);
					show(this);
				},
			});
		} catch (error) {
			console.error(`[ns-entry] could not register the fallback activity ${name}`, error);
		}
	}

	try {
		const noop = () => {};
		const callbacks = new g.android.app.Application.ActivityLifecycleCallbacks({
			onActivityCreated: noop,
			onActivityStarted: noop,
			onActivityResumed: show,
			onActivityPaused: noop,
			onActivityStopped: noop,
			onActivitySaveInstanceState: noop,
			onActivityDestroyed: noop,
		});
		app?.registerActivityLifecycleCallbacks(callbacks);
	} catch (error) {
		console.error('[ns-entry] could not watch the activity lifecycle', error);
	}
	return screen;
}

/** The manifest's launcher activity, which may be an app component, and core's. */
function fallbackActivityNames(app: any): string[] {
	const names = ['com.tns.NativeScriptActivity'];
	try {
		const launcher = app.getPackageManager().getLaunchIntentForPackage(app.getPackageName()).getComponent().getClassName();
		if (launcher && names.indexOf(launcher) === -1) names.unshift(launcher);
	} catch {}
	return names;
}

function androidApplication(): any {
	try {
		const app = g.com.tns.NativeScriptApplication.getInstance();
		if (app) return app;
	} catch {}
	try {
		return g.java.lang.Class.forName('android.app.ActivityThread').getMethod('currentApplication', null).invoke(null, null);
	} catch {
		return null;
	}
}

/**
 * Launches the app with one screen showing `text`. Owns `UIApplicationMain`,
 * so it is only for a boot that never reached the app's own `run`.
 */
function launchFallback(content: { title: string; text: string; alert?: boolean }): FallbackScreen {
	let textView: any = null;
	let pendingText = `${content.title}\n\n${content.text}`;
	const screen: FallbackScreen = {
		setText(text: string) {
			pendingText = `${content.title}\n\n${text}`;
			if (textView) textView.text = pendingText;
		},
	};
	if (fallbackLaunched) return screen;
	fallbackLaunched = true;

	const windows: any[] = [];
	const attachedScenes: any[] = [];
	const buildWindow = (window: any) => {
		const controller = g.UIViewController.new();
		const view = controller.view;
		// A fresh controller's view has no size until it is laid out in the window.
		view.frame = window.bounds;
		view.backgroundColor = g.UIColor.systemBackgroundColor;
		textView = g.UITextView.alloc().initWithFrame(g.CGRectInset(view.bounds, 16, 64));
		textView.autoresizingMask = 2 | 16; // flexible width | flexible height
		textView.editable = false;
		textView.font = g.UIFont.monospacedSystemFontOfSizeWeight(13, 0);
		textView.textColor = g.UIColor.labelColor;
		textView.backgroundColor = g.UIColor.clearColor;
		textView.text = pendingText;
		view.addSubview(textView);
		window.rootViewController = controller;
		// When the boot failed after core loaded, core's Application still answers
		// the launch with a window of its own; this one stays above it (and below
		// the dev overlay's alert-level window, which shows the server's error).
		window.windowLevel = g.UIWindowLevelNormal + 1;
		window.makeKeyAndVisible();
		windows.push(window);
		if (content.alert) {
			setTimeout(() => {
				const alert = g.UIAlertController.alertControllerWithTitleMessagePreferredStyle(content.title, content.text, 1 /* UIAlertControllerStyleAlert */);
				alert.addAction(g.UIAlertAction.actionWithTitleStyleHandler('OK', 0, null));
				controller.presentViewControllerAnimatedCompletion(alert, true, null);
			}, 300);
		}
	};

	const usesScenes = !!g.NSBundle.mainBundle.objectForInfoDictionaryKey('UIApplicationSceneManifest');
	// Any window scene gets the screen, whichever delegate UIKit gave it: a
	// session restored from an earlier launch keeps the delegate class it was
	// saved with (core's, when the app booted normally before) and never asks
	// this app delegate for a configuration.
	const attachToScene = (scene: any) => {
		if (!scene || !(scene instanceof g.UIWindowScene) || attachedScenes.indexOf(scene) !== -1) return;
		attachedScenes.push(scene);
		buildWindow(g.UIWindow.alloc().initWithWindowScene(scene));
	};
	const attachToConnectedScenes = () => {
		const scenes = g.UIApplication.sharedApplication.connectedScenes.allObjects;
		for (let i = 0; i < scenes.count; i++) attachToScene(scenes.objectAtIndex(i));
	};
	const SceneDelegate = g.UIResponder.extend(
		{
			sceneWillConnectToSessionOptions(scene: any) {
				attachToScene(scene);
			},
		},
		{ name: 'NSDevBootFallbackSceneDelegate', protocols: [g.UIWindowSceneDelegate] },
	);
	const appDelegateMethods: Record<string, unknown> = {
		applicationDidFinishLaunchingWithOptions() {
			if (!usesScenes) {
				buildWindow(g.UIWindow.alloc().initWithFrame(g.UIScreen.mainScreen.bounds));
				return true;
			}
			const center = g.NSNotificationCenter.defaultCenter;
			for (const name of [g.UISceneWillConnectNotification, g.UISceneDidActivateNotification]) {
				center.addObserverForNameObjectQueueUsingBlock(name, null, g.NSOperationQueue.mainQueue, (notification: any) => attachToScene(notification.object));
			}
			setTimeout(attachToConnectedScenes, 0);
			return true;
		},
	};
	if (usesScenes) {
		appDelegateMethods.applicationConfigurationForConnectingSceneSessionOptions = (_app: any, session: any) => {
			const configuration = g.UISceneConfiguration.configurationWithNameSessionRole('Default', session.role);
			configuration.delegateClass = SceneDelegate;
			return configuration;
		};
	}
	g.UIResponder.extend(appDelegateMethods, { name: 'NSDevBootFallbackAppDelegate', protocols: [g.UIApplicationDelegate] });
	g.UIApplicationMain(0, null, null, 'NSDevBootFallbackAppDelegate');
	return screen;
}
