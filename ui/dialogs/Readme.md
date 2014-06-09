Dialogs module. Examples:
```js
dialogs.alert("Test").then(function () { dialogs.alert("Test2"); });
dialogs.alert("Test", { title: "MyAlert", buttonText: "Close" }).then(function () { dialogs.alert("Test2"); });

dialogs.confirm("Test?").then(function (r) { dialogs.alert("Result:" + r); });
dialogs.confirm("Confirm?", { title: "MyConfirm", okButtonText: "Do it!", cancelButtonText: "Ignore it!" })
    .then(function (r) { dialogs.alert("Result:" + r); });
dialogs.confirm("Confirm?", {
    title: "MyConfirm", okButtonText: "Do it!",
    cancelButtonText: "Ignore it!", otherButtonText: "Not sure!"
}).then(function (r) { dialogs.alert("Result:" + r); });

dialogs.prompt("Enter something!").then(function (r) { dialogs.alert("Result:" + r.result + ", text:" + r.text); })
    .fail(function (e) { console.log(e) });

dialogs.prompt("Enter something?", {
    title: "MyPrompt", okButtonText: "Do it!",
    cancelButtonText: "Ignore it!", otherButtonText: "Not sure!", defaultText: "Enter your password here!"
}).then(function (r) { dialogs.alert("Result:" + r.result + " Text:" + r.text); });
```
Custom dialogs:
```js
	require("globals");
	var dialogs = require("ui/dialogs");

	/// Splash 
	var d = new dialogs.Dialog();
	d.title = "Loading..."
	d.show();

	setTimeout(function(){ d.hide(); }, 2000);
```