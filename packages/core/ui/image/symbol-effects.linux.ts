import { ImageSymbolEffectCommon } from './symbol-effects-common';
export { ImageSymbolEffects } from './symbol-effects-common';

export class ImageSymbolEffect extends ImageSymbolEffectCommon {
	static fromSymbol(symbol: string) {
		return new ImageSymbolEffect();
	}
}
