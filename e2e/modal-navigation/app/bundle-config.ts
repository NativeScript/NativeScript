if ((<any>global).TNS_WEBPACK) {
    // Register tns-core-modules UI framework modules
    require("bundle-entry-points");

    // Register application modules
    // This will register each `root`, `page`, `fragment` postfixed xml, css, js, ts, scss file in the app/ folder
    const context = (<any>require).context("~/", true, /(root|page|fragment)\.(xml|css|js|ts|scss|less|sass)$/);
    global.registerWebpackModules(context);
}
