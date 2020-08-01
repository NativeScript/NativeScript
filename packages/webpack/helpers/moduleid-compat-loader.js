/**
 * When building NativeScript angular apps without webpack (`tns run android`) the moduleId: module.id is necessary.
 * When building with webpack the angular compiler and webpack handle relative paths in the modules and no longer need moduleId
 * to be set, however webpack emits numbers for module.id and angular has typecheck for moduleId to be a string.
 */
module.exports = function (source, map) {
    this.cacheable();

    // Strips occurences of `moduleId: module.id,`, since it is no longer needed for webpack builds
    const noModuleIdsSource = source.replace(/moduleId\:\s*module\.id\s*(\,)?/g, result =>
        // Try to preserve char count so sourcemaps may remain intact
        "/*" + result.substring(2, result.length - 2) + "*/"
    );

    this.callback(null, noModuleIdsSource, map);
};