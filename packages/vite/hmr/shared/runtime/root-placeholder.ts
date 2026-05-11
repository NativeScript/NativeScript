import { BOOT_PLACEHOLDER_MOTION, computeBootProgressFillScale, formatBootDetailLine, formatBootPrimaryLine, getBootPlaceholderPalette } from './boot-placeholder-ui.js';
import { setHmrBootStage } from './dev-overlay.js';

function isPlaceholderView(view: any, placeholderRoot: any): boolean {
	if (!view) {
		return false;
	}
	if (placeholderRoot && view === placeholderRoot) {
		return true;
	}
	try {
		if ((view as any).__ns_dev_placeholder) {
			return true;
		}
	} catch {}
	return false;
}

function getCommittedRootView(application: any, placeholderRoot: any): any | null {
	try {
		const root = application?.getRootView?.() || null;
		if (!root) {
			return null;
		}
		if (!isPlaceholderView(root, placeholderRoot)) {
			return root;
		}
		const currentPage = (root as any).currentPage || (root as any)._currentEntry?.resolvedPage || null;
		if (currentPage && !isPlaceholderView(currentPage, placeholderRoot)) {
			return root;
		}
	} catch {}
	return null;
}

function getPlaceholderWaitDiagnosticSnapshot(g: any, application: any, placeholderRoot: any): Record<string, unknown> {
	const snapshot: Record<string, unknown> = {
		bootComplete: !!g.__NS_HMR_BOOT_COMPLETE__,
		hasPlaceholderRoot: !!placeholderRoot,
		hasPlaceholderFlag: !!g.__NS_DEV_PLACEHOLDER_ROOT_EARLY__,
		hasAngularAppRef: !!g.__NS_ANGULAR_APP_REF__,
		hasAngularReboot: typeof g.__reboot_ng_modules__ === 'function',
	};

	try {
		snapshot.applicationType = application?.constructor?.name;
		snapshot.hasLaunched = typeof application?.hasLaunched === 'function' ? !!application.hasLaunched() : undefined;
		snapshot.rootViewType = application?.getRootView?.()?.constructor?.name;
	} catch {}

	try {
		const Frame = g.Frame;
		const topmost = Frame?.topmost?.() || null;
		snapshot.topmostFrameType = topmost?.constructor?.name;
		snapshot.topmostPageType = topmost?.currentPage?.constructor?.name || topmost?._currentEntry?.resolvedPage?.constructor?.name;
	} catch {}

	return snapshot;
}

function restoreOriginalApplicationRun(g: any): void {
	const originalRun = g['__NS_DEV_ORIGINAL_APP_RUN__'];
	if (typeof originalRun !== 'function') {
		return;
	}

	const application = g['__NS_DEV_PLACEHOLDER_APPLICATION__'] || g.Application;
	try {
		if (application) {
			(application as any).run = originalRun;
		}
	} catch {}
	try {
		if (g.Application && g.Application !== application) {
			g.Application.run = originalRun;
		}
	} catch {}
	try {
		const proto = application ? Object.getPrototypeOf(application) : null;
		if (proto && typeof proto.run === 'function' && proto.run !== originalRun) {
			proto.run = originalRun;
		}
	} catch {}
	delete g['__NS_DEV_ORIGINAL_APP_RUN__'];
}

function clearPlaceholderGlobals(g: any): void {
	delete g['__NS_DEV_PLACEHOLDER_ROOT_VIEW__'];
	delete g['__NS_DEV_PLACEHOLDER_ROOT_EARLY__'];
	delete g['__NS_DEV_BOOT_STATUS_LABEL__'];
	delete g['__NS_DEV_BOOT_DETAIL_LABEL__'];
	delete g['__NS_DEV_BOOT_PROGRESS_FILL__'];
	delete g['__NS_DEV_BOOT_PROGRESS_LAST_SCALE__'];
	delete g['__NS_DEV_BOOT_ACTIVITY_INDICATOR__'];
	delete g['__NS_DEV_PLACEHOLDER_LAUNCH_HANDLER__'];
	delete g['__NS_DEV_PLACEHOLDER_APPLICATION__'];
	const timer = g['__NS_DEV_PLACEHOLDER_RESTORE_TIMER__'];
	if (timer) {
		try {
			clearTimeout(timer);
		} catch {}
	}
	delete g['__NS_DEV_PLACEHOLDER_RESTORE_TIMER__'];
}

