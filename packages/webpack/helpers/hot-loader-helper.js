module.exports.reload = function ({ type, path }) {
    return `
    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => {
            global.hmrRefresh({ type: '${type}', path: '${path}' });
        })
    }
`};
