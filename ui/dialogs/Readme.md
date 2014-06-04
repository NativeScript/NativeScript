Dialogs module. Examples:
```js
    dialogs.alert("Test").then(function(){  dialogs.alert("Test2"); });
    dialogs.alert({message:"Test", title: "MyAlert", buttonName: "Close" }).then(function(){  dialogs.alert("Test2"); });
    
    dialogs.confirm("Test?").then(function(r){  dialogs.alert("Result:" + r); });
    dialogs.confirm({message:"Confirm?", title: "MyConfirm", okButtonName: "Do it!", cancelButtonName: "Ignore it!" }).then(function(r){  dialogs.alert("Result:" + r); });

    dialogs.prompt("Enter something!").then(function(r){  dialogs.alert("Result:" + r); });
    dialogs.prompt({message:"Enter something?", title: "MyPrompt", okButtonName: "Do it!", cancelButtonName: "Ignore it!", defaultText : "Enter your password here!" }).then(function(r){  dialogs.alert("Result:" + r); });
```