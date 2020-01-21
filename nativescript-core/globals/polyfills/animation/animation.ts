import "../../core";
import { installPolyfills } from "../polyfill-helpers";

global.registerModule("animation", () => require("../../../animation-frame"));

installPolyfills("animation", ["requestAnimationFrame", "cancelAnimationFrame"]);
