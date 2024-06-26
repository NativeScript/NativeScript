export enum ImageSymbolEffects {
	Appear = 'appear',
	Bounce = 'bounce',
	Disappear = 'disappear',
	Pulse = 'pulse',
	Scale = 'scale',
	VariableColor = 'variableColor',
	Breathe = 'breathe',
	Rotate = 'rotate',
	Wiggle = 'wiggle',
}

export class ImageSymbolEffectCommon {
	effect?: NSSymbolEffect;
	options?: NSSymbolEffectOptions;
	completion?: (context: UISymbolEffectCompletionContext) => void;
}
