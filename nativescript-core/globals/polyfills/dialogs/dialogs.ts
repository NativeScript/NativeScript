import "../../core";
import { installPolyfills } from "../polyfill-helpers";

global.registerModule("ui-dialogs", () => require("../../../ui/dialogs"));

installPolyfills("ui-dialogs", ["alert", "confirm", "prompt", "login", "action"]);
