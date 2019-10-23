import "../../core";
import { installPolyfills } from "../polyfill-helpers";

global.registerModule("tns-core-modules/ui/dialogs", () => require("../../../ui/dialogs"));

installPolyfills("tns-core-modules/ui/dialogs", ["alert", "confirm", "prompt", "login", "action"]);
