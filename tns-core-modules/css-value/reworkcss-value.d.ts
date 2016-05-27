declare module "css-value" {
    interface CSSValue {
        type: string;
        string: string;
        unit?: string;
        value?: number;
    }

    function parse(cssValue: string): Array<CSSValue>;
    export = parse;
}
