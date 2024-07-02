
/**
 * @since 17.0
 */
declare class NSSymbolAppearEffect extends NSSymbolEffect {

	static alloc(): NSSymbolAppearEffect; // inherited from NSObject

	static appearDownEffect(): NSSymbolAppearEffect;

	static appearUpEffect(): NSSymbolAppearEffect;

	static effect(): NSSymbolAppearEffect;

	static new(): NSSymbolAppearEffect; // inherited from NSObject

	effectWithByLayer(): this;

	effectWithWholeSymbol(): this;
}

/**
 * @since 17.0
 */
declare class NSSymbolAutomaticContentTransition extends NSSymbolContentTransition {

	static alloc(): NSSymbolAutomaticContentTransition; // inherited from NSObject

	static new(): NSSymbolAutomaticContentTransition; // inherited from NSObject

	static transition(): NSSymbolAutomaticContentTransition;
}

/**
 * @since 17.0
 */
declare class NSSymbolBounceEffect extends NSSymbolEffect {

	static alloc(): NSSymbolBounceEffect; // inherited from NSObject

	static bounceDownEffect(): NSSymbolBounceEffect;

	static bounceUpEffect(): NSSymbolBounceEffect;

	static effect(): NSSymbolBounceEffect;

	static new(): NSSymbolBounceEffect; // inherited from NSObject

	effectWithByLayer(): this;

	effectWithWholeSymbol(): this;
}

/**
 * @since 18.0
 */
declare class NSSymbolBreatheEffect extends NSSymbolEffect {

	static alloc(): NSSymbolBreatheEffect; // inherited from NSObject

	static breathePlainEffect(): NSSymbolBreatheEffect;

	static breathePulseEffect(): NSSymbolBreatheEffect;

	static effect(): NSSymbolBreatheEffect;

	static new(): NSSymbolBreatheEffect; // inherited from NSObject

	effectWithByLayer(): this;

	effectWithWholeSymbol(): this;
}

/**
 * @since 17.0
 */
declare class NSSymbolContentTransition extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSSymbolContentTransition; // inherited from NSObject

	static new(): NSSymbolContentTransition; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 17.0
 */
declare class NSSymbolDisappearEffect extends NSSymbolEffect {

	static alloc(): NSSymbolDisappearEffect; // inherited from NSObject

	static disappearDownEffect(): NSSymbolDisappearEffect;

	static disappearUpEffect(): NSSymbolDisappearEffect;

	static effect(): NSSymbolDisappearEffect;

	static new(): NSSymbolDisappearEffect; // inherited from NSObject

	effectWithByLayer(): this;

	effectWithWholeSymbol(): this;
}

/**
 * @since 17.0
 */
declare class NSSymbolEffect extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSSymbolEffect; // inherited from NSObject

	static new(): NSSymbolEffect; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 17.0
 */
declare class NSSymbolEffectOptions extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSSymbolEffectOptions; // inherited from NSObject

	static new(): NSSymbolEffectOptions; // inherited from NSObject

	static options(): NSSymbolEffectOptions;

	static optionsWithNonRepeating(): NSSymbolEffectOptions;

	/**
	 * @since 18.0
	 */
	static optionsWithRepeatBehavior(behavior: NSSymbolEffectOptionsRepeatBehavior): NSSymbolEffectOptions;

	/**
	 * @since 17.0
	 * @deprecated 100000
	 */
	static optionsWithRepeatCount(count: number): NSSymbolEffectOptions;

	/**
	 * @since 17.0
	 * @deprecated 100000
	 */
	static optionsWithRepeating(): NSSymbolEffectOptions;

	static optionsWithSpeed(speed: number): NSSymbolEffectOptions;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	optionsWithNonRepeating(): this;

	/**
	 * @since 18.0
	 */
	optionsWithRepeatBehavior(behavior: NSSymbolEffectOptionsRepeatBehavior): this;

	/**
	 * @since 17.0
	 * @deprecated 100000
	 */
	optionsWithRepeatCount(count: number): this;

	/**
	 * @since 17.0
	 * @deprecated 100000
	 */
	optionsWithRepeating(): this;

	optionsWithSpeed(speed: number): this;
}

/**
 * @since 18.0
 */
