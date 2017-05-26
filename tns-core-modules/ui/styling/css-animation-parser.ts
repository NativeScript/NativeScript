import { Pair } from "../animation";
import { Color } from "../../color";

import {
    KeyframeAnimationInfo,
    KeyframeDeclaration,
    KeyframeInfo,
    Keyframes,
    UnparsedKeyframe,
} from "../animation/keyframe-animation";
import { timeConverter, numberConverter, transformConverter, animationTimingFunctionConverter } from "../styling/converters";

let animationProperties = {
    "animation-name": (info, declaration) => info.name = declaration.value,
    "animation-duration": (info, declaration) => info.duration = timeConverter(declaration.value),
    "animation-delay": (info, declaration) => info.delay = timeConverter(declaration.value),
    "animation-timing-function": (info, declaration) => info.curve = animationTimingFunctionConverter(declaration.value),
    "animation-iteration-count": (info, declaration) => declaration.value === "infinite" ? info.iterations = Number.MAX_VALUE : info.iterations = numberConverter(declaration.value),
    "animation-direction": (info, declaration) => info.isReverse = declaration.value === "reverse",
    "animation-fill-mode": (info, declaration) => info.isForwards = declaration.value === "forwards"
};

export class CssAnimationParser {
    public static keyframeAnimationsFromCSSDeclarations(declarations: { property: string, value: string }[]): Array<KeyframeAnimationInfo> {
        let animations: Array<KeyframeAnimationInfo> = new Array<KeyframeAnimationInfo>();
        let animationInfo: KeyframeAnimationInfo = undefined;
        if (declarations === null || declarations === undefined) {
            return undefined;
        }
        for (let declaration of declarations) {
            if (declaration.property === "animation") {
                keyframeAnimationsFromCSSProperty(declaration.value, animations);
            }
            else {
                let propertyHandler = animationProperties[declaration.property];
                if (propertyHandler) {
                    if (animationInfo === undefined) {
                        animationInfo = new KeyframeAnimationInfo();
                        animations.push(animationInfo);
                    }
                    propertyHandler(animationInfo, declaration);
                }
            }
        }
        return animations.length === 0 ? undefined : animations;
    }

    public static keyframesArrayFromCSS(cssKeyframes: Keyframes): Array<KeyframeInfo> {
        let parsedKeyframes = new Array<KeyframeInfo>();
        for (let keyframe of cssKeyframes.keyframes) {
            let declarations = parseKeyframeDeclarations(keyframe);
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
                    current = <KeyframeInfo>{};
                    current.duration = time;
                    parsedKeyframes[time] = current;
                }
                for (let declaration of keyframe.declarations) {
                    if (declaration.property === "animation-timing-function") {
                        current.curve = animationTimingFunctionConverter(declaration.value);
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
}

function keyframeAnimationsFromCSSProperty(value: any, animations: Array<KeyframeAnimationInfo>) {
    if (typeof value === "string") {
        let values = value.split(/[,]+/);
        for (let parsedValue of values) {
            let animationInfo = new KeyframeAnimationInfo();
            let arr = (<string>parsedValue).trim().split(/[ ]+/);

            if (arr.length > 0) {
                animationInfo.name = arr[0];
            }
            if (arr.length > 1) {
                animationInfo.duration = timeConverter(arr[1]);
            }
            if (arr.length > 2) {
                animationInfo.curve = animationTimingFunctionConverter(arr[2]);
            }
            if (arr.length > 3) {
                animationInfo.delay = timeConverter(arr[3]);
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

function parseKeyframeDeclarations(keyframe: UnparsedKeyframe): Array<KeyframeDeclaration> {
    let declarations = {};
    for (let declaration of keyframe.declarations) {
        let propertyName = declaration.property;
        let value = declaration.value;

        if (propertyName === "opacity") {
            declarations[propertyName] = parseFloat(value);
        } else if (propertyName === "transform") {

            const transformations = transformConverter(value);
            Object.assign(declarations, transformations);
            delete declarations[propertyName];
        } else if (propertyName === "backgroundColor" || propertyName === "background-color") {

            declarations["backgroundColor"] = new Color(value);
        }
        else {
            declarations[propertyName] = value;
        }
    }

    let array = new Array<KeyframeDeclaration>();
    for (let declaration in declarations) {
        let keyframeDeclaration = <KeyframeDeclaration>{};
        keyframeDeclaration.property = declaration;
        keyframeDeclaration.value = declarations[declaration];
        array.push(keyframeDeclaration);
    }

    return array;
}
