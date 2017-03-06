// Definitions.
import {
    KeyframeDeclaration as KeyframeDeclarationDefinition,
    KeyframeInfo as KeyframeInfoDefinition,
    KeyframeAnimationInfo as KeyframeAnimationInfoDefinition,
    KeyframeAnimation as KeyframeAnimationDefinition
} from "ui/animation/keyframe-animation";

import { View, Color } from "ui/core/view";

// Types.
import { unsetValue } from "ui/core/properties";
import { Animation } from "ui/animation";
import {
    backgroundColorProperty,
    scaleXProperty, scaleYProperty,
    translateXProperty, translateYProperty,
    rotateProperty, opacityProperty
} from "ui/styling/style-properties";

export class KeyframeDeclaration implements KeyframeDeclarationDefinition {
    public property: string;
    public value: any;
}

export class KeyframeInfo implements KeyframeInfoDefinition {
    public duration: number;
    public curve: any;
    public declarations: Array<KeyframeDeclaration>;
}

export class KeyframeAnimationInfo implements KeyframeAnimationInfoDefinition {
    public name: string = "";
    public duration: number = 0.3;
    public delay: number = 0;
    public iterations: number = 1;
    public curve: any = "ease";
    public isForwards: boolean = false;
    public isReverse: boolean = false;
    public keyframes: Array<KeyframeInfo>;
}

interface Keyframe {
    backgroundColor?: Color;
    scale?: { x: number, y: number };
    translate?: { x: number, y: number };
    rotate?: number;
    opacity?: number;
    valueSource?: "keyframe" | "animation";
    duration?: number;
    curve?: any;
    forceLayer?: boolean;
}

export class KeyframeAnimation implements KeyframeAnimationDefinition {
    public animations: Array<Keyframe>;
    public delay: number = 0;
    public iterations: number = 1;

    private _resolve;
    private _reject;
    private _isPlaying: boolean;
    private _isForwards: boolean;
    private _nativeAnimations: Array<Animation>;
    private _target: View;

    public static keyframeAnimationFromInfo(info: KeyframeAnimationInfo) {
        let animations = new Array<Keyframe>();
        let length = info.keyframes.length;
        let startDuration = 0;
        if (info.isReverse) {
            for (let index = length - 1; index >= 0; index--) {
                let keyframe = info.keyframes[index];
                startDuration = KeyframeAnimation.parseKeyframe(info, keyframe, animations, startDuration);
            }
        }
        else {
            for (let index = 0; index < length; index++) {
                let keyframe = info.keyframes[index];
                startDuration = KeyframeAnimation.parseKeyframe(info, keyframe, animations, startDuration);
            }
            for (let index = length - 1; index > 0; index--) {
                let a1 = animations[index];
                let a2 = animations[index - 1];
                if (a2["curve"] !== undefined) {
                    a1["curve"] = a2["curve"];
                    a2["curve"] = undefined;
                }
            }
        }
        for (let index = 1; index < length; index++) {
            let a = animations[index];
            if (a["curve"] === undefined) {
                a["curve"] = info.curve;
            }
        }
        let animation: KeyframeAnimation = new KeyframeAnimation();
        animation.delay = info.delay;
        animation.iterations = info.iterations;
        animation.animations = animations;
        animation._isForwards = info.isForwards;
        return animation;
    }

    private static parseKeyframe(info: KeyframeAnimationInfo, keyframe: KeyframeInfo, animations: Array<Object>, startDuration: number): number {
        let animation: Keyframe = {};
        for (let declaration of keyframe.declarations) {
            animation[declaration.property] = declaration.value;
        }
        let duration = keyframe.duration;
        if (duration === 0) {
            duration = 0.01;
        }
        else {
            duration = (info.duration * duration) - startDuration;
            startDuration += duration;
        }
        animation.duration = info.isReverse ? info.duration - duration : duration;
        animation.curve = keyframe.curve;
        animation.forceLayer = true;
        animation.valueSource = "keyframe";
        animations.push(animation);
        return startDuration;
    }

