Dialogs module. Examples:
```js
require("globals");

var dialogs = require("ui/dialogs");
dialogs.alert("Some message")
    .then(function () { dialogs.alert("Alert closed!"); });

dialogs.alert("Some message", { title: "My custom title", okButtonText: "Close" })
    .then(function () { dialogs.alert("Alert closed!"); });

dialogs.confirm("Some question?").then(function (r) { dialogs.alert("Result: " + r); });
dialogs.confirm("Some question?", { title: "My custom title", okButtonText: "Yes", cancelButtonText: "No" })
    .then(function (r) { dialogs.alert("Result: " + r); });
dialogs.confirm("Some question?", { title: "My custom title", okButtonText: "Yes", cancelButtonText: "No", neutralButtonText: "Not sure" })
    .then(function (r) { dialogs.alert("Result: " + r); });

dialogs.prompt("Some message")
    .then(function (r) { dialogs.alert("Boolean result: " + r.result + ", entered text: " + r.text); }).fail(function (e) { console.log(e) });

dialogs.prompt("Some message", "Default text for the input", {
    title: "My custom title", okButtonText: "Yes",
    cancelButtonText: "No", neutralButtonText: "Not sure", inputType: dialogs.InputType.Password
}).then(function (r) { dialogs.alert("Boolean result: " + r.result + ", entered text: " + r.text); });
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