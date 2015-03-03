import dialogs = require("ui/dialogs");

export function alertTapped(args) {
    dialogs.alert("Hi there!");
}
 
export function confirmTapped(args) {
    dialogs.confirm("Are you sure?");
}

export function promptTapped(args) {
    dialogs.prompt("Enter name", "John Doe");
}

export function loginTapped(args) {
    dialogs.login("Login:", "username");
}