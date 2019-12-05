// Types
import { TextBase } from "./text-base";

export interface TextTransformation {
    new(owner: TextBase): any /* android.text.method.TransformationMethod */;
}

export type WhiteSpace = "initial" | "normal" | "nowrap";
export type TextAlignment = "initial" | "left" | "center" | "right";
export type TextTransform = "initial" | "none" | "capitalize" | "uppercase" | "lowercase";
export type TextDecoration = "none" | "underline" | "line-through" | "underline line-through";
