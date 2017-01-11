import http = require("http");

declare var postMessage : any;
http.getString("https://httpbin.org/get").then(function (r) {
    postMessage(r);
}, function (e) {
    postMessage(e);
});