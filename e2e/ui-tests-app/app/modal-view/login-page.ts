import { Page, ShownModallyData } from "tns-core-modules/ui/page";
import { EventData, fromObject } from "tns-core-modules/data/observable";
import { alert } from "tns-core-modules/ui/dialogs";

export function onShowingModally(args: ShownModallyData) {
    console.log("login-page.onShowingModally, context: " + args.context);
    const page = <Page>args.object;

    page.bindingContext = fromObject({
        username: "username",
        password: "password",
        context: args.context,
        onLoginButtonTap: function () {
            console.log("login-page.onLoginButtonTap");
            args.closeCallback(this.username, this.password);
        },
        showAlert: function () {
          alert("showing alert!");
          args.closeCallback();
      },
      openNestedModal: function () {
          page.showModal("modal-view/nested-modal", {
            context: "First",
            closeCallback: () => {
              console.log("login-page.openNestedModal");
            }
        });
      }
    });
}

export function onShownModally(args: ShownModallyData) {
    console.log("login-page.onShownModally, context: " + args.context);
}

export function onLoaded(args: EventData) {
    console.log("login-page.onLoaded");
}

export function onUnloaded() {
    console.log("login-page.onUnloaded");
}
