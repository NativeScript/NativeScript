import "../../core";
import { installPolyfills } from "../polyfill-helpers";

global.registerModule("animation", () => require("../../../fps-meter/animation-frame"));

installPolyfills("animation", ["requestAnimationFrame", "cancelAnimationFrame"]);
