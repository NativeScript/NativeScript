// >> dialog-require
import dialogs = require("ui/dialogs");
// << dialog-require

export function test_DummyTestForSnippetOnly0() {
    // >> dialog-action
    var options = {
        title: "Race Selection",
        message: "Choose your race",
        cancelButtonText: "Cancel",
        actions: ["Human", "Elf", "Dwarf", "Orc"]
    };
    dialogs.action(options).then((result) => { 
        console.log(result);
    });
    // << dialog-action
}

export function test_DummyTestForSnippetOnly1() {
    // >> dialog-confirm
    var options = {
        title: "Race Selection",
        message: "Are you sure you want to be an Elf?",
        okButtonText: "Yes",
        cancelButtonText: "No",
        neutralButtonText: "Cancel"
    };
    dialogs.confirm(options).then((result: boolean) => {
        // result can be true/false/undefined
        console.log(result);
    });
    // << dialog-confirm
}

export function test_DummyTestForSnippetOnly2() {
    // >> dialog-alert
    var options = {
        title: "Race Selection",
        message: "Race Chosen: Elf",
        okButtonText: "OK"
    };
    dialogs.alert(options).then(() => {
        console.log("Race Chosen!");
    });
    // << dialog-alert
}

export function test_DummyTestForSnippetOnly3() {
    // >> dialog-login
    var options = {
        title: "Login",
        message: "Login",
        username: "john_doe",
        password: ""
    };
    dialogs.login(options).then((loginResult: dialogs.LoginResult) => {
        // true or false.
        console.log(loginResult.result);
    });
    // << dialog-login
}

export function test_DummyTestForSnippetOnly4() {
    // >> dialog-prompt
    var options = {
        title: "Name",
        defaultText: "Enter your name",
        inputType: dialogs.inputType.text
    };
    dialogs.prompt(options).then((result: dialogs.PromptResult) => { 
        console.log("Hello, " + result.text);
    });
    // << dialog-prompt
}
