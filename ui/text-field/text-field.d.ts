declare module "ui/text-field" {
    import view = require("ui/core/view");

    export class TextField extends view.View {
        public text: string;
    }
} 