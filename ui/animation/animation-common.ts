import definition = require("ui/animation");
import viewModule = require("ui/core/view");
import * as traceModule from "trace";

var trace: typeof traceModule;
function ensureTrace() {
    if (!trace) {
        trace = require("trace");
    }
}

export module Properties {
    export var opacity = "opacity";
    export var backgroundColor = "backgroundColor";
    export var translate = "translate";
    export var rotate = "rotate";
    export var scale = "scale";
}

export interface PropertyAnimation {
    target: viewModule.View;
    property: string;
    value: any;
    duration?: number;
    delay?: number;
    iterations?: number;
    curve?: any;
}

export class CubicBezierAnimationCurve implements definition.CubicBezierAnimationCurve {

    public x1: number;
    public y1: number;
    public x2: number;
    public y2: number;

    constructor(x1: number, y1: number, x2: number, y2: number) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
}

export class Animation implements definition.Animation {
    public _propertyAnimations: Array<PropertyAnimation>;
    public _playSequentially: boolean;
    private _isPlaying: boolean;
    private _resolve;
    private _reject;

    public play(): Promise<void> {
        if (this.isPlaying) {
            throw new Error("Animation is already playing.");
        }

        var animationFinishedPromise = new Promise<void>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });

        this._isPlaying = true;
        return animationFinishedPromise;
    }

    public cancel(): void {
        if (!this.isPlaying) {
            throw new Error("Animation is not currently playing.");
        }
    }

    public get isPlaying(): boolean {
        return this._isPlaying;
    }

    constructor(animationDefinitions: Array<definition.AnimationDefinition>, playSequentially?: boolean) {
        if (!animationDefinitions || animationDefinitions.length === 0) {
            throw new Error("No animation definitions specified");
        }

        ensureTrace();

        trace.write("Analyzing " + animationDefinitions.length + " animation definitions...", trace.categories.Animation);
        this._propertyAnimations = new Array<PropertyAnimation>();
        var i = 0;
        var length = animationDefinitions.length;
        for (; i < length; i++) {
            animationDefinitions[i].curve = definition._resolveAnimationCurve(animationDefinitions[i].curve);
            this._propertyAnimations = this._propertyAnimations.concat(Animation._createPropertyAnimations(animationDefinitions[i]));
        }

        if (this._propertyAnimations.length === 0) {
            throw new Error("Nothing to animate.");
        }
        trace.write("Created " + this._propertyAnimations.length + " individual property animations.", trace.categories.Animation);

        this._playSequentially = playSequentially;
    }

    public _resolveAnimationFinishedPromise() {
        this._isPlaying = false;
        this._resolve();
    }

    public _rejectAnimationFinishedPromise() {
        this._isPlaying = false;
        this._reject(new Error("Animation cancelled."));
    }

    private static _createPropertyAnimations(animationDefinition: definition.AnimationDefinition): Array<PropertyAnimation>  {
        if (!animationDefinition.target) {
            throw new Error("No animation target specified.");
        }

        var propertyAnimations = new Array<PropertyAnimation>();

        // opacity
        if (animationDefinition.opacity !== undefined) {
            propertyAnimations.push({
                target: animationDefinition.target,
                property: Properties.opacity,
                value: animationDefinition.opacity,
                duration: animationDefinition.duration,
                delay: animationDefinition.delay,
                iterations: animationDefinition.iterations,
                curve: animationDefinition.curve
            });
        }

        // backgroundColor
        if (animationDefinition.backgroundColor !== undefined) {
            propertyAnimations.push({
                target: animationDefinition.target,
                property: Properties.backgroundColor,
                value: animationDefinition.backgroundColor,
                duration: animationDefinition.duration,
                delay: animationDefinition.delay,
                iterations: animationDefinition.iterations,
                curve: animationDefinition.curve
            });
        }

        // translate
        if (animationDefinition.translate !== undefined) {
            propertyAnimations.push({
                target: animationDefinition.target,
                property: Properties.translate,
                value: animationDefinition.translate,
                duration: animationDefinition.duration,
                delay: animationDefinition.delay,
                iterations: animationDefinition.iterations,
                curve: animationDefinition.curve
            });
        }

        // scale
        if (animationDefinition.scale !== undefined) {
            propertyAnimations.push({
                target: animationDefinition.target,
                property: Properties.scale,
                value: animationDefinition.scale,
                duration: animationDefinition.duration,
                delay: animationDefinition.delay,
                iterations: animationDefinition.iterations,
                curve: animationDefinition.curve
            });
        }

        // rotate
        if (animationDefinition.rotate !== undefined) {
            propertyAnimations.push({
                target: animationDefinition.target,
                property: Properties.rotate,
                value: animationDefinition.rotate,
                duration: animationDefinition.duration,
                delay: animationDefinition.delay,
                iterations: animationDefinition.iterations,
                curve: animationDefinition.curve
            });
        }

        if (propertyAnimations.length === 0) {
            throw new Error("No animation property specified.");
        }

        return propertyAnimations;
    }

    public static _getAnimationInfo(animation: PropertyAnimation): string {
        return JSON.stringify({
            target: animation.target.id,
            property: animation.property,
            value: animation.value,
            duration: animation.duration,
            delay: animation.delay,
            iterations: animation.iterations,
            curve: animation.curve
        });
    }
}
