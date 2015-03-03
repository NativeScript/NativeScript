//@private
declare module "js-libs/easysax" {
    class EasySAXParser {
        constructor();
        parse(xml: string): void;
        on(name: string, cb: Function): void;
        ns(root: string, ns: any): void; 
    }
}

