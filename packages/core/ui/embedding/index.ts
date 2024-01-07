import { View } from '../../ui/core/view';

declare namespace org {
	namespace nativescript {
		class Bootstrap {
			static isEmbeddedNativeScript: boolean;
		}
	}
}

export function embedded(): boolean {
	return org.nativescript.Bootstrap.isEmbeddedNativeScript;
}

let view: View | undefined;

export function setContentView(contentView: View | undefined): void {
	view = contentView;
}

export function getContentView(): View {
	if (!view) {
		throw new Error("{N} Core: Fragment content view not set or set to 'undefined'");
	}
	return view;
}
