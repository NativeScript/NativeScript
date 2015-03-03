import fs = require("file-system");
import imageSource = require("image-source");

export function pageLoaded(args) {
    var page = args.object;
    
    var telerikLogo = imageSource.fromFile(fs.path.join(__dirname, "../res/telerik-logo.png"));

    page.bindingContext = { imageSource: telerikLogo };
}