// Card-based placeholder view construction. Returns the refs the
// dev-overlay needs to drive the live "Importing the app entry"
// readout — phase label, detail label, progress fill view, activity
// indicator — alongside the page that gets handed to Frame.
//
// Built defensively for secondary chrome (GridLayout, ContentView,
// Color, ActivityIndicator) which we treat as optional: if any of
// those constructors are missing we degrade to a plainer-but-still-
// functional layout so the placeholder never crashes the boot just
// to look pretty. The core ctors (Page, Label, Image, StackLayout)
// are required.
type PlaceholderCtors = {
	Page: any;
	Label: any;
	Image: any;
	ActivityIndicator: any | null;
	StackLayout: any | null;
	GridLayout: any | null;
	ContentView: any | null;
	Color: any | null;
	verbose?: boolean;
};

// Official NativeScript wordmark, dark slate on transparent. Hosted
// remotely so we don't have to ship the asset with @nativescript/vite;
// fetched once per cold boot, NS's Image element handles caching.
const NATIVESCRIPT_LOGO_URL = 'https://raw.githubusercontent.com/NativeScript/artwork/main/logo/export/NativeScript_Logo_Dark_Transparent.png';
const BRAND_MARK_SIZE = 44;

type PlaceholderRefs = {
	page: any;
	statusLabel: any;
	detailLabel: any | null;
	progressFill: any | null;
	activityIndicator: any | null;
};

function makeColor(Color: any, value: string): any {
	if (!Color) return value;
	try {
		return new Color(value);
	} catch {
		return value;
	}
}

// iOS layer-level shadow. Soft + offset down so the card reads as
// "slightly lifted off the page" without a heavy, dated drop.
function applyIosCardShadow(card: any, shadowHex: string, ColorCtor: any): void {
	const ios = (card as any).ios;
	const layer = ios?.layer;
	if (!layer) return;
	if (ColorCtor) {
		const shadowColor = new ColorCtor(shadowHex);
		const uiColor = (shadowColor as any).ios;
		if (uiColor && typeof uiColor.CGColor !== 'undefined') {
			layer.shadowColor = uiColor.CGColor;
		}
	}
	layer.shadowOpacity = 0.18;
	layer.shadowRadius = 16;
	layer.shadowOffset = { width: 0, height: 6 };
	layer.masksToBounds = false;
}

// Pre-load setup: keep the card invisible + slightly down-scaled so
// it doesn't flash at full opacity before the loaded handler can
// kick off the entrance animation. Called once at construction.
function primeCardForEntrance(card: any): void {
	if (!card) return;
	try {
		card.opacity = 0;
		card.scaleX = BOOT_PLACEHOLDER_MOTION.entranceFromScale;
		card.scaleY = BOOT_PLACEHOLDER_MOTION.entranceFromScale;
	} catch {}
}

// One-shot fade + scale on attach. Triggered from `loaded` so we run
// after the view has been measured and committed to the visual tree.
// Primed via `primeCardForEntrance` to avoid a pre-animation flash.
function animateCardIn(card: any): void {
	if (!card || typeof card.animate !== 'function') return;
	try {
		card
			.animate({
				opacity: 1,
				scale: { x: 1, y: 1 },
				duration: BOOT_PLACEHOLDER_MOTION.entranceDurationMs,
				curve: 'easeOut',
			})
			.catch(() => {
				try {
					card.opacity = 1;
					card.scaleX = 1;
					card.scaleY = 1;
				} catch {}
			});
	} catch {}
}

// Slow opacity pulse on the brand mark to give the otherwise-static
// card a heartbeat. Loops until boot completes (the `__NS_HMR_BOOT_COMPLETE__`
// gate) or the view is detached (animate rejects and the .catch swallows it).
function pulseBrandMark(badge: any): void {
	if (!badge || typeof badge.animate !== 'function') return;
	const g: any = globalThis as any;
	if (g.__NS_HMR_BOOT_COMPLETE__) return;
	try {
		badge
			.animate({
				opacity: BOOT_PLACEHOLDER_MOTION.brandPulseMinOpacity,
				duration: BOOT_PLACEHOLDER_MOTION.brandPulseDurationMs,
				curve: 'easeInOut',
			})
			.then(() =>
				badge.animate({
					opacity: 1,
					duration: BOOT_PLACEHOLDER_MOTION.brandPulseDurationMs,
					curve: 'easeInOut',
				}),
			)
			.then(() => pulseBrandMark(badge))
			.catch(() => {});
	} catch {}
}

