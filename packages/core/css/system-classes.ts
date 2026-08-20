import { CoreTypes } from '../core-types';

const MODAL = 'modal';
const ROOT = 'root';
const cssClasses = [];

export namespace CSSUtils {
	export const CLASS_PREFIX = 'ns-';
	export const MODAL_ROOT_VIEW_CSS_CLASS = `${CLASS_PREFIX}${MODAL}`;
	export const ROOT_VIEW_CSS_CLASS = `${CLASS_PREFIX}${ROOT}`;

	// prettier-ignore
	export const ORIENTATION_CSS_CLASSES = [
		`${CLASS_PREFIX}${CoreTypes.DeviceOrientation.portrait}`,
		`${CLASS_PREFIX}${CoreTypes.DeviceOrientation.landscape}`,
		`${CLASS_PREFIX}${CoreTypes.DeviceOrientation.unknown}`,
	];

	// prettier-ignore
	export const SYSTEM_APPEARANCE_CSS_CLASSES = [
		`${CLASS_PREFIX}${CoreTypes.SystemAppearance.light}`,
		`${CLASS_PREFIX}${CoreTypes.SystemAppearance.dark}`,
	];

	// prettier-ignore
	export const LAYOUT_DIRECTION_CSS_CLASSES = [
		`${CLASS_PREFIX}${CoreTypes.LayoutDirection.ltr}`,
		`${CLASS_PREFIX}${CoreTypes.LayoutDirection.rtl}`,
	];

	/**
	 * Classes describing the state of a single window. Two windows can legitimately
	 * disagree on all of them, so they live on each window's root view (and the modals
	 * presented over it) rather than in the process-wide system class list.
	 */
	export const WINDOW_SCOPED_CSS_CLASSES = [...ORIENTATION_CSS_CLASSES, ...SYSTEM_APPEARANCE_CSS_CLASSES, ...LAYOUT_DIRECTION_CSS_CLASSES];

	export function getSystemCssClasses(): string[] {
		return cssClasses;
	}

	export function pushToSystemCssClasses(value: string): number {
		const index = cssClasses.indexOf(value);
		if (index == -1) {
			cssClasses.push(value);
		}

		return cssClasses.length;
	}

	export function removeSystemCssClass(value: string): string {
		const index = cssClasses.indexOf(value);
		let removedElement;

		if (index > -1) {
			removedElement = cssClasses.splice(index, 1);
		}

		return removedElement;
	}

	export function getModalRootViewCssClass(): string {
		return MODAL_ROOT_VIEW_CSS_CLASS;
	}

	export function getRootViewCssClasses(): string[] {
		return [ROOT_VIEW_CSS_CLASS, ...cssClasses];
	}

	export function pushToRootViewCssClasses(value: string): number {
		return pushToSystemCssClasses(value) + 1; // because of ROOT_VIEW_CSS_CLASS
	}

	export function removeFromRootViewCssClasses(value: string): string {
		return removeSystemCssClass(value);
	}
}
