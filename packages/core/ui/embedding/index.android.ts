import type { View } from '../core/view';

declare namespace org {
	namespace nativescript {
		class Bootstrap {
			static isEmbeddedNativeScript: boolean;
		}
	}
}

export function isEmbedded(): boolean {
	return org.nativescript?.Bootstrap?.isEmbeddedNativeScript;
}

let embeddedView: View | undefined;

export function setEmbeddedView(view: View | undefined): void {
	embeddedView = view;
}

export function getEmbeddedView(): View {
	if (!embeddedView) {
		throw new Error("{N} Core: Fragment content view not set or set to 'undefined'");
	}
	return embeddedView;
}
