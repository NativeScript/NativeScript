declare module "ui/builder" {
    import view = require("ui/core/view");
    import page = require("ui/page");

    export function load(fileName: string, exports?: any): view.View;
    export function load(options: LoadOptions): view.View;
    export function parse(value: string | view.Template, exports?: any): view.View;

    export interface LoadOptions {
        path: string;
        name: string;
        attributes?: any;
        exports?: any;
        page?: page.Page;
    }
}
