import definition = require("./animationgroup");
import cssParser = require("css");
import converters = require("../styling/converters");
import colorModule = require("color");
import * as styleProperty from "ui/styling/style-property";
import animationModule = require("ui/animation");
import observable = require("ui/core/dependency-observable");
import view = require("ui/core/view");

interface TransformInfo {
    scale: animationModule.Pair;
    translate: animationModule.Pair;
}

export class KeyframeDeclaration implements definition.KeyframeDeclaration {
    public property: string;
    public value: any;
}

export class Keyframe implements definition.Keyframe {
    public duration: number;
    public declarations: Array<KeyframeDeclaration>;
}

export class AnimationGroup implements definition.AnimationGroup {

    public name: string;
    public duration: number;
    public delay: number;
    public iterations: number;
    public curve: any;
    public isForwards: boolean;
    public isReverse: boolean;
    public keyframes: Array<Keyframe>;

    private _resolve;
    private _reject;
    private _isPlaying: boolean;

    public AnimationGroup() {
        this.duration = 0.3;
        this.delay = 0;
        this.iterations = 1;
        this.isForwards = false;
        this.isReverse = false;
    }

    public static animationGroupFromSelectorDeclarations(declarations: cssParser.Declaration[]): AnimationGroup {
        let animationInfo = undefined;
        for (let declaration of declarations) {
            if (declaration.property.indexOf("animation") === 0) {
                if (animationInfo === undefined) {
                    animationInfo = new AnimationGroup();
                }
                switch (declaration.property) {
                    case "animation-name":
                        animationInfo.name = declaration.value;
                        break;
                    case "animation-duration":
                        animationInfo.duration = converters.timeConverter(declaration.value);
                        break;
                    case "animation-delay":
                        animationInfo.delay = converters.timeConverter(declaration.value);
                        break;
                    case "animation-timing-function":
                        animationInfo.curve = converters.animationTimingFunctionConverter(declaration.value);
                        break;
                    case "animation-iteration-count":
                        if (declaration.value === "infinite") {
                            animationInfo.iterations = Number.MAX_VALUE;
                        }
                        else {
                            animationInfo.iterations = converters.numberConverter(declaration.value);
                        }
                        break;
                    case "animation":
                        animationInfo = converters.animationConverter(declaration.value);
                        break;
                    case "animation-direction":
                        if (declaration.value === "reverse") {
                            animationInfo.isReverse = true;
                        }
                        break;
                    case "animation-fill-mode":
                        if (declaration.value === "forwards") {
                            animationInfo.isForwards = true;
                        }
                        break;
                }
            }
        }
        return animationInfo;
    }

    public static keyframesFromCSS(cssKeyframes: Object): Array<Keyframe> {
        let parsedKeyframes = new Array<Keyframe>();
        for (let keyframe of (<any>cssKeyframes).keyframes) {
            let declarations = AnimationGroup.parseKeyframeDeclarations(keyframe);
            for (let time of keyframe.values) {
                if (time === "from") {
                    time = 0;
                }
                if (time === "to") {
                    time = 1;
                }
                else {
                    time = parseFloat(time) / 100;
                    if (time < 0) {
                        time = 0;
                    }
                    if (time > 100) {
                        time = 100;
                    }
                }
                let current = parsedKeyframes[time];
                if (current === undefined) {
                    current = new Keyframe();
                    current.duration = time;
                    parsedKeyframes[time] = current;
                }
                current.declarations = declarations;
            }
        }
        let array = new Array();
        for (let parsedKeyframe in parsedKeyframes) {
            array.push(parsedKeyframes[parsedKeyframe]);
        }
        array.sort(function (a, b) { return a.duration - b.duration; });
        return array;
    }

