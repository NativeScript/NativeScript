/**
 * @module "ui/styling/css-animations-parser"
 */ /** */

import {
    KeyframeAnimationInfo,
    KeyframeDeclaration,
    KeyframeInfo,
    UnparsedKeyframe,
} from "../animation/keyframe-animation";
import { timeConverter, animationTimingFunctionConverter } from "./converters";

import { transformConverter } from "./style-properties";

export class CssAnimationParser {
    public static keyframeAnimationsFromCSSDeclarations(declarations: KeyframeDeclaration[]): KeyframeAnimationInfo[];

    public static keyframesArrayFromCSS(keyframes: UnparsedKeyframe[]): KeyframeInfo[];
}

export function parseKeyframeDeclarations(unparsedKeyframeDeclarations: KeyframeDeclaration[]) : KeyframeDeclaration[];
