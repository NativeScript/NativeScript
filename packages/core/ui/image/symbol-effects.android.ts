import { ImageSymbolEffectCommon, ImageSymbolEffects } from './symbol-effects-common';
import type { ImageSymbolEffect as ImageSymbolEffectDefinition } from './symbol-effects.d.ts';
export { ImageSymbolEffects };

export const ImageSymbolEffect: typeof ImageSymbolEffectDefinition = class ImageSymbolEffect extends ImageSymbolEffectCommon implements ImageSymbolEffectDefinition {
	static fromSymbol(symbol: string): ImageSymbolEffectDefinition {
		return new ImageSymbolEffect();
	}
};
