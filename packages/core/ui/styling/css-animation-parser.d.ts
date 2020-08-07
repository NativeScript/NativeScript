import { KeyframeAnimationInfo, KeyframeDeclaration, KeyframeInfo, UnparsedKeyframe } from '../animation/keyframe-animation';

export class CssAnimationParser {
	public static keyframeAnimationsFromCSSDeclarations(declarations: KeyframeDeclaration[]): KeyframeAnimationInfo[];

	public static keyframesArrayFromCSS(keyframes: UnparsedKeyframe[]): KeyframeInfo[];
}

export function parseKeyframeDeclarations(unparsedKeyframeDeclarations: KeyframeDeclaration[]): KeyframeDeclaration[];
