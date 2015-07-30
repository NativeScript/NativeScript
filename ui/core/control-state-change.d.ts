declare module "ui/core/control-state-change" {
    import native_api = require("native-api");
    /**
     * An utility class used for supporting styling infrastructure.
     */
    class ControlStateChangeListener {

        /**
         * Initializes an instance of ControlStateChangeListener class.
         * @param control An instance of the UIControl which state will be watched.
         * @param callback A callback called when a visual state of the UIControl is changed.
         */
        constructor(control: native_api.UIControl, callback: (state: string) => void);
    }
}
