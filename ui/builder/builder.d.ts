//@private
declare module "ui/builder" {
    import view = require("ui/core/view");

    export function load(fileName: string, exports?: any): view.View;
    export function parse(value: string, exports?: any): view.View;
}
