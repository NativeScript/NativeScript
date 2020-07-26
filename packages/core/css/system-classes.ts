const MODAL = 'modal';
const ROOT = 'root';
const cssClasses = [];

export namespace CSSUtils {
	export const CLASS_PREFIX = 'ns-';
	export const MODAL_ROOT_VIEW_CSS_CLASS = `${CLASS_PREFIX}${MODAL}`;
	export const ROOT_VIEW_CSS_CLASS = `${CLASS_PREFIX}${ROOT}`;

	export function getSystemCssClasses(): string[] {
		return cssClasses;
	}

	export function pushToSystemCssClasses(value: string): number {
		cssClasses.push(value);

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
