import * as dialogs from "ui/dialogs";
import * as observable from "data/observable";

var name = "Harold Finch";

export class SettingsViewModel extends observable.Observable {

    get name(): string {
        return name;
    }

    set name(value: string) {
        name = value;
    }

    public actionName(args: observable.EventData) {
        dialogs.action({
            message: "Change the name?",
            cancelButtonText: "Close",
            actions: ["Yes", "No"]
        }).then((actionResult) => {
            console.log("### Result: " + actionResult);
            if (actionResult === "Yes") {
                this.set("name", "John Reese");
            }
            else {
                this.set("name", "Harold Finch");
            }
        });
    }

    public alertName(args: observable.EventData) {
        dialogs.alert({
            title: "Name",
            message: "The name will change.",
            okButtonText: "OK"
        }).then((alertResult) => {
            console.log("### Result: " + alertResult);
            this.set("name", "John Reese");
        });
    }

    public confirmName(args: observable.EventData) {
        dialogs.confirm({
            title: "Name",
            message: "Do you want to change the name?",
            cancelButtonText: "No",
            neutralButtonText: "Ignore",
            okButtonText: "Yes"
        }).then((confirmResult) => {
            console.log("### Result: " + confirmResult);
            if (confirmResult) {
                this.set("name", "John Reese");
            }
            else {
                this.set("name", "Harold Finch");
            }
        });
    }

    public loginName(args: observable.EventData) {
        dialogs.login({
            title: "Name",
            message: "Enter name:",
            cancelButtonText: "Cancel",
            neutralButtonText: "Ignore",
            okButtonText: "OK",
            userName: "John",
            password: "Reese"
        }).then((loginResult) => {
            console.log("### Result: " + loginResult.result + ", UserName: " + loginResult.userName + ", Password: " + loginResult.password);
            if (loginResult.result) {
                this.set("name", loginResult.userName + " " + loginResult.password);
            }
            else {
                this.set("name", "Harold Finch");
            }
        });
    }

    public promptName(args: observable.EventData) {
        dialogs.prompt({
            title: "Name",
            message: "Enter name:",
            cancelButtonText: "Cancel",
            neutralButtonText: "Ignore",
            okButtonText: "OK",
            defaultText: "John Reese",
            inputType: dialogs.inputType.text
        }).then((promptResult) => {
            console.log("### Result: " + promptResult.result + ", Text: " + promptResult.text);
            if (promptResult.result) {
                this.set("name", promptResult.text);
            }
            else {
                this.set("name", "Harold Finch");
            }
        });
    }
}
export var settingsViewModel = new SettingsViewModel();