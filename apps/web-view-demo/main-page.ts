import observableModule = require("data/observable");
import pagesModule = require("ui/page");
import webViewModule = require("ui/web-view");
import buttonModule = require("ui/button");
import textFieldModule = require("ui/text-field");
import gridLayoutModule = require("ui/layouts/grid-layout");
import model = require("./model");

var gridLayout: gridLayoutModule.GridLayout; 
var backButton: buttonModule.Button;
var forwardButton: buttonModule.Button;
var reloadButton: buttonModule.Button;
var urlTextField: textFieldModule.TextField;
var webView: webViewModule.WebView;

export function onPageLoaded(args: observableModule.EventData) {
    var page = <pagesModule.Page>args.object;
    
    gridLayout = page.getViewById<gridLayoutModule.GridLayout>("gridLayout");
    backButton = page.getViewById<buttonModule.Button>("backButton");
    forwardButton = page.getViewById<buttonModule.Button>("forwardButton");
    reloadButton = page.getViewById<buttonModule.Button>("reloadButton");
    urlTextField = page.getViewById<textFieldModule.TextField>("urlTextField");
    webView = page.getViewById<webViewModule.WebView>("webView");

    if (page.android) {
        // Prevent the urlTextField from getting the focus because it will show its soft keyboard.
        (<android.view.ViewGroup>gridLayout.android).setFocusableInTouchMode(true);
    }

    if (page.android) {
        urlTextField.android.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_URI);
        urlTextField.android.setImeOptions(android.view.inputmethod.EditorInfo.IME_ACTION_DONE);
    }

    if (page.ios) {
        urlTextField.ios.keyboardType = UIKeyboardType.UIKeyboardTypeURL;
        urlTextField.ios.returnKeyType = UIReturnKeyType.UIReturnKeyGo;
    }

    var viewModel = new model.WebViewModel();

    viewModel.url = "https://httpbin.org/html";
    //viewModel.url = "http://davmagic.com/PAGES67.html" // Redirects
    //viewModel.url = "http://nunzioweb.com/iframes-example.htm" // IFrames
    //viewModel.url = "http://www.w3schools.com/html/html_iframe.asp" // IFrames
    //viewModel.url = "alabala://www.nemadastane.com" // Error
    //viewModel.url = "sdfsdf://sdfwerfd";
    //viewModel.url = "http://www.sdfsdfsdfsdf.com/";

    //viewModel.url = "https://api.instagram.com/oauth/authorize/?client_id=4e0171f9fcfc4015bb6300ed91fbf719&redirect_uri=http://localhost:2000/oauth&response_type=code";
    
    backButton.isEnabled = false;
    forwardButton.isEnabled = false;
    reloadButton.isEnabled = false;

    page.bindingContext = viewModel;
}

export function onBackButtonTap(args: observableModule.EventData) {
    webView.goBack();
}

export function onForwardButtonTap(args: observableModule.EventData) {
    webView.goForward();
}

export function onReloadButtonTap(args: observableModule.EventData) {
    webView.reload();
}

export function onWebViewStartedLoading(args: webViewModule.LoadEventData) {
    console.log("startedLoading: " + args.url);
}

export function onWebViewFinishedLoading(args: webViewModule.LoadEventData) {
    console.log("finishedLoading: " + args.url);
    backButton.isEnabled = webView.canGoBack;
    forwardButton.isEnabled = webView.canGoForward;
    reloadButton.isEnabled = true;
}