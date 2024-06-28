export enum ImageSymbolEffects {
	Appear = 'appear',
	AppearUp = 'appearUp',
	AppearDown = 'appearDown',
	Bounce = 'bounce',
	BounceUp = 'bounceUp',
	BounceDown = 'bounceDown',
	Disappear = 'disappear',
	DisappearDown = 'disappearDown',
	DisappearUp = 'disappearUp',
	Pulse = 'pulse',
	Scale = 'scale',
	ScaleDown = 'scaleDown',
	ScaleUp = 'scaleUp',
	VariableColor = 'variableColor',
	Breathe = 'breathe',
	BreathePlain = 'breathePlain',
	BreathePulse = 'breathePulse',
	Rotate = 'rotate',
	RotateClockwise = 'rotateClockwise',
	RotateCounterClockwise = 'rotateCounterClockwise',
	Wiggle = 'wiggle',
	WiggleBackward = 'wiggleBackward',
	WiggleClockwise = 'wiggleClockwise',
	WiggleCounterClockwise = 'wiggleCounterClockwise',
	WiggleDown = 'wiggleDown',
	WiggleForward = 'wiggleForward',
	WiggleUp = 'wiggleUp',
	WiggleLeft = 'wiggleLeft',
	WiggleRight = 'wiggleRight',
}

export class ImageSymbolEffectCommon {
	effect?: NSSymbolEffect;
	options?: NSSymbolEffectOptions;
	completion?: (context: UISymbolEffectCompletionContext) => void;
}