function buildPlaceholderPage(ctors: PlaceholderCtors): PlaceholderRefs {
	const { Page, Label, ActivityIndicator, StackLayout, GridLayout, ContentView, Image, Color } = ctors;
	const palette = getBootPlaceholderPalette('info');

	const page = new Page();
	page.actionBarHidden = true;
	try {
		page.backgroundColor = makeColor(Color, palette.pageBackground);
	} catch {}

	const titleLabel = new Label();
	titleLabel.text = 'NativeScript Vite preparing dev session...';
	titleLabel.textAlignment = 'center';
	titleLabel.textWrap = true;
	titleLabel.fontSize = 18;
	titleLabel.fontWeight = '700';
	try {
		titleLabel.color = makeColor(Color, palette.titleText);
	} catch {}
	titleLabel.marginTop = 18;

	const statusLabel = new Label();
	statusLabel.text = 'Preparing the HTTP HMR bootstrap (4%)';
	statusLabel.textAlignment = 'center';
	statusLabel.textWrap = true;
	statusLabel.fontSize = 13;
	try {
		statusLabel.color = makeColor(Color, palette.phaseText);
	} catch {}
	statusLabel.marginTop = 10;

	const detailLabel = new Label();
	detailLabel.text = '';
	detailLabel.textAlignment = 'center';
	detailLabel.textWrap = true;
	detailLabel.fontSize = 11;
	try {
		detailLabel.color = makeColor(Color, palette.detailText);
	} catch {}
	detailLabel.marginTop = 12;

	const activityIndicator = ActivityIndicator
		? (() => {
				const indicator = new ActivityIndicator();
				indicator.busy = true;
				indicator.marginTop = 14;
				indicator.width = 22;
				indicator.height = 22;
				indicator.horizontalAlignment = 'center';
				try {
					indicator.color = makeColor(Color, palette.activityIndicator);
				} catch {}
				return indicator;
			})()
		: null;

	let progressFill: any = null;
	let progressTrack: any = null;
	if (GridLayout && ContentView) {
		try {
			progressTrack = new GridLayout();
			progressTrack.height = 6;
			progressTrack.marginTop = 16;
			progressTrack.marginLeft = 4;
			progressTrack.marginRight = 4;
			try {
				progressTrack.backgroundColor = makeColor(Color, palette.progressTrack);
			} catch {}
			try {
				progressTrack.borderRadius = 3;
			} catch {}
			progressTrack.horizontalAlignment = 'stretch';

			progressFill = new ContentView();
			progressFill.height = 6;
			progressFill.horizontalAlignment = 'stretch';
			progressFill.verticalAlignment = 'middle';
			try {
				progressFill.backgroundColor = makeColor(Color, palette.progressFill);
			} catch {}
			try {
				progressFill.borderRadius = 3;
			} catch {}
			// Anchor the scale transform at the left edge so the fill
			// grows rightward like a real progress bar. Starting scale
			// matches `computeBootProgressFillScale(0)` = 0.01 — visible
			// sliver of accent that telegraphs "we're starting".
			try {
				progressFill.originX = 0;
			} catch {}
			progressFill.scaleX = computeBootProgressFillScale(0);

			progressTrack.addChild(progressFill);
		} catch {
			progressTrack = null;
			progressFill = null;
		}
	}

	const brandMark = new Image();
	brandMark.src = NATIVESCRIPT_LOGO_URL;
	brandMark.stretch = 'aspectFit';
	brandMark.width = BRAND_MARK_SIZE;
	brandMark.height = BRAND_MARK_SIZE;
	brandMark.horizontalAlignment = 'center';
	brandMark.on?.('loaded', () => pulseBrandMark(brandMark));

	let card: any = null;
	if (StackLayout) {
		try {
			card = new StackLayout();
			card.padding = '24 28 22 28';
			try {
				card.backgroundColor = makeColor(Color, palette.cardBackground);
			} catch {}
			try {
				card.borderRadius = 18;
			} catch {}
			card.width = 320;
			card.horizontalAlignment = 'center';
			if (brandMark) card.addChild(brandMark);
			card.addChild(titleLabel);
			card.addChild(statusLabel);
			if (progressTrack) card.addChild(progressTrack);
			card.addChild(detailLabel);
			if (activityIndicator) card.addChild(activityIndicator);

			primeCardForEntrance(card);
			card.on?.('loaded', () => {
				try {
					const ios = (card as any).ios;
					if (ios && ios.layer) {
						ios.layer.cornerRadius = 18;
						ios.layer.masksToBounds = false;
					}
				} catch {}
				applyIosCardShadow(card, palette.cardShadow, Color);
				animateCardIn(card);
			});
		} catch {
			card = null;
		}
	}

	if (card && GridLayout) {
		try {
			const root = new GridLayout();
			root.horizontalAlignment = 'stretch';
			root.verticalAlignment = 'stretch';
			try {
				root.backgroundColor = makeColor(Color, palette.pageBackground);
			} catch {}
			card.verticalAlignment = 'middle';
			card.horizontalAlignment = 'center';
			root.addChild(card);
			page.content = root;
		} catch {
			page.content = card;
		}
	} else if (card) {
		card.verticalAlignment = 'middle';
		page.content = card;
	} else if (StackLayout) {
		// StackLayout exists but card creation failed — fall back to the
		// minimal three-child layout the older placeholder used so the
		// dev-overlay's fallback `findBootStatusLabel` walk still works.
		try {
			const root = new StackLayout();
			root.padding = 24;
			root.verticalAlignment = 'middle';
			root.horizontalAlignment = 'center';
			root.addChild(titleLabel);
			root.addChild(statusLabel);
			if (activityIndicator) root.addChild(activityIndicator);
			page.content = root;
		} catch {
			titleLabel.verticalAlignment = 'middle';
			titleLabel.horizontalAlignment = 'center';
			titleLabel.width = 280;
			titleLabel.padding = 12;
			page.content = titleLabel;
		}
	} else {
		titleLabel.verticalAlignment = 'middle';
		titleLabel.horizontalAlignment = 'center';
		titleLabel.width = 280;
		titleLabel.padding = 12;
		page.content = titleLabel;
	}

	return {
		page,
		statusLabel,
		detailLabel: card ? detailLabel : null,
		progressFill,
		activityIndicator,
	};
}

