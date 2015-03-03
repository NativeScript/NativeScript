// <snippet module="ui/dialogs" title="dialogs">
// # Dialogs
// Displaying dialogs requires the "ui/dialogs" module.
// ``` JavaScript
import dialogs = require("ui/dialogs");
// ```
// </snippet>

export function test_DummyTestForSnippetOnly0() {
    // <snippet module="ui/dialogs" title="dialogs">
    // ### Action
    // ``` JavaScript
    var options = {
        title: "Race Selection",
        message: "Choose your race",
        cancelButtonText: "Cancel",
        actions: ["Human", "Elf", "Dwarf", "Orc"]
    };
    dialogs.action(options).then((result) => { 
        console.log(result);
    });
    // ```
    // </snippet>
}

export function test_DummyTestForSnippetOnly1() {
    // <snippet module="ui/dialogs" title="dialogs">
    // ### Confirm
    // ``` JavaScript
    var options = {
        title: "Race Selection",
        message: "Are you sure you want to be an Elf?",
        okButtonText: "Yes",
        cancelButtonText: "No",
        neutralButtonText: "Cancel"
    };
    dialogs.confirm(options).then((result: boolean) => {
        //// result can be true/false/undefined
        console.log(result);
    });
    // ```
    // </snippet>
}

export function test_DummyTestForSnippetOnly2() {
    // <snippet module="ui/dialogs" title="dialogs">
    // ### Alert
    // ``` JavaScript
    var options = {
        title: "Race Selection",
        message: "Race Chosen: Elf",
        okButtonText: "OK"
    };
    dialogs.alert(options).then(() => {
        console.log("Race Chosen!");
    });
    // ```
    // </snippet>
}

export function test_DummyTestForSnippetOnly3() {
    // <snippet module="ui/dialogs" title="dialogs">
    // ### Login
    // ``` JavaScript
    var options = {
        title: "Login",
        message: "Login",
        username: "john_doe",
        password: ""
    };
    dialogs.login(options).then((loginResult: dialogs.LoginResult) => {
        //// true or false.
        console.log(loginResult.result);
    });
    // ```
    // </snippet>
}

export function test_DummyTestForSnippetOnly4() {
    // <snippet module="ui/dialogs" title="dialogs">
    // ### Prompt
    // ``` JavaScript
    var options = {
        title: "Name",
        defaultText: "Enter your name",
        inputType: dialogs.inputType.text
    };
    dialogs.prompt(options).then((result: dialogs.PromptResult) => { 
        console.log("Hello, " + result.text);
    });
    // ```
    // </snippet>
}