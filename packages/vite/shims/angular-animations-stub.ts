// Angular animations stub for NativeScript HMR development.
// Export minimal shims so the Angular ecosystem can import the usual tokens
// without bundling or executing the browser animation runtime.

export const ANIMATION_MODULE_TYPE = 'NoopAnimations';

class NoopAnimationPlayer {
	onDone(cb?: () => void) {
		cb?.();
	}
	onStart(cb?: () => void) {
		cb?.();
	}
	play() {}
	pause() {}
	reset() {}
	restart() {}
	finish() {}
	destroy() {}
	setPosition(_value: number) {}
	getPosition() {
		return 0;
	}
	init() {}
}

class NoopAnimationFactory {
	create() {
		return new NoopAnimationPlayer();
	}
}

export class AnimationBuilder {
	build() {
		return new NoopAnimationFactory();
	}
}

export class BrowserAnimationBuilder extends AnimationBuilder {}
export const ɵBrowserAnimationBuilder = BrowserAnimationBuilder;

export class AnimationDriver {
	validateStyleProperty() {
		return true;
	}
	matchesElement() {
		return false;
	}
	containsElement() {
		return false;
	}
	query() {
		return [];
	}
	computeStyle() {
		return {} as Record<string, unknown>;
	}
	animate() {
		return new NoopAnimationPlayer();
	}
}

export class ɵAnimationStyleNormalizer {
	normalizePropertyName(name: string) {
		return name;
	}
	normalizeStyleValue(_propertyName: string, value: string | number) {
		return value;
	}
}

export class ɵWebAnimationsStyleNormalizer extends ɵAnimationStyleNormalizer {}

export class ɵAnimationEngine {
	constructor(
		private readonly doc?: unknown,
		private readonly driver?: AnimationDriver,
		private readonly normalizer?: ɵAnimationStyleNormalizer,
	) {}
	onInsert() {}
	onRemove() {}
	registerTrigger() {}
	signalFlushRequired() {}
	flush() {}
	listen() {
		return () => {};
	}
	trigger() {
		return new NoopAnimationPlayer();
	}
}

export class ɵAnimationRendererFactory {
	constructor(
		private readonly delegate?: { createRenderer?: (hostElement: any, type: any) => any },
		private readonly engine?: ɵAnimationEngine,
		private readonly zone?: { runOutsideAngular?: (fn: () => void) => void },
	) {}
	createRenderer(hostElement: any, type: any) {
		if (this.delegate?.createRenderer) {
			return this.delegate.createRenderer(hostElement, type);
		}
		return {
			destroy() {},
			createElement() {
				return {};
			},
			createComment() {
				return {};
			},
			createText() {
				return '';
			},
			appendChild() {},
			insertBefore() {},
			removeChild() {},
			selectRootElement() {
				return hostElement;
			},
			parentNode() {
				return null;
			},
			nextSibling() {
				return null;
			},
			setAttribute() {},
			removeAttribute() {},
			addClass() {},
			removeClass() {},
			setStyle() {},
			removeStyle() {},
			setProperty() {},
			setValue() {},
			listen() {
				return () => {};
			},
		};
	}
}

export class BrowserAnimationsModule {}
export class NoopAnimationsModule {}

export function provideAnimations() {
	return [];
}

export default {};
