export interface Position {
	start: { line: number; column: number };
	end: { line: number; column: number };
}

export interface Node {
	type: 'rule' | 'keyframes' | 'declaration' | 'import' | 'media';
	position: Position;
}

export interface Declaration extends Node {
	property: string;
	value: string;
}

export interface Rule extends Node {
	selectors: string[];
	declarations: Declaration[];
}

export type AtRule = KeyFrames | Media;

export interface Keyframes extends Rule {
	name: string;
	vendor?: string;
	keyframes?: Array<KeyFrame>;
}

export interface KeyFrame extends Node {
	values: string[];
	declarations: Array<Declaration>;
}

export interface Media extends Node {
	media: string;
	rules: Array<Rule | AtRule>;
}

export interface StyleSheet {
	rules: Rule[];
}

export interface SyntaxTree {
	stylesheet: StyleSheet;
}

export function parse(css: string, options: any): SyntaxTree;
