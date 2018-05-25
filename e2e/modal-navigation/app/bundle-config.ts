if ((<any>global).TNS_WEBPACK) {
    require("globals");
    // Register application modules
    // This will register each `layout` postfixed xml, css, js, ts, scss file in the app/ folder
    const context = (<any>require).context("~/", true, /(layout)\.(xml|css|js|ts|scss|less|sass)$/);
    global.registerWebpackModules(context);
}
