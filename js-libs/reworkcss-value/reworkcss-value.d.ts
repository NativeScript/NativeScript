declare module "js-libs/reworkcss-value" {
    export interface CSSValue {
        type: string;
        string: string;
        unit: string;
        value: number;
    }

    export function parse(cssValue: string): Array<CSSValue>;
}
