import { alert } from "tns-core-modules/ui/dialogs";

export function onTap() {
     var options = {
            title: "Race selection",
            message: "Race chosen: Unicorn",
            okButtonText: "OK"
        };
        alert(options).then(() => {
            console.log("Race chosen!");
        });
}
