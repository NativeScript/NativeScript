/**
 * The dev `bundle.mjs` under HMR: loads the app from the dev server and, when
 * that fails before the app launched, launches a minimal screen that says why.
 *
 * Imports nothing: the dev server writes this file's compiled output into
 * `bundle.mjs` as is (`helpers/dev-boot-bundle.ts`), and it must not depend on
 * anything the dev server serves (core included), so it drives UIKit through
 * the runtime directly.
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
// Copies of `NS_DEV_RESTART_PATH` and `NS_DEV_BOOT_FAILED_PATH` (`hmr/server/dev-routes.ts`).
export const RESTART_PATH = '/__ns_dev__/restart';
export const BOOT_FAILED_PATH = '/__ns_dev__/boot-failed';

const g: any = globalThis;

function canLaunchFallback(): boolean {
	return typeof g.UIApplicationMain === 'function' && typeof g.UIResponder === 'function';
}

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

/** Loads `/@vite/env` and the dev boot module; never rejects on iOS. */
export async function bootFromDevServer(options: DevBootLoaderOptions, importModule: (url: string) => Promise<any> = (url) => import(/* @vite-ignore */ url)): Promise<void> {
	const startedAt = Date.now();
	try {
		// `/@vite/env` installs `config.define` on globalThis (Vite's client
		// environment does no define substitution in served modules), so it
		// evaluates before the boot module's graph.
		await withTimeout(importModule(`${options.origin}/@vite/env`), REACHABILITY_TIMEOUT_MS, `no answer within ${REACHABILITY_TIMEOUT_MS / 1000} s`);
	} catch (error) {
		if (!canLaunchFallback()) throw error;
		showDevServerUnreachable(options, describe(error), startedAt);
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
	if (!canLaunchFallback()) throw new Error(failure.message);
	showBootFailure(options, failure);
}

function showDevServerUnreachable(options: DevBootLoaderOptions, failure: DevBootFailure, startedAt: number): void {
	console.error(`[ns-entry] the dev server at ${options.origin} is unreachable: ${failure.message}`);
	const text = `The app can't reach the dev server at ${options.origin} (${failure.message}).\n\nStart it with \`ns run\`, or check that this device is on the same network. The app restarts once the server answers.`;
	launchFallback({ title: 'Dev server unreachable', text, alert: true });
	// The fallback owns `UIApplicationMain` now, so the app can't boot in this
	// process: the dev server restarts it. It compares `age` with its own uptime.
	const reconnect = () => {
		const query = `reason=${encodeURIComponent('the dev server is reachable again')}&age=${Date.now() - startedAt}&token=${encodeURIComponent(options.token)}`;
		httpGet(`${options.origin}${RESTART_PATH}?${query}`, 3, (ok) => {
			if (!ok) setTimeout(reconnect, RECONNECT_INTERVAL_MS);
			else console.info('[ns-entry] the dev server is reachable again; it restarts the app');
		});
	};
	setTimeout(reconnect, RECONNECT_INTERVAL_MS);
}

function showBootFailure(options: DevBootLoaderOptions, failure: DevBootFailure): void {
	const details = failure.stack && failure.stack.indexOf(failure.message) === -1 ? `${failure.message}\n\n${failure.stack}` : failure.stack || failure.message;
	const screen = launchFallback({ title: 'The app failed to boot', text: `${details}\n\nFix the error and save: the app restarts.` });
	httpGet(`${options.origin}${BOOT_FAILED_PATH}?reason=${encodeURIComponent(failure.message)}&token=${encodeURIComponent(options.token)}`, 5, (ok, body) => {
		if (!ok || !body) return;
		try {
			const serverError = JSON.parse(body).serverError;
			if (typeof serverError === 'string' && serverError) screen.setText(`${serverError}\n\n${details}\n\nFix the error and save: the app restarts.`);
		} catch {}
	});
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
