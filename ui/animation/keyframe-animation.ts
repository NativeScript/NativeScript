import definition = require("ui/animation/keyframe-animation");
import view = require("ui/core/view");
import observable = require("ui/core/dependency-observable");
import enums = require("ui/enums");

export class KeyframeDeclaration implements definition.KeyframeDeclaration {
    public property: string;
    public value: any;
}

export class KeyframeInfo implements definition.KeyframeInfo {
    public duration: number;
    public curve: any;
    public declarations: Array<KeyframeDeclaration>;
}

export class KeyframeAnimationInfo implements definition.KeyframeAnimationInfo {
    public name: string = "";
    public duration: number = 0.3;
    public delay: number = 0;
    public iterations: number = 1;
    public curve: any = enums.AnimationCurve.easeInOut;
    public isForwards: boolean = false;
    public isReverse: boolean = false;
    public keyframes: Array<KeyframeInfo>;
}

export class KeyframeAnimation {
    public animations: Array<Object>;
    public delay: number = 0;
    public iterations: number = 1;

    private _resolve;
    private _reject;
    private _isPlaying: boolean;

    public static keyframeAnimationFromInfo(info: KeyframeAnimationInfo) {
        let animations = new Array<Object>();
        let length = info.keyframes.length;
        let startDuration = 0;
        if (info.isReverse) {
            for (let index = length - 1; index >= 0; index --) {
                let keyframe = info.keyframes[index];
                startDuration = KeyframeAnimation.parseKeyframe(info, keyframe, animations, startDuration);
            }
        }
        else {
            for (let index = 0; index < length; index ++) {
                let keyframe = info.keyframes[index];
                startDuration = KeyframeAnimation.parseKeyframe(info, keyframe, animations, startDuration);
            }
            for (let index = length - 1; index > 0; index --) {
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
        if (animations.length > 0) {
            animations[0]["duration"] = 0.001;
        }
        let animation: KeyframeAnimation = new KeyframeAnimation();
        animation.delay = info.delay;
        animation.iterations = info.iterations;
        animation.animations = animations;
        return animation;
    }

    private static parseKeyframe(info: KeyframeAnimationInfo, keyframe: KeyframeInfo, animations: Array<Object>, startDuration: number): number {
        let animation = {};
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
        animation["duration"] = info.isReverse ? info.duration - duration : duration;
        animation["valueSource"] = observable.ValueSource.Css;
        animation["curve"] = keyframe.curve;
        animations.push(animation);
        return startDuration;
    }

    public get isPlaying(): boolean {
        return this._isPlaying;
    }

    public play(view: view.View): Promise<void> {
        if (this._isPlaying) {
            throw new Error("Animation is already playing.");
        }

        let animationFinishedPromise = new Promise<void>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });

        this._isPlaying = true;

        if (this.delay !== 0) {
            let that = this;
            setTimeout(function (){ that.animate(view, 0, that.iterations); }, that.delay, that);
        }
        else {
            this.animate(view, 0, this.iterations);
        }

        return animationFinishedPromise;
    }

    private animate(view: view.View, index: number, iterations: number) {
        if (index < 0 || index >= this.animations.length) {
            iterations -= 1;
            if (iterations > 0) {
                this.animate(view, 0, iterations);
            }
            this._resolveAnimationFinishedPromise();
        }
        else {
            view.animate(this.animations[index]).then(() => {
                this.animate(view, index + 1, iterations);
            });
        }
    }

    public _resolveAnimationFinishedPromise() {
        this._isPlaying = false;
        this._resolve();
    }

    public _rejectAnimationFinishedPromise() {
        this._isPlaying = false;
        this._reject(new Error("Animation cancelled."));
    }
}
