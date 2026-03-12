export { ImageSymbolEffects } from './symbol-effects-common';

/**
 * iOS only
 * Symbol effects: https://developer.apple.com/documentation/symbols?language=objc
 */
export class ImageSymbolEffect {
	effect?: NSSymbolEffect;
	options?: NSSymbolEffectOptions;
	completion?: (context: UISymbolEffectCompletionContext) => void;
	constructor(symbol: NSSymbolEffect);
	static fromSymbol(symbol: string): ImageSymbolEffect | null;
}
