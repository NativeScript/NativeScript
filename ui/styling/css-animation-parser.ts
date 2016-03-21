import animationModule = require("ui/animation");
import keyframeAnimationModule = require("ui/animation/keyframe-animation");
import cssParser = require("css");
import converters = require("../styling/converters");
import types = require("utils/types");
import colorModule = require("color");
import styleProperty = require("ui/styling/style-property");

interface TransformInfo {
    scale: animationModule.Pair;
    translate: animationModule.Pair;
}

let animationProperties = {
  "animation-name": (info, declaration) => info.name = declaration.value,
  "animation-duration": (info, declaration) => info.duration = converters.timeConverter(declaration.value),
  "animation-delay": (info, declaration) => info.delay = converters.timeConverter(declaration.value),
  "animation-timing-function": (info, declaration) => info.curve = converters.animationTimingFunctionConverter(declaration.value),
  "animation-iteration-count": (info, declaration) => declaration.value === "infinite" ? info.iterations = Number.MAX_VALUE : info.iterations = converters.numberConverter(declaration.value),
  "animation-direction": (info, declaration) => info.isReverse = declaration.value === "reverse",
  "animation-fill-mode": (info, declaration) => info.isForwards = declaration.value === "forwards"
};

export class CssAnimationParser {

    public static keyframeAnimationsFromCSSDeclarations(declarations: cssParser.Declaration[]): Array<keyframeAnimationModule.KeyframeAnimationInfo> {
        let animations: Array<keyframeAnimationModule.KeyframeAnimationInfo>  = new Array<keyframeAnimationModule.KeyframeAnimationInfo>();
        let animationInfo: keyframeAnimationModule.KeyframeAnimationInfo = undefined;
        for (let declaration of declarations) {
            if (declaration.property === "animation") {
                CssAnimationParser.keyframeAnimationsFromCSSProperty(declaration.value, animations);
            }
            else {
                let propertyHandler = animationProperties[declaration.property];
                if (propertyHandler) {
                    if (animationInfo === undefined) {
                        animationInfo = new keyframeAnimationModule.KeyframeAnimationInfo();
                        animations.push(animationInfo);
                    }
                    propertyHandler(animationInfo, declaration);
                }
            }
        }
        return animations.length === 0 ? undefined : animations;
    }

    public static keyframesArrayFromCSS(cssKeyframes: Object): Array<keyframeAnimationModule.KeyframeInfo> {
        let parsedKeyframes = new Array<keyframeAnimationModule.KeyframeInfo>();
        for (let keyframe of (<any>cssKeyframes).keyframes) {
            let declarations = CssAnimationParser.parseKeyframeDeclarations(keyframe);
            for (let time of keyframe.values) {
                if (time === "from") {
                    time = 0;
                }
                else if (time === "to") {
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
                    current = new keyframeAnimationModule.KeyframeInfo();
                    current.duration = time;
                    parsedKeyframes[time] = current;
                }
                for (let declaration of <any>keyframe.declarations) {
                    if (declaration.property === "animation-timing-function") {
                        current.curve = converters.animationTimingFunctionConverter(declaration.value);
                    }
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

    private static keyframeAnimationsFromCSSProperty(value: any, animations: Array<keyframeAnimationModule.KeyframeAnimationInfo>) {
        if (types.isString(value)) {
            let values = value.split(/[,]+/);
            for (let parsedValue of values) {
                let animationInfo = new keyframeAnimationModule.KeyframeAnimationInfo();
                let arr = (<string>parsedValue).trim().split(/[ ]+/);

                if (arr.length > 0) {
                    animationInfo.name = arr[0];
                }
                if (arr.length > 1) {
                    animationInfo.duration = converters.timeConverter(arr[1]);
                }
                if (arr.length > 2) {
                    animationInfo.curve = converters.animationTimingFunctionConverter(arr[2]);
                }
                if (arr.length > 3) {
                    animationInfo.delay = converters.timeConverter(arr[3]);
                }
                if (arr.length > 4) {
                    animationInfo.iterations = parseInt(arr[4]);
                }
                if (arr.length > 5) {
                    animationInfo.isReverse = arr[4] === "reverse";
                }
                if (arr.length > 6) {
                    animationInfo.isForwards = arr[5] === "forwards";
                }
                if (arr.length > 7) {
                    throw new Error("Invalid value for animation: " + value);
                }
                animations.push(animationInfo);
            }
        }
    }

    private static parseKeyframeDeclarations(keyframe: Object): Array<keyframeAnimationModule.KeyframeDeclaration> {
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
        let array = new Array<keyframeAnimationModule.KeyframeDeclaration>();
        for (let declaration in declarations) {
            let keyframeDeclaration = new keyframeAnimationModule.KeyframeDeclaration();
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
}
