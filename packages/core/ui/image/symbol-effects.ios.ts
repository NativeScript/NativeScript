import { SDK_VERSION } from '../../utils/constants';
import { ImageSymbolEffectCommon, ImageSymbolEffects } from './symbol-effects-common';
export { ImageSymbolEffects } from './symbol-effects-common';

export class ImageSymbolEffect extends ImageSymbolEffectCommon {
	constructor(symbol: NSSymbolEffect) {
		super();
		this.effect = symbol;
	}
	static fromSymbol(symbol: string): ImageSymbolEffect | null {
		if (SDK_VERSION < 17) {
			return null;
		}
		switch (symbol) {
			case ImageSymbolEffects.Appear:
				return new ImageSymbolEffect(NSSymbolAppearEffect.effect());
			case ImageSymbolEffects.AppearUp:
				return new ImageSymbolEffect(NSSymbolAppearEffect.appearUpEffect());
			case ImageSymbolEffects.AppearDown:
				return new ImageSymbolEffect(NSSymbolAppearEffect.appearDownEffect());
			case ImageSymbolEffects.Bounce:
				return new ImageSymbolEffect(NSSymbolBounceEffect.effect());
			case ImageSymbolEffects.BounceUp:
				return new ImageSymbolEffect(NSSymbolBounceEffect.bounceUpEffect());
			case ImageSymbolEffects.BounceDown:
				return new ImageSymbolEffect(NSSymbolBounceEffect.bounceDownEffect());
			case ImageSymbolEffects.Disappear:
				return new ImageSymbolEffect(NSSymbolDisappearEffect.effect());
			case ImageSymbolEffects.DisappearDown:
				return new ImageSymbolEffect(NSSymbolDisappearEffect.disappearDownEffect());
			case ImageSymbolEffects.DisappearUp:
				return new ImageSymbolEffect(NSSymbolDisappearEffect.disappearUpEffect());
			case ImageSymbolEffects.Pulse:
				return new ImageSymbolEffect(NSSymbolPulseEffect.effect());
			case ImageSymbolEffects.Scale:
				return new ImageSymbolEffect(NSSymbolScaleEffect.effect());
			case ImageSymbolEffects.ScaleDown:
				return new ImageSymbolEffect(NSSymbolScaleEffect.scaleDownEffect());
			case ImageSymbolEffects.ScaleUp:
				return new ImageSymbolEffect(NSSymbolScaleEffect.scaleUpEffect());
			case ImageSymbolEffects.VariableColor:
				return new ImageSymbolEffect(NSSymbolVariableColorEffect.effect());
		}
		if (SDK_VERSION < 18) {
			return null;
		}
		switch (symbol) {
			case ImageSymbolEffects.Breathe:
				return new ImageSymbolEffect(NSSymbolBreatheEffect.effect());
			case ImageSymbolEffects.BreathePlain:
				return new ImageSymbolEffect(NSSymbolBreatheEffect.breathePlainEffect());
			case ImageSymbolEffects.Rotate:
				return new ImageSymbolEffect(NSSymbolRotateEffect.effect());
			case ImageSymbolEffects.RotateClockwise:
				return new ImageSymbolEffect(NSSymbolRotateEffect.rotateClockwiseEffect());
			case ImageSymbolEffects.RotateCounterClockwise:
				return new ImageSymbolEffect(NSSymbolRotateEffect.rotateCounterClockwiseEffect());
			case ImageSymbolEffects.Wiggle:
				return new ImageSymbolEffect(NSSymbolWiggleEffect.effect());
			case ImageSymbolEffects.WiggleBackward:
				return new ImageSymbolEffect(NSSymbolWiggleEffect.wiggleBackwardEffect());
			case ImageSymbolEffects.WiggleClockwise:
				return new ImageSymbolEffect(NSSymbolWiggleEffect.wiggleClockwiseEffect());
			case ImageSymbolEffects.WiggleCounterClockwise:
				return new ImageSymbolEffect(NSSymbolWiggleEffect.wiggleCounterClockwiseEffect());
			case ImageSymbolEffects.WiggleDown:
				return new ImageSymbolEffect(NSSymbolWiggleEffect.wiggleDownEffect());
			case ImageSymbolEffects.WiggleForward:
				return new ImageSymbolEffect(NSSymbolWiggleEffect.wiggleForwardEffect());
			case ImageSymbolEffects.WiggleUp:
				return new ImageSymbolEffect(NSSymbolWiggleEffect.wiggleUpEffect());
			case ImageSymbolEffects.WiggleLeft:
				return new ImageSymbolEffect(NSSymbolWiggleEffect.wiggleLeftEffect());
			case ImageSymbolEffects.WiggleRight:
				return new ImageSymbolEffect(NSSymbolWiggleEffect.wiggleRightEffect());
		}

		return null;
	}
}
