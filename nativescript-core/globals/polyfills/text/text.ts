import "../../core";
import "../../polyfills/xhr";

import { installPolyfills } from "../polyfill-helpers";

global.registerModule("text", () => require("../../../text"));

installPolyfills("text", ["TextDecoder", "TextEncoder"]);
