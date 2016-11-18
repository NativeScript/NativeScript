declare module "ui/builder" {
    import { View, Template, KeyedTemplate } from "ui/core/view";
    import { Page } from "ui/page";

    export function load(fileName: string, exports?: any): View;
    export function load(options: LoadOptions): View;
    export function parse(value: string | Template, exports?: any): View;
    export function parseMultipleTemplates(value: string, exports?: any): Array<KeyedTemplate>;

    export interface LoadOptions {
        path: string;
        name: string;
        attributes?: any;
        exports?: any;
        page?: Page;
    }
}