export function tryFinalizeBootPlaceholder(reason?: string, verbose?: boolean): boolean {
	const g: any = globalThis as any;
	const placeholderRoot = g['__NS_DEV_PLACEHOLDER_ROOT_VIEW__'] || null;
	const hadPlaceholder = !!placeholderRoot || !!g['__NS_DEV_PLACEHOLDER_ROOT_EARLY__'] || !!g['__NS_DEV_BOOT_STATUS_LABEL__'] || !!g['__NS_DEV_BOOT_ACTIVITY_INDICATOR__'];
	const application = g['__NS_DEV_PLACEHOLDER_APPLICATION__'] || g.Application;
	const committedRoot = getCommittedRootView(application, placeholderRoot);

	if (!committedRoot) {
		return false;
	}

	let detachedPlaceholder = false;
	if (hadPlaceholder) {
		try {
			const launchHandler = g['__NS_DEV_PLACEHOLDER_LAUNCH_HANDLER__'];
			if (application && typeof (application as any).off === 'function' && launchHandler) {
				(application as any).off((application as any).launchEvent, launchHandler);
			}
		} catch {}
		restoreOriginalApplicationRun(g);
		clearPlaceholderGlobals(g);
		detachedPlaceholder = true;
	}

	try {
		g.__NS_HMR_BOOT_COMPLETE__ = true;
	} catch {}

	if (detachedPlaceholder) {
		setHmrBootStage('app-root-committed', {
			detail: 'The real app root replaced the boot placeholder.',
		});
	}

	if (verbose) {
		console.info('[ns-placeholder] real app root committed', {
			reason,
			rootType: committedRoot?.constructor?.name || typeof committedRoot,
			detachedPlaceholder,
		});
	}

	return true;
}

