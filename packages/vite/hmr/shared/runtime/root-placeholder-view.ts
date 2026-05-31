import { BOOT_PLACEHOLDER_MOTION, computeBootProgressFillScale, getBootPlaceholderPalette } from './boot-placeholder-ui.js';

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
export type PlaceholderCtors = {
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

export type PlaceholderRefs = {
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

export function buildPlaceholderPage(ctors: PlaceholderCtors): PlaceholderRefs {
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
