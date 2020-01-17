import "../../core";
import { installPolyfills } from "../polyfill-helpers";

global.registerModule("timer", () => require("../../../timer"));

installPolyfills("timer", ["setTimeout", "clearTimeout", "setInterval", "clearInterval"]);
