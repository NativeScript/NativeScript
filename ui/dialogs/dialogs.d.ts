declare module "ui/dialogs" {
    import promises = require("promises");
    import view = require("ui/core/view");

    /**
    * The alert() method displays an alert box with a specified message.
    * @param message Specifies the text to display in the alert box.
    * @param options Specifies the options for the alert box. Optional.
    */
    function alert(message: string, options?: AlertOptions): promises.Promise<void>;

    /**
    * The confirm() method displays a dialog box with a specified message.
    * @param message Specifies the text to display in the confirm box.
    * @param options Specifies the options for the confirm box. Optional.
    */
    function confirm(message: string, options?: ConfirmOptions): promises.Promise<boolean>;

    /**
    * The prompt() method displays a dialog box that prompts the visitor for input.
    * @param message The text to display in the dialog box.
    * @param options The options for the dialog box. Optional.
    */
    function prompt(message: string, options?: PromptOptions): promises.Promise<string>;

    /**
    * Provides options for the dialog.
    */
    interface DialogOptions {
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
        buttonText?: string;
    }

    /**
    * Provides options for the confirm.
    */
    interface ConfirmOptions extends DialogOptions {
        /**
          * Gets or sets the OK button name.
          */
        okButtonText?: string;

        /**
          * Gets or sets the Cancel button name.
          */
        cancelButtonText?: string;

        /**
          * Gets or sets the Cancel button name.
          */
        otherButtonText?: string;
    }

    /**
    * Provides options for the prompt.
    */
    interface PromptOptions extends ConfirmOptions {
        /**
          * Gets or sets the default text.
          */
        defaultText?: string;
    }

    /**
    * Provides result data from the prompt dialog.
    */
    interface PromptResult {
        /**
          * Gets or sets the prompt dialog boolean result.
          */
        result: boolean;

        /**
          *  Gets or sets the text entered in the prompt dialog.
          */
        text: string;
    }

    export class Dialog {
        /**
        * Shows the dialog.
        */
        show: () => void;

        /**
        * Hides the dialog.
        */
        hide: () => void;

        /**
        * Gets or sets dialog title.
        */
        title: string;

        /**
        * Gets or sets dialog view.
        */
        view: view.View;
    }
}