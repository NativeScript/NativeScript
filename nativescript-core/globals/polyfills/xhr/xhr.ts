import "../../core";
import { installPolyfills } from "../polyfill-helpers";

global.registerModule("xhr", () => require("../../../xhr"));

installPolyfills("xhr", ["XMLHttpRequest", "FormData", "Blob", "File", "FileReader"]);