declare class NSSymbolEffectOptionsRepeatBehavior extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSSymbolEffectOptionsRepeatBehavior; // inherited from NSObject

	static behaviorContinuous(): NSSymbolEffectOptionsRepeatBehavior;

	static behaviorPeriodic(): NSSymbolEffectOptionsRepeatBehavior;

	static behaviorPeriodicWithCount(count: number): NSSymbolEffectOptionsRepeatBehavior;

	static behaviorPeriodicWithCountDelay(count: number, delay: number): NSSymbolEffectOptionsRepeatBehavior;

	static behaviorPeriodicWithDelay(delay: number): NSSymbolEffectOptionsRepeatBehavior;

	static new(): NSSymbolEffectOptionsRepeatBehavior; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 18.0
 */
declare class NSSymbolMagicReplaceContentTransition extends NSSymbolContentTransition {

	static alloc(): NSSymbolMagicReplaceContentTransition; // inherited from NSObject

	static new(): NSSymbolMagicReplaceContentTransition; // inherited from NSObject
}

/**
 * @since 17.0
 */
declare class NSSymbolPulseEffect extends NSSymbolEffect {

	static alloc(): NSSymbolPulseEffect; // inherited from NSObject

	static effect(): NSSymbolPulseEffect;

	static new(): NSSymbolPulseEffect; // inherited from NSObject

	effectWithByLayer(): this;

	effectWithWholeSymbol(): this;
}

/**
 * @since 17.0
 */
declare class NSSymbolReplaceContentTransition extends NSSymbolContentTransition {

	static alloc(): NSSymbolReplaceContentTransition; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	static magicTransitionWithFallback(fallback: NSSymbolReplaceContentTransition): NSSymbolMagicReplaceContentTransition;

	static new(): NSSymbolReplaceContentTransition; // inherited from NSObject

	static replaceDownUpTransition(): NSSymbolReplaceContentTransition;

	static replaceOffUpTransition(): NSSymbolReplaceContentTransition;

	static replaceUpUpTransition(): NSSymbolReplaceContentTransition;

	static transition(): NSSymbolReplaceContentTransition;

	transitionWithByLayer(): this;

	transitionWithWholeSymbol(): this;
}

/**
 * @since 18.0
 */
declare class NSSymbolRotateEffect extends NSSymbolEffect {

	static alloc(): NSSymbolRotateEffect; // inherited from NSObject

	static effect(): NSSymbolRotateEffect;

	static new(): NSSymbolRotateEffect; // inherited from NSObject

	static rotateClockwiseEffect(): NSSymbolRotateEffect;

	static rotateCounterClockwiseEffect(): NSSymbolRotateEffect;

	effectWithByLayer(): this;

	effectWithWholeSymbol(): this;
}

/**
 * @since 17.0
 */
declare class NSSymbolScaleEffect extends NSSymbolEffect {

	static alloc(): NSSymbolScaleEffect; // inherited from NSObject

	static effect(): NSSymbolScaleEffect;

	static new(): NSSymbolScaleEffect; // inherited from NSObject

	static scaleDownEffect(): NSSymbolScaleEffect;

	static scaleUpEffect(): NSSymbolScaleEffect;

	effectWithByLayer(): this;

	effectWithWholeSymbol(): this;
}

/**
 * @since 17.0
 */
declare class NSSymbolVariableColorEffect extends NSSymbolEffect {

	static alloc(): NSSymbolVariableColorEffect; // inherited from NSObject

	static effect(): NSSymbolVariableColorEffect;

	static new(): NSSymbolVariableColorEffect; // inherited from NSObject

	effectWithCumulative(): this;

	effectWithDimInactiveLayers(): this;

	effectWithHideInactiveLayers(): this;

	effectWithIterative(): this;

	effectWithNonReversing(): this;

	effectWithReversing(): this;
}

/**
 * @since 18.0
 */
declare class NSSymbolWiggleEffect extends NSSymbolEffect {

	static alloc(): NSSymbolWiggleEffect; // inherited from NSObject

	static effect(): NSSymbolWiggleEffect;

	static new(): NSSymbolWiggleEffect; // inherited from NSObject

	static wiggleBackwardEffect(): NSSymbolWiggleEffect;

	static wiggleClockwiseEffect(): NSSymbolWiggleEffect;

	static wiggleCounterClockwiseEffect(): NSSymbolWiggleEffect;

	static wiggleCustomAngleEffect(angle: number): NSSymbolWiggleEffect;

	static wiggleDownEffect(): NSSymbolWiggleEffect;

	static wiggleForwardEffect(): NSSymbolWiggleEffect;

	static wiggleLeftEffect(): NSSymbolWiggleEffect;

	static wiggleRightEffect(): NSSymbolWiggleEffect;

	static wiggleUpEffect(): NSSymbolWiggleEffect;

	effectWithByLayer(): this;

	effectWithWholeSymbol(): this;
}
