import frames = require("ui/frame");
import observable = require("data/observable");
import imageDef = require("ui/image");
import imageSourceDef = require("image-source");
import fs = require("file-system");

export function pageLoaded(args: observable.EventData) {
    if (frames.topmost().android) {
        frames.topmost().android.cachePagesOnNavigate = true;
    }
}

export function imageLoaded(args: observable.EventData) {
    var image = <imageDef.Image>args.object;

    var logoPath = fs.path.join(__dirname, "tagLine.png");
    image.source = imageSourceDef.fromFile(logoPath);
}

export function loginButtonTap(args: observable.EventData) {
    frames.topmost().navigate("app/news");
}