function scheduleBootPlaceholderFinalize(reason?: string, verbose?: boolean): void {
	const g: any = globalThis as any;
	if (g['__NS_DEV_PLACEHOLDER_RESTORE_TIMER__']) {
		return;
	}

	const startedAt = Date.now();
	const maxWaitMs = 20000;
	let attempts = 0;
	const tick = () => {
		delete g['__NS_DEV_PLACEHOLDER_RESTORE_TIMER__'];
		if (tryFinalizeBootPlaceholder(reason, verbose)) {
			return;
		}
		attempts += 1;
		if (Date.now() - startedAt >= maxWaitMs) {
			if (verbose) {
				console.info('[ns-placeholder] waiting for real root commit timed out', {
					reason,
					attempts,
					waitMs: Date.now() - startedAt,
					state: getPlaceholderWaitDiagnosticSnapshot(g, g['__NS_DEV_PLACEHOLDER_APPLICATION__'] || g.Application, g['__NS_DEV_PLACEHOLDER_ROOT_VIEW__'] || null),
				});
			}
			return;
		}
		g['__NS_DEV_PLACEHOLDER_RESTORE_TIMER__'] = setTimeout(tick, attempts === 1 ? 0 : 100);
	};

	tick();
}

// Root placeholder installer used during dev HMR until HTTP ESM loads.
//
// Architecture:
//   1. Install a launchEvent handler that provides a placeholder Frame/Page
//   2. Call Application.run() to start the iOS lifecycle (required or app terminates)
//   3. Inside the handler (after root is set), patch Application.run so subsequent
//      calls (from the real app module) become Application.resetRootView()
//
// This means the app's entry (e.g., index.ts) can call Application.run({ create })
// exactly as it would in production — the patch intercepts it and does a clean
// root replacement instead of fighting the already-running lifecycle.

