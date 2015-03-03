declare module "js-libs/reworkcss" {
    export interface Position {
        start: { line: number; column: number };
        end: { line: number; column: number };
    }

    export interface Node {
        type: string;
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

    export interface StyleSheet {
        rules: Rule[];
    }

    export interface SyntaxTree {
        stylesheet: StyleSheet;
    }

    export function parse(css: string, options: any): SyntaxTree;
}