    private static parseKeyframeDeclarations(keyframe: Object): Array<KeyframeDeclaration> {
        let declarations = {};
        let transforms = { scale: undefined, translate: undefined };
        for (let declaration of (<any>keyframe).declarations) {
            let property = styleProperty.getPropertyByCssName(declaration.property);
            if (property) {
                let val = declaration.value;
                if (property.name === "opacity") {
                    val = parseFloat(val);
                }
                else if (property.name === "backgroundColor") {
                    val = new colorModule.Color(val);
                }
                declarations[property.name] = val;
            }
            else {
                let pairs = styleProperty.getShorthandPairs(declaration.property, declaration.value);
                if (pairs) {
                    for (let j = 0; j < pairs.length; j++) {
                        let pair = pairs[j];
                        if (!this.preprocessAnimationValues(pair, transforms)) {
                            declarations[pair.property.name] = pair.value;
                        }
                    }
                }
            }
        }
        if (transforms.scale !== undefined) {
            declarations["scale"] = transforms.scale;
        }
        if (transforms.translate !== undefined) {
            declarations["translate"] = transforms.translate;
        }
        let array = new Array<KeyframeDeclaration>();
        for (let declaration in declarations) {
            let keyframeDeclaration = new KeyframeDeclaration();
            keyframeDeclaration.property = declaration;
            keyframeDeclaration.value = declarations[declaration];
            array.push(keyframeDeclaration);
        }
        return array;
    }

    private static preprocessAnimationValues(pair: styleProperty.KeyValuePair<styleProperty.Property, any>, transforms: TransformInfo) {
        if (pair.property.name === "scaleX") {
            if (transforms.scale === undefined) {
                transforms.scale = { x: 1, y: 1 };
            }
            transforms.scale.x = pair.value;
            return true;
        }
        if (pair.property.name === "scaleY") {
            if (transforms.scale === undefined) {
                transforms.scale = { x: 1, y: 1 };
            }
            transforms.scale.y = pair.value;
            return true;
        }
        if (pair.property.name === "translateX") {
            if (transforms.translate === undefined) {
                transforms.translate = { x: 0, y: 0 };
            }
            transforms.translate.x = pair.value;
            return true;
        }
        if (pair.property.name === "translateY") {
            if (transforms.translate === undefined) {
                transforms.translate = { x: 0, y: 0 };
            }
            transforms.translate.y = pair.value;
            return true;
        }
        return false;
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

        let animations = this.buildAnimationsFromKeyframes();
        if (this.delay !== 0) {
            let that = this;
            setTimeout(function (){ that.animate(animations, 0, view, that.iterations); }, that.delay, that);
        }
        else {
            this.animate(animations, 0, view, this.iterations);
        }

        return animationFinishedPromise;
    }

    private buildAnimationsFromKeyframes(): Array<Object> {
        let animations = new Array();
        let length = this.keyframes.length;
        let startDuration = 0;
        for (let index = this.isReverse ? length - 1 : 0; this.isReverse ? index >= 0 : index < this.keyframes.length; this.isReverse ? index-- : index++) {
            let keyframe = this.keyframes[index];
            let animation = {};
            animation["curve"] = this.curve;
            for (let declaration of keyframe.declarations) {
                animation[declaration.property] = declaration.value;
            }
            let duration = keyframe.duration;
            if (duration === 0) {
                duration = 0.01;
            }
            else {
                duration = (this.duration * duration) - startDuration;
                startDuration += duration;
            }
            animation["duration"] = this.isReverse ? this.duration - duration : duration;
            animation["valueSource"] = observable.ValueSource.Css;
            animations.push(animation);
        }
        //animations[animations.length - 1]["valueSource"] = observable.ValueSource.Css;
        animations[0].duration = 0.01;
        return animations;
    }

    private animate(animations: Array<Object>, index: number, v: view.View, iterations: number) {
        if (index < 0 || index >= animations.length) {
            iterations -= 1;
            if (iterations > 0) {
                this.animate(animations, 0, v, iterations);
            }
            this._resolveAnimationFinishedPromise();
        }
        else {
            v.animate(animations[index]).then(() => {
                this.animate(animations, index + 1, v, iterations);
            });
        }
    }

    public get isPlaying(): boolean {
        return this._isPlaying;
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