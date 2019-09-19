import { isIOS, isAndroid } from "tns-core-modules/platform";
import * as fs from "tns-core-modules/file-system/file-system";
import * as utils from "tns-core-modules/utils/utils";

export function openFile() {
    let directory;
    if (isIOS) {
        directory = fs.knownFolders.ios.downloads();
    } else if (isAndroid) {
        directory = android.os.Environment.getExternalStorageDirectory().getAbsolutePath().toString();
    }

    const filePath = fs.path.join(directory, "Test_File_Open.txt");
    utils.openFile(filePath);
}
