module.exports = function parseProjectSnapshotGeneratorArgs() {
    var result = parseJsonFromProcessArgs();

    if (result.targetArchs) {
        result.targetArchs = parseStringArray(result.targetArchs);
    }

    if (result.useLibs !== undefined) {
        result.useLibs = parseBool(result.useLibs);
    }

    if (result.snapshotInDocker !== undefined) {
        result.snapshotInDocker = parseBool(result.snapshotInDocker);
    }

    if (result.skipSnapshotTools !== undefined) {
        result.skipSnapshotTools = parseBool(result.skipSnapshotTools);
    }

    if (result.install !== undefined) {
        result.install = parseBool(result.install);
    }

    return result;
}

function parseJsonFromProcessArgs() {
    var args = process.argv.slice(2);
    var result = {};

    var currentKey = "";
    var currentValue = "";
    args.forEach(function (value, index, array) {
        if (value.startsWith("--")) { // if is key
            addKeyAndValueToResult(currentKey, currentValue, result);
            currentKey = value.slice(2);
            currentValue = null;
        }
        else { // if is first value
            currentValue = (currentValue === null) ? value : currentValue + " " + value;
        }

        if (index == array.length - 1) { // if is the last one
            addKeyAndValueToResult(currentKey, currentValue, result);
        }
    });

    return result;
}

function addKeyAndValueToResult(key, value, result) {
    if (!key)
        return;
    var jsValue = (value === null) ? null : value.toString();
    var keyPath = key.split(".");
    var parentObject = result;
    for (var i = 0; i < keyPath.length; i++) {
        if (i == keyPath.length - 1) {
            parentObject[keyPath[i]] = jsValue;
        }
        else {
            parentObject[keyPath[i]] = parentObject[keyPath[i]] || {};
            parentObject = parentObject[keyPath[i]];
        }
    }
}

function parseBool(value) {
    return (value === null || value === "true") ? true : false;
}

function parseStringArray(str) {
    return str.toString().split(",").map(value => value.trim());
}
