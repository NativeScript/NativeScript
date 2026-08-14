// Late-registration bridge for one-shot iOS launch notifications.
//
// Under a webpack (or non-HMR vite) build the app bundle evaluates BEFORE
// `UIApplicationMain` finishes launching, so app code doing
// `Application.ios.addNotificationObserver(UIApplicationDidFinishLaunchingNotification, cb)`
// registers in time and `cb` fires. Under the HTTP dev session UIKit is fully
// launched (the boot placeholder is on screen) long before the app graph
// evaluates — those observers register AFTER the notification fired and are
// never called. Real-world fallout: apps that gate SDK init (auth clients,
// Firebase, Sentry) behind didFinishLaunching silently never initialize, and
// only under HMR.
//
// The bridge wraps `addNotificationObserver` so a post-launch registration
// for Did/WillFinishLaunching still registers normally (harmless) AND has its
// callback invoked on the next macrotask with a synthesized NSNotification.
//
// Ordering contract: this MUST be installed before the app entry evaluates.
// The /__ns_dev__/client bootstrap wrapper imports this module and the
// canonical /ns/core bridge STATICALLY and calls the installer at its own
// evaluation — the session bootstrap imports that wrapper before the entry,
// so the wrap is deterministically in place when app code runs. (The full HMR
// client module cannot own this: the wrapper starts it asynchronously, and
// its evaluation reliably loses the race against the entry graph.)

/** Wrap one Application-like `.ios` object. Returns true when wrapped (or already wrapped). */
function wrapLaunchNotificationObserverApi(appIos: any): boolean {
	if (!appIos || typeof appIos.addNotificationObserver !== 'function') {
		return false;
	}
	if (appIos.__nsDevLaunchBridgeInstalled) {
		return true;
	}
	const g: any = globalThis;
	const launchNames = new Set<string>();
	try {
		if (typeof g.UIApplicationDidFinishLaunchingNotification === 'string') launchNames.add(g.UIApplicationDidFinishLaunchingNotification);
	} catch {}
	try {
		if (typeof g.UIApplicationWillFinishLaunchingNotification === 'string') launchNames.add(g.UIApplicationWillFinishLaunchingNotification);
	} catch {}
	if (!launchNames.size) {
		// Not an iOS runtime (or the UIKit constants are unavailable) — nothing
		// to bridge.
		appIos.__nsDevLaunchBridgeInstalled = true;
		return true;
	}
	const original = appIos.addNotificationObserver.bind(appIos);
	appIos.addNotificationObserver = function (name: string, onReceiveCallback: (notification: unknown) => void) {
		const observer = original(name, onReceiveCallback);
		if (launchNames.has(name)) {
			setTimeout(() => {
				try {
					let notification: unknown = null;
					try {
						notification = g.NSNotification?.notificationWithNameObject?.(name, null) ?? null;
					} catch {}
					onReceiveCallback(notification);
				} catch (err) {
					console.warn('[ns-dev] replayed launch-notification observer threw', err);
				}
			}, 0);
		}
		return observer;
	};
	appIos.__nsDevLaunchBridgeInstalled = true;
	// One line per wrapped instance (≤ a few per boot): which realm's
	// Application got bridged — the single most load-bearing fact when an
	// app's launch-gated SDK init doesn't run. Keep it unconditional.
	console.info('[ns-dev] launch-notification bridge installed');
	return true;
}

/**
 * Wrap every reachable `Application.ios`. Multiple `Application` instances can
 * coexist on device (the /ns/core bridge realm the APP graph imports, the
 * vendor-registry/deps-bundle realm, whatever landed on globalThis) — which
 * one an app's registration goes through depends on its import path, so wrap
 * them all. `explicitApplication` should be the /ns/core realm's Application
 * (what app code actually gets); extra candidates are best-effort.
 */
export function installLaunchNotificationBridge(explicitApplication?: any, extraCandidates?: any[]): boolean {
	let wrappedAny = false;
	const candidates = [explicitApplication, ...(extraCandidates || []), (globalThis as any).Application];
	for (const candidate of candidates) {
		try {
			if (candidate?.ios && wrapLaunchNotificationObserverApi(candidate.ios)) {
				wrappedAny = true;
			}
		} catch {}
	}
	return wrappedAny;
}
