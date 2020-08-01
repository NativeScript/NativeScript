const { safeGet } = require("./projectHelpers");

const LAZY_RESOURCE_CONTEXT = "$$_lazy_route_resource";
const HOT_SELF_ACCEPT = "module.hot.accept();";
const HOT_DISPOSE = `
        module.hot.dispose(() => {
            // Currently the context is needed only for application style modules.
            const moduleContext = {};
            global.hmrRefresh(moduleContext);
        });`;
const HMR_HANDLER = `
    if (module.hot) {
        ${HOT_SELF_ACCEPT}${HOT_DISPOSE}
    }
`;

const isLazyLoadedNgModule = resource => {
    const issuer = safeGet(resource, "issuer");
    const issuerContext = safeGet(issuer, "context");

    return issuerContext && issuerContext.endsWith(LAZY_RESOURCE_CONTEXT);
};

module.exports = function (source, map) {
    const modifiedSource = isLazyLoadedNgModule(this._module) ?
        `${source};${HMR_HANDLER}`:
        source;

    this.callback(null, modifiedSource, map);
};
