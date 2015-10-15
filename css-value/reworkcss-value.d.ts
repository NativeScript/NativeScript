declare module "css-value" {
    interface CSSValue {
        type: string;
        string: string;
        unit: string;
        value: number;
    }

    interface ParserFunction {
        (cssValue: string): Array<CSSValue>;
    }
    export = ParserFunction;
}
