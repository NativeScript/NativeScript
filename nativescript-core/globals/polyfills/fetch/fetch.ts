import "../../core";
import "../../polyfills/xhr";

import { installPolyfills } from "../polyfill-helpers";

global.registerModule("fetch", () => require("../../../fetch"));

installPolyfills("fetch", ["fetch", "Headers", "Request", "Response"]);
