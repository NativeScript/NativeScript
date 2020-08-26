import { WebView } from '@nativescript/core/ui/web-view';
import * as fs from '@nativescript/core/file-system';

let webView: WebView;
export function webViewLoaded(args) {
	webView = args.object;
}

const relUrl = '~/web-view/query.html' + '?foo=bar&urlType=relative';
const absoluteUrl = `${fs.knownFolders.currentApp().path}/web-view/query.html` + '?foo=bar&urlType=absolute';
const fileUrl = `file:///${fs.knownFolders.currentApp().path}/web-view/query.html` + '?foo=bar&urlType=filePrefix';
const htmlString = `<html>
    <head>
        <title>Test Page</title>
        <meta charset="utf-8" />
    </head>
    <body>
        <div style="color:green" id="result">Just a string ...</div>
    </body>
</html>`;

export function loadRelative() {
	setSrc(relUrl);
}
export function loadAbsolute() {
	setSrc(absoluteUrl);
}
export function loadFile() {
	setSrc(fileUrl);
}
export function loadString() {
	setSrc(htmlString);
}

function setSrc(src) {
	console.log('Setting src to: ' + src);
	webView.src = src;
}
