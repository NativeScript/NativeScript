import TKUnit = require("../../TKUnit");
import testModule = require("../../ui-test");

// >> webview-require
import webViewModule = require("ui/web-view");
// << webview-require


// >> declare-webview-xml
//  <Page>
//       {%raw%}<WebView src="{{ someUrl | pathToLocalFile | htmlString }}" />{%endraw%}
//  </Page>
// << declare-webview-xml


export class WebViewTest extends testModule.UITest<webViewModule.WebView> {

    public create(): webViewModule.WebView {
        // >> declare-webview
        let webView = new webViewModule.WebView();
        // << declare-webview
        return webView;
    }

    public testLoadExistingUrl(done) {
        let webView = this.testView;

        // >> webview-url
        webView.on(webViewModule.WebView.loadFinishedEvent, function (args: webViewModule.LoadEventData) {
            let message;
            if (!args.error) {
                message = "WebView finished loading " + args.url;
            }
            else {
                message = "Error loading " + args.url + ": " + args.error;
            }

            // >> (hide)
            try {
                TKUnit.assertNull(args.error, args.error);
                TKUnit.assertEqual(args.url, "https://github.com/", "args.url");
                done(null);
            }
            catch (e) {
                done(e);
            }

            // << (hide)
        });
        webView.url = "https://github.com/";
        // << webview-url
    }

    public testLoadLocalFile(done) {
        let webView = this.testView;

        // >> webview-localfile
        webView.on(webViewModule.WebView.loadFinishedEvent, function (args: webViewModule.LoadEventData) {
            // >> (hide)
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
            // << (hide)

            let message;
            if (!args.error) {
                message = "WebView finished loading " + args.url;
            }
            else {
                message = "Error loading " + args.url + ": " + args.error;
            }
        });
        webView.src = "~/ui/web-view/test.html";
        // << webview-localfile
    }

    public testLoadHTMLString(done) {
        let webView = this.testView;

        // >> webview-string
        webView.on(webViewModule.WebView.loadFinishedEvent, function (args: webViewModule.LoadEventData) {
            // >> (hide)

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
            // << (hide)

            let message;
            if (!args.error) {
                message = "WebView finished loading " + args.url;
            }
            else {
                message = "Error loading " + args.url + ": " + args.error;
            }
        });
        webView.src = '<!DOCTYPE html><html><head><title>MyTitle</title><meta charset="utf-8" /></head><body><span style="color:red">TestÖ</span></body></html>';
        // << webview-string
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
        let targetSrc = "HTTPS://github.com/";

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

    public testLoadStartedNavigationTypeExists(done) {
        let webView = this.testView;
        let targetSrc = "https://github.com/";

        webView.on(webViewModule.WebView.loadStartedEvent, function (args: webViewModule.LoadEventData) {
            try {
                TKUnit.assertNull(args.error, args.error);
                TKUnit.assertTrue(webViewModule.WebView.navigationTypes.indexOf(args.navigationType) > -1, "navigationTypeExists");
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
