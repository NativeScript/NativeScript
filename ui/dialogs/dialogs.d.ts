declare module "dialogs" {
    import promises = require("promises");
    /**
    * The alert() method displays an alert box with a specified message.
    * @param message Specifies the text to display in the alert box.
    */
    function alert(message: string): promises.Promise<any>;

    /**
    * The alert() method displays an alert box with a specified options.
    * @param options Specifies the options for the alert box.
    */
    function alert(options: AlertOptions): promises.Promise<any>;

    /**
    * The confirm() method displays a dialog box with a specified message, along with an OK and a Cancel button.
    * @param message Specifies the text to display in the confirm box.
    */
    function confirm(message: string): void;

    /**
    * The prompt() method displays a dialog box that prompts the visitor for input.
    * @param text The text to display in the dialog box.
    * @param defaultText The default input value.
    */
    function prompt(text: string, defaultText?: string): void;

    /**
    * Provides options for the alert.
    */
    interface AlertOptions {
        /**
          * Gets or sets the alert message.
          */
        message: string;

        /**
          * Gets or sets the alert message.
          */
        title?: string;

        /**
          * Gets or sets the request headers in JSON format.
          */
        buttonName?: any;
    }
}