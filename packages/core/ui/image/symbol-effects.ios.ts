import { SDK_VERSION } from '../../utils/constants';
import { ImageSymbolEffectCommon, ImageSymbolEffects } from './symbol-effects-common';
import type { ImageSymbolEffect as ImageSymbolEffectDefinition } from './symbol-effects.d.ts';

export const ImageSymbolEffect: typeof ImageSymbolEffectDefinition = class ImageSymbolEffect extends ImageSymbolEffectCommon implements ImageSymbolEffectDefinition {
	constructor(symbol: NSSymbolEffect) {
		super();
		this.effect = symbol;
	}
	static fromSymbol(symbol: string): ImageSymbolEffectDefinition | null {
		if (SDK_VERSION < 17) {
			return null;
		}
		switch (symbol) {
			case ImageSymbolEffects.Appear:
				return new ImageSymbolEffect(NSSymbolAppearEffect.new());
			case ImageSymbolEffects.Bounce:
				return new ImageSymbolEffect(NSSymbolBounceEffect.new());
			case ImageSymbolEffects.Disappear:
				return new ImageSymbolEffect(NSSymbolDisappearEffect.new());
			case ImageSymbolEffects.Pulse:
				return new ImageSymbolEffect(NSSymbolPulseEffect.new());
			case ImageSymbolEffects.Scale:
				return new ImageSymbolEffect(NSSymbolScaleEffect.new());
			case ImageSymbolEffects.VariableColor:
				return new ImageSymbolEffect(NSSymbolVariableColorEffect.new());
		}
		if (SDK_VERSION < 18) {
			return null;
		}
		// TODO: remove ts-expect-error once we bump the types package
		switch (symbol) {
			case ImageSymbolEffects.Breathe:
				// @ts-expect-error added on iOS 18
				return new ImageSymbolEffect(NSSymbolBreatheEffect.new());
			case ImageSymbolEffects.Rotate:
				// @ts-expect-error added on iOS 18
				return new ImageSymbolEffect(NSSymbolRotateEffect.new());
			case ImageSymbolEffects.Wiggle:
				// @ts-expect-error added on iOS 18
				return new ImageSymbolEffect(NSSymbolWiggleEffect.new());
		}

		return null;
	}
};
