declare module "ui/dialogs" {
    import promises = require("promises");
    import view = require("ui/core/view");
    import dialogs_common = require("ui/dialogs/dialogs-common");

    export var InputType: dialogs_common.InputType;

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
    function confirm(message: string, options?: DialogButtonsOptions): promises.Promise<boolean>;

    /**
    * The prompt() method displays a dialog box that prompts the visitor for input.
    * @param message The text to display in the dialog box.
    * @param defaultText The default text to display in the input box.
    * @param options The options for the dialog box. Optional.
    */
    function prompt(message: string, defaultText?: string, options?: PromptOptions): promises.Promise<PromptResult>;

    /**
    * The login() method displays a login dialog box that prompts the visitor for user name and password.
    * @param message The text to display in the dialog box.
    * @param userName The default text to display in the user name input box.
    * @param password The default text to display in the password input box.
    * @param options The options for the dialog box. Optional.
    */
    function login(message: string, userName?: string, password?: string, options?: DialogButtonsOptions): promises.Promise<LoginResult>;

    /**
    * Provides options for the dialog.
    */
    interface DialogOptions {
        /**
          * Gets or sets the dialog title.
          */
        title?: string;
    }

    /**
    * Provides options for the alert.
    */
    interface AlertOptions extends DialogOptions {
        /**
          * Gets or sets the OK button text.
          */
        okButtonText?: string;
    }

    /**
    * Provides options for the confirm dialog.
    */
    interface DialogButtonsOptions extends AlertOptions {
        /**
          * Gets or sets the Cancel button text.
          */
        cancelButtonText?: string;

        /**
          * Gets or sets the neutral button text.
          */
        neutralButtonText?: string;
    }

    /**
    * Provides options for the prompt dialog.
    */
    interface PromptOptions extends DialogButtonsOptions {
        /**
          * Gets or sets the prompt input type (plain text or password).
          */
        inputType?: dialogs_common.InputType;
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

    /**
    * Provides result data from the login dialog.
    */
    interface LoginResult {
        /**
          * Gets or sets the login dialog boolean result.
          */
        result: boolean;

        /**
          *  Gets or sets the user entered in the login dialog.
          */
        userName: string;

        /**
          *  Gets or sets the password entered in the login dialog.
          */
        password: string;
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
        * Gets or sets dialog message.
        */
        message: string;

        /**
        * Gets or sets dialog view.
        */
        //view: view.View;
    }
}