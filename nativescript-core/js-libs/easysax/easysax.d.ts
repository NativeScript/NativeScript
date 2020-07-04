//@private
export class EasySAXParser {
    constructor();
    parse(xml: string): void;
    on(name: string, cb: Function): void;
    ns(root: string, ns: any): void;
    public angularSyntax: boolean;
}
