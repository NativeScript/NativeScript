require("globals");
import * as http from "tns-core-modules/http";

declare var postMessage : any;

http.getString("https://httpbin.org/get").then(function (r) {
    postMessage(r);
}, function (e) {
    throw e;
});
