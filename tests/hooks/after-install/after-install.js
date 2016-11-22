var childProcess = require("child_process");

module.exports = function(logger, platformsData, projectData, hookArgs) {
    if (/apk$/.test(hookArgs.packageFilePath)) {
        var writeCommand = "adb shell pm grant " + projectData.projectId + " android.permission.WRITE_EXTERNAL_STORAGE";
        var readCommand = "adb shell pm grant " + projectData.projectId + " android.permission.READ_EXTERNAL_STORAGE";
        var callback = function(error, stdout, stderr) {
            if (error) {
                console.log(error);
            }
        };
        childProcess.exec(writeCommand, {
            cwd: projectData.projectDir
        }, callback);
        childProcess.exec(readCommand, {
            cwd: projectData.projectDir
        }, callback);
    }
}
