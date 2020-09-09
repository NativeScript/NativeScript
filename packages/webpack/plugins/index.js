module.exports = Object.assign({},
    require("./GenerateBundleStarterPlugin"),
    require("./GenerateNativeScriptEntryPointsPlugin"),
    require("./NativeScriptSnapshotPlugin"),
    require("./PlatformSuffixPlugin"),
    require("./PlatformFSPlugin"),
    require("./WatchStateLoggerPlugin")
);
