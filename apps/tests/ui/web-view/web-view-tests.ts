import TKUnit = require("../../TKUnit");
import testModule = require("../../ui-test");

// <snippet module="ui/web-view" title="WebView">
// # WebView
// Using a WebView requires the web-view module.
// ``` JavaScript
import webViewModule = require("ui/web-view");
// ```
// </snippet>

// <snippet module="ui/web-view" title="WebView">
// ### Declaring a WebView.
//``` XML
//  <Page>
//       {%raw%}<WebView src="{{ someUrl | pathToLocalFile | htmlString }}" />{%endraw%}
//  </Page>
//```

// </snippet>

export class WebViewTest extends testModule.UITest<webViewModule.WebView> {

    public create(): webViewModule.WebView {
        // <snippet module="ui/web-view" title="WebView">
        // ### Creating a WebView
        // ``` JavaScript
        let webView = new webViewModule.WebView();
        // ```
        // </snippet>
        return webView;
    }

    public testLoadExistingUrl(done) {
        let webView = this.testView;

        // <snippet module="ui/web-view" title="WebView">
        // ### Using WebView
        // ``` JavaScript
        webView.on(webViewModule.WebView.loadFinishedEvent, function (args: webViewModule.LoadEventData) {
            let message;
            if (!args.error) {
                message = "WebView finished loading " + args.url;
            }
            else {
                message = "Error loading " + args.url + ": " + args.error;
            }

            // <hide>
            try {
                TKUnit.assertNull(args.error, args.error);
                TKUnit.assertEqual(args.url, "https://www.yahoo.com/", "args.url");
                done(null);
            }
            catch (e) {
                done(e);
            }

            // </hide>
        });
        webView.url = "https://www.yahoo.com/";
        // ```
        // </snippet>
    }

    public testLoadLocalFile(done) {
        let webView = this.testView;

        // <snippet module="ui/web-view" title="WebView">
        // ### Using WebView
        // ``` JavaScript
        webView.on(webViewModule.WebView.loadFinishedEvent, function (args: webViewModule.LoadEventData) {
            // <hide>
            let actual;
            let expectedTitle = 'MyTitle';
            let expectedHtml = '<span style="color:red">TestÖ</span>';

            if (webView.ios) {
                actual = webView.ios.stringByEvaluatingJavaScriptFromString("document.body.innerHTML").trim();
            } else if (webView.android) {
                actual = webView.android.getTitle();
            }

            try {
                TKUnit.assertNull(args.error, args.error);
                TKUnit.assertEqual(actual, webView.ios ? expectedHtml : expectedTitle, "File ~/ui/web-view/test.html not loaded properly.");
                done(null);
            }
            catch (e) {
                done(e);
            }
            // </hide>

            let message;
            if (!args.error) {
                message = "WebView finished loading " + args.url;
            }
            else {
                message = "Error loading " + args.url + ": " + args.error;
            }
        });
        webView.src = "~/ui/web-view/test.html";
        // ```
        // </snippet> 
    }

    public testLoadHTMLString(done) {
        let webView = this.testView;

        // <snippet module="ui/web-view" title="WebView">
        // ### Using WebView
        // ``` JavaScript
        webView.on(webViewModule.WebView.loadFinishedEvent, function (args: webViewModule.LoadEventData) {
            // <hide>

            let actual;
            let expected;

            if (webView.ios) {
                actual = webView.ios.stringByEvaluatingJavaScriptFromString("document.body.innerHTML").trim();
                expected = '<span style="color:red">TestÖ</span>';
            } else if (webView.android) {
                actual = webView.android.getTitle();
                expected = 'MyTitle';
            }

            try {
                TKUnit.assertNull(args.error, args.error);
                TKUnit.assertEqual(actual, expected, "HTML string not loaded properly. Actual: ");
                done(null);
            }
            catch (e) {
                done(e);
            }
            // </hide>

            let message;
            if (!args.error) {
                message = "WebView finished loading " + args.url;
            }
            else {
                message = "Error loading " + args.url + ": " + args.error;
            }
        });
        webView.src = '<!DOCTYPE html><html><head><title>MyTitle</title><meta charset="utf-8" /></head><body><span style="color:red">TestÖ</span></body></html>';
        // ```
        // </snippet>
    }

    public testLoadInvalidUrl(done) {
        let webView = this.testView;
        let actualError;

        webView.on(webViewModule.WebView.loadFinishedEvent, function (args: webViewModule.LoadEventData) {
            if (actualError) {
                // Android call this twice -- the second time args.error is undefined.
                return;
            }
            actualError = args.error;
            try {
                TKUnit.assert(actualError !== undefined, "There should be an error.");
                done(null);
            }
            catch (e) {
                done(e);
            }
        });
        webView.url = "kofti://mnogokofti";
    }

    public testLoadUpperCaseSrc(done) {
        let webView = this.testView;
        let targetSrc = "HTTPS://www.yahoo.com/";

        webView.on(webViewModule.WebView.loadFinishedEvent, function (args: webViewModule.LoadEventData) {
            try {
                TKUnit.assertNull(args.error, args.error);
                TKUnit.assertEqual(args.url, targetSrc.toLowerCase(), "args.url");
                done(null);
            }
            catch (e) {
                done(e);
            }
        });

        webView.src = targetSrc;
    }
}

export function createTestCase(): WebViewTest {
    return new WebViewTest();
}
