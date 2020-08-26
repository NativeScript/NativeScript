module.exports = function () {
    function webpackHotUpdateCallback(chunkId, moreModules) {
        hotAddUpdateChunk(chunkId, moreModules);
        if (parentHotUpdateCallback) {
            parentHotUpdateCallback(chunkId, moreModules);
        }
    }

    function hotDownloadUpdateChunk(chunkId) {
        const requestPath = './' + $hotChunkFilename$;
        try {
            require(requestPath);
        } catch (e) {
            console.log("Hot download for update chunk failed.");
            console.error(e);
        }
    }

    function hotDownloadManifest() {
        return new Promise(function (resolve, reject) {
            const requestPath = './' + $hotMainFilename$;
            try {
                const update = require(requestPath);
                resolve(update);
            } catch (e) {
                console.log("Hot download for manifest failed.");
                console.error(e);
                reject(e);
            }
        });
    }
};
