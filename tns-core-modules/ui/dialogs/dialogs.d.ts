/**
 * Allows you to show different dialogs such as alerts, prompts, etc.
 */
declare module "ui/dialogs" {
    /**
     * Defines the input type for prompt dialog.
     */
    export module inputType {
        /**
         * Plain text input type.
         */
        export var text: string;

        /**
         * Password input type.
         */
        export var password: string;
    }

    /**
     * The alert() method displays an alert box with a specified message.
     * @param message Specifies the text to display in the alert box.
     */
    export function alert(message: string): Promise<void>;

    /**
     * The alert() method displays an alert box with a specified message.
     * @param options Specifies the options for the alert box.
     */
    export function alert(options: AlertOptions): Promise<void>;

    /**
     * The confirm() method displays a dialog box with a specified message.
     * @param message Specifies the text to display in the confirm box.
     */
    export function confirm(message: string): Promise<boolean>;

    /**
     * The confirm() method displays a dialog box with a specified message.
     * @param options Specifies the options for the confirm box.
     */
    export function confirm(options: ConfirmOptions): Promise<boolean>;

    /**
     * The prompt() method displays a dialog box that prompts the visitor for input.
     * @param message The text to display in the dialog box.
     * @param defaultText The default text to display in the input box. Optional.
     */
    export function prompt(message: string, defaultText?: string): Promise<PromptResult>;

    /**
     * The prompt() method displays a dialog box that prompts the visitor for input.
     * @param options The options for the dialog box. 
     */
    export function prompt(options: PromptOptions): Promise<PromptResult>;

    /**
     * The login() method displays a login dialog box that prompts the visitor for user name and password.
     * @param message The text to display in the dialog box.
     * @param userName The default text to display in the user name input box. Optional.
     * @param password The default text to display in the password input box. Optional.
     */
    export function login(message: string, userName?: string, password?: string): Promise<LoginResult>;

    /**
     * The login() method displays a login dialog box that prompts the visitor for user name and password.
     * @param options The options for the dialog box. 
     */
    export function login(options: LoginOptions): Promise<LoginResult>;

    /**
     * The action() method displays a action box that prompts the visitor to choose some action.
     * @param message The text to display in the dialog box.
     * @param cancelButtonText The text to display in the cancel button.
     * @param actions List of available actions.
     */
    export function action(message: string, cancelButtonText: string, actions: Array<string>): Promise<string>;

    /**
     * The action() method displays a action box that prompts the visitor to choose some action.
     * @param options The options for the dialog box. 
     */
    export function action(options: ActionOptions): Promise<string>;
    
    /**
     * Provides options for the dialog.
     */
    export interface CancelableOptions {
        /**
         * [Android only] Gets or sets if the dialog can be canceled by taping outside of the dialog.
         */
        cancelable?: boolean;
    }

    /**
     * Provides options for the dialog.
     */
    export interface ActionOptions extends CancelableOptions {
        /**
         * Gets or sets the dialog title.
         */
        title?: string;

        /**
         * Gets or sets the dialog message.
         */
        message?: string;

        /**
         * Gets or sets the Cancel button text.
         */
        cancelButtonText?: string;

        /**
         * Gets or sets the list of available actions.
         */
        actions?: Array<string>;
    }

    /**
     * Provides options for the dialog.
     */
    export interface DialogOptions extends CancelableOptions {
        /**
         * Gets or sets the dialog title.
         */
        title?: string;

        /**
         * Gets or sets the dialog message.
         */
        message?: string;

    }

    /**
     * Provides options for the alert.
     */
    export interface AlertOptions extends DialogOptions {
        /**
         * Gets or sets the OK button text.
         */
        okButtonText?: string;
    }

    /**
     * Provides options for the confirm dialog.
     */
    export interface ConfirmOptions extends AlertOptions {
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
    export interface PromptOptions extends ConfirmOptions {
        /**
         * Gets or sets the default text to display in the input box.
         */
        defaultText?: string;

        /**
         * Gets or sets the prompt input type (plain text or password).
         */
        inputType?: string;
    }

    /**
     * Provides options for the login dialog.
     */
    export interface LoginOptions extends ConfirmOptions {
        /**
         * Gets or sets the default text to display in the user name input box.
         */
        userName?: string;

        /**
         * Gets or sets the default text to display in the password input box.
         */
        password?: string;
    }

    /**
     * Provides result data from the prompt dialog.
     */
    export interface PromptResult {
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
    export interface LoginResult {
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
}