export function installRootPlaceholder(verbose?: boolean) {
	const g: any = globalThis as any;
	if (g['__NS_DEV_PLACEHOLDER_ROOT_EARLY__']) return;
	g['__NS_DEV_PLACEHOLDER_ROOT_EARLY__'] = true;
	g['__NS_DEV_RESTORE_PLACEHOLDER__'] = (reason?: string) => {
		if (!tryFinalizeBootPlaceholder(reason, verbose)) {
			scheduleBootPlaceholderFinalize(reason, verbose);
		}
	};
	try {
		type ResolvedModule = { value: any; via: string; moduleId: string };
		const resolveModule = (moduleIds: string[]): ResolvedModule | undefined => {
			for (const moduleId of moduleIds) {
				try {
					if (typeof g.moduleExists === 'function' && g.moduleExists(moduleId) && typeof g.loadModule === 'function') {
						const mod = g.loadModule(moduleId);
						if (mod) return { value: (mod.default ?? mod) || mod, via: 'loadModule', moduleId };
					}
				} catch {}
				try {
					const reg = g.__nsVendorRegistry;
					if (reg?.has?.(moduleId)) {
						const mod = reg.get(moduleId);
						if (mod) return { value: (mod.default ?? mod) || mod, via: '__nsVendorRegistry', moduleId };
					}
				} catch {}
				try {
					const req = g.__nsVendorRequire || g.__nsRequire || g.require;
					if (typeof req === 'function') {
						const mod = req(moduleId);
						if (mod) return { value: (mod.default ?? mod) || mod, via: 'require', moduleId };
					}
				} catch {}
				try {
					const nr = g.__nativeRequire;
					if (typeof nr === 'function') {
						const mod = nr(moduleId, '/');
						if (mod) return { value: (mod.default ?? mod) || mod, via: '__nativeRequire', moduleId };
					}
				} catch {}
			}
			return undefined;
		};
		const getCore = (name: string): { value: any; source: string } => {
			if (name === 'Application' && g.Application && (typeof g.Application.run === 'function' || typeof g.Application.on === 'function' || typeof g.Application.resetRootView === 'function')) {
				return { value: g.Application, source: 'globalThis.Application' };
			}

			const pickApplicationApi = (candidate: any, source: string): { value: any; source: string } | null => {
				if (!candidate) return null;
				const candidates = [
					{ value: candidate, source },
					{ value: candidate.Application, source: `${source}#Application` },
					{ value: candidate.app, source: `${source}#app` },
					{ value: candidate.application, source: `${source}#application` },
				];
				for (const entry of candidates) {
					if (entry.value && (typeof entry.value.run === 'function' || typeof entry.value.on === 'function' || typeof entry.value.resetRootView === 'function')) {
						return entry;
					}
				}
				return null;
			};

			if (name === 'Application') {
				const applicationModule = resolveModule(['@nativescript/core/application']);
				const pickedFromAppModule = pickApplicationApi(applicationModule?.value, applicationModule ? `${applicationModule.via}:${applicationModule.moduleId}` : '@nativescript/core/application');
				if (pickedFromAppModule) return pickedFromAppModule;
			}

			const primary = resolveModule(['@nativescript/core']);
			if (name === 'Application' && primary?.value) {
				const pickedFromPrimary = pickApplicationApi(primary.value, `${primary.via}:${primary.moduleId}`);
				if (pickedFromPrimary) return pickedFromPrimary;
			}
			if (primary?.value && primary.value[name]) return { value: primary.value[name], source: `${primary.via}:${primary.moduleId}` };

			const ui = resolveModule(['@nativescript/core/ui']);
			if (ui?.value && ui.value[name]) return { value: ui.value[name], source: `${ui.via}:${ui.moduleId}` };

			return { value: undefined, source: 'unresolved' };
		};
		const applicationResolved = getCore('Application');
		const frameResolved = getCore('Frame');
		const pageResolved = getCore('Page');
		const labelResolved = getCore('Label');
		const activityResolved = getCore('ActivityIndicator');
		const Application = applicationResolved.value;
		const Frame = frameResolved.value;
		const Page = pageResolved.value;
		const Label = labelResolved.value;
		const ActivityIndicator = activityResolved.value;
		if (!Application) {
			if (verbose) {
				console.warn('[ns-placeholder] Application unavailable', {
					resolution: {
						Application: applicationResolved.source,
						Frame: frameResolved.source,
						Page: pageResolved.source,
						Label: labelResolved.source,
					},
					moduleApis: {
						moduleExists: typeof g.moduleExists === 'function',
						loadModule: typeof g.loadModule === 'function',
						uiModuleRegistered: typeof g.moduleExists === 'function' ? !!g.moduleExists('@nativescript/core/ui') : false,
					},
				});
			}
			return;
		}
		g['__NS_DEV_PLACEHOLDER_APPLICATION__'] = Application;
		const isAndroid = !!(g.__ANDROID__ || typeof g.android !== 'undefined');
		if (!isAndroid && typeof (Application as any).resetRootView === 'function' && !g['__NS_DEV_PATCHED_RESET_ROOT_VIEW__']) {
			const __ns_dev_original_reset_root_view = (Application as any).resetRootView.bind(Application);
			const __ns_dev_patched_reset_root_view = function __ns_dev_patched_reset_root_view(entry?: any) {
				const result = __ns_dev_original_reset_root_view(entry);
				try {
					const restore = g['__NS_DEV_RESTORE_PLACEHOLDER__'];
					if (typeof restore === 'function') {
						restore('Application.resetRootView');
					}
				} catch {}
				return result;
			};
			(Application as any).resetRootView = __ns_dev_patched_reset_root_view;
			try {
				if (g.Application && g.Application !== Application) {
					g.Application.resetRootView = __ns_dev_patched_reset_root_view;
				}
			} catch {}
			try {
				const proto = Object.getPrototypeOf(Application);
				if (proto && typeof proto.resetRootView === 'function' && proto.resetRootView !== __ns_dev_patched_reset_root_view) {
					proto.resetRootView = __ns_dev_patched_reset_root_view;
				}
			} catch {}
			g['__NS_DEV_PATCHED_RESET_ROOT_VIEW__'] = true;
		}
		const canCreatePlaceholderRoot = !!Frame && !!Page && !!Label;
		if (!canCreatePlaceholderRoot && verbose) {
			console.warn('[ns-placeholder] visual placeholder unavailable; starting lifecycle without placeholder root', {
				resolution: {
					Application: applicationResolved.source,
					Frame: frameResolved.source,
					Page: pageResolved.source,
					Label: labelResolved.source,
					ActivityIndicator: activityResolved.source,
				},
				moduleApis: {
					moduleExists: typeof g.moduleExists === 'function',
					loadModule: typeof g.loadModule === 'function',
					uiModuleRegistered: typeof g.moduleExists === 'function' ? !!g.moduleExists('@nativescript/core/ui') : false,
				},
			});
		}

		let handlerFired = false;

		// launchEvent handler: provides a placeholder root, then patches Application.run
		const __ns_launch_handler = (args?: any) => {
			if (verbose) {
				console.info('[ns-placeholder] launch handler fired', {
					hasArgs: !!args,
					hasExistingRoot: !!args?.root,
					hasLaunched: typeof (Application as any).hasLaunched === 'function' ? !!(Application as any).hasLaunched() : undefined,
					started: !!(Application as any).started,
				});
			}
			try {
				const prev = args?.root;
				if (!prev && canCreatePlaceholderRoot && Frame && Page && Label) {
					const built = buildPlaceholderPage({ Page, Label, ActivityIndicator, StackLayout: getCore('StackLayout').value, GridLayout: getCore('GridLayout').value, ContentView: getCore('ContentView').value, Image: getCore('Image').value, Color: getCore('Color').value, verbose });
					const { page, statusLabel, detailLabel, progressFill, activityIndicator } = built;

					g['__NS_DEV_BOOT_STATUS_LABEL__'] = statusLabel;
					g['__NS_DEV_BOOT_DETAIL_LABEL__'] = detailLabel;
					g['__NS_DEV_BOOT_PROGRESS_FILL__'] = progressFill;
					g['__NS_DEV_BOOT_ACTIVITY_INDICATOR__'] = activityIndicator;

					const frame = new Frame();
					frame.navigate({ create: () => page, clearHistory: true, animated: false });
					try {
						(frame as any).__ns_dev_placeholder = true;
						(page as any).__ns_dev_placeholder = true;
						g['__NS_DEV_PLACEHOLDER_ROOT_VIEW__'] = frame;
					} catch {}
					if (verbose) {
						console.info('[ns-placeholder] assigned placeholder root', {
							frameType: frame?.constructor?.name,
							pageType: page?.constructor?.name,
							hasProgressFill: !!progressFill,
							hasActivityIndicator: !!activityIndicator,
						});
					}
					if (args) args.root = frame;
				}
			} catch (e) {
				console.error('[ns-placeholder] root error', e);
			}

			if (!handlerFired) {
				handlerFired = true;

				// Patch Application.run() → resetRootView() for subsequent calls.
				// The app lifecycle is now running — a second run() is undefined
				// behavior, but resetRootView() is the documented API for
				// replacing the root of a running app.
				//
				// Patch on ALL possible references. The vendor-registry Application,
				// globalThis.Application, and the prototype may be different objects.
				try {
					if (Application && typeof (Application as any).run === 'function') {
						const _originalRun = (Application as any).run.bind(Application);
						g['__NS_DEV_ORIGINAL_APP_RUN__'] = _originalRun;
						const __ns_dev_patched_run = function __ns_dev_patched_run(entry?: any) {
							try {
								// Detach the launch handler, but keep placeholder refs until the
								// real app root is actually committed.
								try {
									if (Application && (Application as any).off) {
										(Application as any).off((Application as any).launchEvent, __ns_launch_handler);
									}
								} catch {}

								// When entry is undefined/null, the calling framework (e.g. Angular)
								// manages root views itself via launch events and resetRootView().
								// Don't attempt resetRootView(undefined) which throws "Main entry is missing".
								if (!entry) {
									if (verbose) console.info('[ns-placeholder] patched run() called with no entry; framework manages root view');
									return;
								}

								const isModuleNameEntry = entry && entry.moduleName && !entry.create;
								if (isModuleNameEntry) {
									if (typeof (Application as any).resetRootView === 'function') {
										(Application as any).resetRootView(entry);
									}
								} else {
									// Framework path: two-phase boot with dominative document
									(Application as any)._rootView = null;

									try {
										const domModule =
											g.__nsVendorRegistry?.get?.('dominative') ||
											(typeof require === 'function'
												? (() => {
														try {
															return require('dominative');
														} catch {
															return null;
														}
													})()
												: null);
										const doc = domModule?.document;

										if (doc && typeof (Application as any).resetRootView === 'function') {
											(Application as any).resetRootView({ create: () => doc });
											if (entry && typeof entry.create === 'function') {
												entry.create();
											}
										} else {
											if (typeof (Application as any).resetRootView === 'function') {
												(Application as any).resetRootView(entry);
											}
										}
									} catch (e2: any) {
										if (verbose) console.warn('[ns-placeholder] two-phase boot failed:', e2?.message || e2);
										try {
											if (typeof (Application as any).resetRootView === 'function') {
												(Application as any).resetRootView(entry);
											}
										} catch {}
									}
								}
							} catch (e) {
								console.warn('[ns-placeholder] patched run() error:', e);
							}
						};
						(Application as any).run = __ns_dev_patched_run;
						if (verbose) {
							console.info('[ns-placeholder] patched Application.run');
						}
						if (g.Application && g.Application !== Application) {
							g.Application.run = __ns_dev_patched_run;
						}
						try {
							const proto = Object.getPrototypeOf(Application);
							if (proto && typeof proto.run === 'function' && proto.run !== __ns_dev_patched_run) {
								proto.run = __ns_dev_patched_run;
							}
						} catch {}
					}
				} catch {}
			}
		};
		g['__NS_DEV_PLACEHOLDER_LAUNCH_HANDLER__'] = __ns_launch_handler;

		try {
			if (Application && (Application as any).on) {
				(Application as any).on((Application as any).launchEvent, __ns_launch_handler);
			}
		} catch {}

		// Determine boot path
		try {
			const appAny = Application as any;
			const methodState = {
				hasRun: typeof appAny?.run === 'function',
				hasOn: typeof appAny?.on === 'function',
				hasOff: typeof appAny?.off === 'function',
				hasHasLaunched: typeof appAny?.hasLaunched === 'function',
				hasGetRootView: typeof appAny?.getRootView === 'function',
				hasResetRootView: typeof appAny?.resetRootView === 'function',
				hasRunAsMainApp: typeof appAny?.runAsMainApp === 'function',
				type: appAny?.constructor?.name,
			};
			if (verbose) {
				console.info('[ns-placeholder] application methods', methodState);
				console.info('[ns-placeholder] application source', applicationResolved.source);
			}

			if (!appAny || typeof appAny.run !== 'function') {
				console.warn('[ns-placeholder] Application.run unavailable', {
					...methodState,
					source: applicationResolved.source,
				});
				return;
			}

			const hasLaunched = typeof appAny.hasLaunched === 'function' ? !!appAny.hasLaunched() : false;
			const hasRootView = typeof appAny.getRootView === 'function' ? !!appAny.getRootView() : false;
			const started = !!appAny.started;
			const nativeApp = appAny.nativeApp;
			const iosNativeApp = appAny.ios?.nativeApp;
			const canRunAsMainApp = typeof appAny.runAsMainApp === 'function';
			if (verbose) {
				console.info('[ns-placeholder] boot state', {
					hasLaunched,
					hasRootView,
					started,
					nativeApp: !!nativeApp,
					iosNativeApp: !!iosNativeApp,
					canRunAsMainApp,
					hasResetRootView: typeof appAny.resetRootView === 'function',
				});
			}

			if (hasLaunched || hasRootView) {
				// App lifecycle is already active. Skip starting it again and only install
				// the placeholder root/patching behavior for the existing instance.
				if (verbose) {
					console.info('[ns-placeholder] boot branch: existing lifecycle');
				}
				try {
					__ns_launch_handler();
				} catch {}
			} else if (canRunAsMainApp) {
				if (verbose) {
					console.info('[ns-placeholder] boot branch: runAsMainApp');
				}
				appAny.started = true;
				appAny.runAsMainApp();
			} else {
				if (verbose) {
					console.info('[ns-placeholder] boot branch: Application.run');
				}
				appAny.run();
			}
		} catch (e) {
			console.warn('[ns-placeholder] boot error', e);
		}
	} catch (e) {
		console.error('[ns-placeholder] install failed', e);
	}
}
