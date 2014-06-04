declare module "ui/dialogs" {
    import promises = require("promises");
    /**
    * The alert() method displays an alert box with a specified message.
    * @param message Specifies the text to display in the alert box.
    */
    function alert(message: string): promises.Promise<void>;

    /**
    * The alert() method displays an alert box with a specified options.
    * @param options Specifies the options for the alert box.
    */
    function alert(options: AlertOptions): promises.Promise<void>;

    /**
    * The confirm() method displays a dialog box with a specified message.
    * @param message Specifies the text to display in the confirm box.
    */
    function confirm(message: string): promises.Promise<boolean>;

    /**
    * The confirm() method displays a dialog box with a specified message.
    * @param options Specifies the options for the confirm box.
    */
    function confirm(options: ConfirmOptions): promises.Promise<boolean>;

    /**
    * The prompt() method displays a dialog box that prompts the visitor for input.
    * @param text The text to display in the dialog box.
    */
    function prompt(text: string, defaultText?: string): promises.Promise<string>;

    /**
    * The prompt() method displays a dialog box that prompts the visitor for input.
    * @param options The options for the dialog box.
    */
    function prompt(options: PromptOptions): promises.Promise<string>;

    /**
    * Provides options for the alert.
    */
    interface DialogOptions {
        /**
          * Gets or sets the alert message.
          */
        message: string;

        /**
          * Gets or sets the alert title.
          */
        title?: string;
    }

    /**
    * Provides options for the alert.
    */
    interface AlertOptions extends DialogOptions {
        /**
          * Gets or sets the button name.
          */
        buttonName?: string;
    }

    /**
    * Provides options for the alert.
    */
    interface ConfirmOptions extends DialogOptions {
        /**
          * Gets or sets the OK button name.
          */
        okButtonName?: string;

        /**
          * Gets or sets the Cancel button name.
          */
        cancelButtonName?: string;
    }

    /**
    * Provides options for the alert.
    */
    interface PromptOptions extends ConfirmOptions {
        /**
          * Gets or sets the default text.
          */
        defaultText?: string;
    }
}