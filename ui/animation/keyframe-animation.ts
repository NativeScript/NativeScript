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
        let animations = new Array();
        let length = info.keyframes.length;
        let startDuration = 0;
        for (let index = info.isReverse ? length - 1 : 0; info.isReverse ? index >= 0 : index < info.keyframes.length; info.isReverse ? index-- : index++) {
            let keyframe = info.keyframes[index];
            let animation = {};
            animation["curve"] = info.curve;
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
            animations.push(animation);
        }
        //animations[animations.length - 1]["valueSource"] = observable.ValueSource.Css;
        animations[0].duration = 0.01;

        let animation: KeyframeAnimation = new KeyframeAnimation();
        animation.delay = info.delay;
        animation.iterations = info.iterations;
        animation.animations = animations;
        return animation;
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
