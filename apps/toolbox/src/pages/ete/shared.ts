import { Application, GridLayout, Page, Utils, View } from '@nativescript/core';

/**
 * Colours every edge-to-edge page uses, so a screenshot reads the same way everywhere:
 *
 *   backdrop  the window behind everything - only visible where nothing else reaches
 *   probe     the view carrying androidOverflowEdge; the ring you see IS its padding
 *   inner     what is left after the probe padded itself
 *   core      a third level, for the tests that nest twice
 */
export const Palette = {
	backdrop: '#3f0d12',
	probe: '#166534',
	inner: '#1d4ed8',
	core: '#b45309',
};

export interface EdgeReadout {
	padding: string;
	edgeInsets: string;
	imeInsets: string;
}

function px(value: number): string {
	return `${value}px (${Math.round(Utils.layout.toDeviceIndependentPixels(value))}dip)`;
}

/** Reads what the view actually ended up with natively, not what we asked for. */
export function readEdges(view: View): EdgeReadout {
	const native = view?.android as org.nativescript.widgets.LayoutBase;
	if (!native) {
		return { padding: 'no native view', edgeInsets: '-', imeInsets: '-' };
	}

	const padding = `L ${px(native.getPaddingLeft())}\nT ${px(native.getPaddingTop())}\nR ${px(native.getPaddingRight())}\nB ${px(native.getPaddingBottom())}`;

	let edgeInsets = 'n/a';
	let imeInsets = 'n/a';
	if (native.getEdgeInsets) {
		const edges = native.getEdgeInsets();
		edgeInsets = `${edges.left}, ${edges.top}, ${edges.right}, ${edges.bottom}`;
		const ime = native.getImeInsets();
		imeInsets = `${ime.left}, ${ime.top}, ${ime.right}, ${ime.bottom}`;
	}

	return { padding, edgeInsets, imeInsets };
}

/** The window insets as the platform sees them, independent of any of our own handling. */
export function readWindowInsets(page: Page): string {
	const native = page?.android as android.view.View;
	if (!native) {
		return 'no native view';
	}

	const insets = androidx.core.view.ViewCompat.getRootWindowInsets(native);
	if (!insets) {
		return 'not attached yet';
	}

	const bars = insets.getInsets(androidx.core.view.WindowInsetsCompat.Type.systemBars());
	const ime = insets.getInsets(androidx.core.view.WindowInsetsCompat.Type.ime());
	const cutout = insets.getInsets(androidx.core.view.WindowInsetsCompat.Type.displayCutout());

	return `systemBars  ${bars.left}, ${bars.top}, ${bars.right}, ${bars.bottom}\n` + `ime         ${ime.left}, ${ime.top}, ${ime.right}, ${ime.bottom}\n` + `cutout      ${cutout.left}, ${cutout.top}, ${cutout.right}, ${cutout.bottom}`;
}

export function deviceSummary(): string {
	const sdk = android.os.Build.VERSION.SDK_INT;
	const model = android.os.Build.MODEL;
	const mode = Application.systemAppearance();
	const ignoring = Utils.android.getIgnoreEdgeToEdgeOnOlderDevices();

	return `${model} - Android ${android.os.Build.VERSION.RELEASE} (SDK ${sdk}) - ${mode} - ignoreOnOlderDevices=${ignoring}`;
}

/** Re-reads the probe once the layout pass that applied the insets has landed. */
export function afterLayout(view: View, callback: () => void): void {
	const handler = () => {
		view.off(GridLayout.layoutChangedEvent, handler);
		callback();
	};
	view.on(GridLayout.layoutChangedEvent, handler);
	setTimeout(callback, 60);
}