    public get isPlaying(): boolean {
        return this._isPlaying;
    }

    public cancel() {
        if (this._isPlaying) {
            this._isPlaying = false;
            for (let i = this._nativeAnimations.length - 1; i >= 0; i--) {
                let animation = this._nativeAnimations[i];
                if (animation.isPlaying) {
                    animation.cancel();
                }
            }
            if (this._nativeAnimations.length > 0) {
                let animation = this._nativeAnimations[0];
                this._resetAnimationValues(this._target, animation);
            }
            this._rejectAnimationFinishedPromise();
        }
    }

    public play(view: View): Promise<void> {
        if (this._isPlaying) {
            throw new Error("Animation is already playing.");
        }

        let animationFinishedPromise = new Promise<void>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });

        this._isPlaying = true;
        this._nativeAnimations = new Array<Animation>();
        this._target = view;

        if (this.delay !== 0) {
            setTimeout(() => this.animate(view, 0, this.iterations), this.delay);
        }
        else {
            this.animate(view, 0, this.iterations);
        }

        return animationFinishedPromise;
    }

    private animate(view: View, index: number, iterations: number) {
        if (!this._isPlaying) {
            return;
        }
        if (index === 0) {
            let animation = this.animations[0];

            if ("backgroundColor" in animation) {
                view.style[backgroundColorProperty.keyframe] = animation.backgroundColor;
            }
            if ("scale" in animation) {
                view.style[scaleXProperty.keyframe] = animation.scale.x;
                view.style[scaleYProperty.keyframe] = animation.scale.y;
            }
            if ("translate" in animation) {
                view.style[translateXProperty.keyframe] = animation.translate.x;
                view.style[translateYProperty.keyframe] = animation.translate.y;
            }
            if ("rotate" in animation) {
                view.style[rotateProperty.keyframe] = animation.rotate;
            }
            if ("opacity" in animation) {
                view.style[opacityProperty.keyframe] = animation.opacity;
            }

            setTimeout(() => this.animate(view, 1, iterations), 1);
        }
        else if (index < 0 || index >= this.animations.length) {
            iterations -= 1;
            if (iterations > 0) {
                this.animate(view, 0, iterations);
            }
            else {
                if (this._isForwards === false) {
                    let animation = this.animations[this.animations.length - 1];
                    this._resetAnimationValues(view, animation);
                }
                this._resolveAnimationFinishedPromise();
            }
        }
        else {
            let animationDef = this.animations[index];
            (<any>animationDef).target = view;
            let animation = new Animation([animationDef]);
            animation.play().then(() => {
                this.animate(view, index + 1, iterations);
            });
            this._nativeAnimations.push(animation);
        }
    }

    public _resolveAnimationFinishedPromise() {
        this._nativeAnimations = new Array<Animation>();
        this._isPlaying = false;
        this._target = null;
        this._resolve();
    }

    public _rejectAnimationFinishedPromise() {
        this._nativeAnimations = new Array<Animation>();
        this._isPlaying = false;
        this._target = null;
        this._reject(new Error("Animation cancelled."));
    }

    private _resetAnimationValues(view: View, animation: Object) {
        if ("backgroundColor" in animation) {
            view.style[backgroundColorProperty.keyframe] = unsetValue;
        }
        if ("scale" in animation) {
            view.style[scaleXProperty.keyframe] = unsetValue;
            view.style[scaleYProperty.keyframe] = unsetValue;
        }
        if ("translate" in animation) {
            view.style[translateXProperty.keyframe] = unsetValue;
            view.style[translateYProperty.keyframe] = unsetValue;
        }
        if ("rotate" in animation) {
            view.style[rotateProperty.keyframe] = unsetValue;
        }
        if ("opacity" in animation) {
            view.style[opacityProperty.keyframe] = unsetValue;
        }
    }
}