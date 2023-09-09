
declare class NSSymbolAppearEffect extends NSSymbolEffect {

	static alloc(): NSSymbolAppearEffect; // inherited from NSObject

	static appearDownEffect(): NSSymbolAppearEffect;

	static appearUpEffect(): NSSymbolAppearEffect;

	static effect(): NSSymbolAppearEffect;

	static new(): NSSymbolAppearEffect; // inherited from NSObject

	effectWithByLayer(): this;

	effectWithWholeSymbol(): this;
}

declare class NSSymbolAutomaticContentTransition extends NSSymbolContentTransition {

	static alloc(): NSSymbolAutomaticContentTransition; // inherited from NSObject

	static new(): NSSymbolAutomaticContentTransition; // inherited from NSObject

	static transition(): NSSymbolAutomaticContentTransition;
}

declare class NSSymbolBounceEffect extends NSSymbolEffect {

	static alloc(): NSSymbolBounceEffect; // inherited from NSObject

	static bounceDownEffect(): NSSymbolBounceEffect;

	static bounceUpEffect(): NSSymbolBounceEffect;

	static effect(): NSSymbolBounceEffect;

	static new(): NSSymbolBounceEffect; // inherited from NSObject

	effectWithByLayer(): this;

	effectWithWholeSymbol(): this;
}

declare class NSSymbolContentTransition extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSSymbolContentTransition; // inherited from NSObject

	static new(): NSSymbolContentTransition; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class NSSymbolDisappearEffect extends NSSymbolEffect {

	static alloc(): NSSymbolDisappearEffect; // inherited from NSObject

	static disappearDownEffect(): NSSymbolDisappearEffect;

	static disappearUpEffect(): NSSymbolDisappearEffect;

	static effect(): NSSymbolDisappearEffect;

	static new(): NSSymbolDisappearEffect; // inherited from NSObject

	effectWithByLayer(): this;

	effectWithWholeSymbol(): this;
}

declare class NSSymbolEffect extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSSymbolEffect; // inherited from NSObject

	static new(): NSSymbolEffect; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class NSSymbolEffectOptions extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSSymbolEffectOptions; // inherited from NSObject

	static new(): NSSymbolEffectOptions; // inherited from NSObject

	static options(): NSSymbolEffectOptions;

	static optionsWithNonRepeating(): NSSymbolEffectOptions;

	static optionsWithRepeatCount(count: number): NSSymbolEffectOptions;

	static optionsWithRepeating(): NSSymbolEffectOptions;

	static optionsWithSpeed(speed: number): NSSymbolEffectOptions;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	optionsWithNonRepeating(): this;

	optionsWithRepeatCount(count: number): this;

	optionsWithRepeating(): this;

	optionsWithSpeed(speed: number): this;
}

declare class NSSymbolPulseEffect extends NSSymbolEffect {

	static alloc(): NSSymbolPulseEffect; // inherited from NSObject

	static effect(): NSSymbolPulseEffect;

	static new(): NSSymbolPulseEffect; // inherited from NSObject

	effectWithByLayer(): this;

	effectWithWholeSymbol(): this;
}

declare class NSSymbolReplaceContentTransition extends NSSymbolContentTransition {

	static alloc(): NSSymbolReplaceContentTransition; // inherited from NSObject

	static new(): NSSymbolReplaceContentTransition; // inherited from NSObject

	static replaceDownUpTransition(): NSSymbolReplaceContentTransition;

	static replaceOffUpTransition(): NSSymbolReplaceContentTransition;

	static replaceUpUpTransition(): NSSymbolReplaceContentTransition;

	static transition(): NSSymbolReplaceContentTransition;

	transitionWithByLayer(): this;

	transitionWithWholeSymbol(): this;
}

declare class NSSymbolScaleEffect extends NSSymbolEffect {

	static alloc(): NSSymbolScaleEffect; // inherited from NSObject

	static effect(): NSSymbolScaleEffect;

	static new(): NSSymbolScaleEffect; // inherited from NSObject

	static scaleDownEffect(): NSSymbolScaleEffect;

	static scaleUpEffect(): NSSymbolScaleEffect;

	effectWithByLayer(): this;

	effectWithWholeSymbol(): this;
}

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
