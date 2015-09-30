import dialogs = require("ui/dialogs");

export function alertTapped(args) {
    dialogs.alert("Hi there!");
}

export function alertWithOptionsTapped(args) {
    dialogs.alert({
        title: "Alert Title",
        message: "Hi there!",
        okButtonText: "Close"
    });
}

export function confirmTapped(args) {
    dialogs.confirm("Are you sure?").then(r=> console.log(`Confirm result: ${r}`));
}

export function confirmWithOptionsTapped(args) {
    dialogs.confirm({
        title: "Confirm Title",
        message: "Are you sure?",
        okButtonText: "OK",
        cancelButtonText: "Cancel",
        neutralButtonText: "Ignore"
    }).then(r=> console.log(`Confirm result: ${r}`));
}

export function promptTapped(args) {
    dialogs.prompt("Enter name:", "John Doe");
}

export function promptWithOptionsTapped(args) {
    dialogs.prompt({
        title: "Prompt Title",
        message: "Enter name:",
        okButtonText: "OK",
        cancelButtonText: "Cancel",
        neutralButtonText: "Ignore",
        defaultText: "John Doe",
        inputType: dialogs.inputType.text
    }).then(r=> console.log(`Prompt result: ${r.result}, text: ${r.text}`));
}

export function promptWithOptionsPasswordTapped(args) {
    dialogs.prompt({
        title: "Prompt Title",
        message: "Enter name:",
        okButtonText: "OK",
        cancelButtonText: "Cancel",
        neutralButtonText: "Ignore",
        defaultText: "John Doe",
        inputType: dialogs.inputType.password
    }).then(r=> console.log(`Prompt result: ${r.result}, text: ${r.text}`));
}

export function loginTapped(args) {
    dialogs.login("Enter user/pass:", "username", "password").then(r=> console.log(`Login result: ${r.result}, user: ${r.userName}, pwd: ${r.password}`));
}

export function loginWithOptionsTapped(args) {
    dialogs.login({
        title: "Login Title",
        message: "Enter user/pass:",
        okButtonText: "OK",
        cancelButtonText: "Cancel",
        neutralButtonText: "Ignore",
        userName: "username",
        password: "password"
    }).then(r=> console.log(`Login result: ${r.result}, user: ${r.userName}, pwd: ${r.password}`));
}

export function actionTapped(args) {
    dialogs.action("Action", "Close", ["One", "Two", "Three"]).then(r=> console.log(`Action result: ${r}`));
}

export function actionWithOptionsTapped(args) {
    dialogs.action({
        title: "Action Title",
        message: "Action Message",
        cancelButtonText: "Close",
        actions: ["One", "Two", "Three"]
    }).then(r=> console.log(`Action result: ${r}`));
}