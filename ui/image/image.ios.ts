import imageCommon = require("ui/image/image-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import definition = require("ui/image");
import enums = require("ui/enums");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(imageCommon, exports);

function onStretchPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var image = <Image>data.object;

    switch (data.newValue) {
        case enums.Stretch.aspectFit:
            image.ios.contentMode = UIViewContentMode.UIViewContentModeScaleAspectFit;
            break;
        case enums.Stretch.aspectFill:
            image.ios.contentMode = UIViewContentMode.UIViewContentModeScaleAspectFill;
            break;
        case enums.Stretch.fill:
            image.ios.contentMode = UIViewContentMode.UIViewContentModeScaleToFill;
            break;
        case enums.Stretch.none:
        default:
            image.ios.contentMode = UIViewContentMode.UIViewContentModeTopLeft;
            break;
    }
}

function onImageSourcePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var image = <Image>data.object;
    image._setNativeImage(data.newValue ? data.newValue.ios : null);
}

// register the setNativeValue callback
(<proxy.PropertyMetadata>imageCommon.Image.imageSourceProperty.metadata).onSetNativeValue = onImageSourcePropertyChanged;
(<proxy.PropertyMetadata>imageCommon.Image.stretchProperty.metadata).onSetNativeValue = onStretchPropertyChanged;



export class Image extends imageCommon.Image {
    private _ios: UIImageView;

    constructor(options?: definition.Options) {
        super(options);

        //TODO: Think of unified way of setting all the default values.
        this._ios = new UIImageView();
        this._ios.contentMode = UIViewContentMode.UIViewContentModeScaleAspectFit;
        this._ios.clipsToBounds = true;
        super._prepareNativeView(this._ios);
    }

    get ios(): UIImageView {
        return this._ios;
    }

    public _setNativeImage(nativeImage: any) {
        this.ios.image = nativeImage;

        if (isNaN(this.width) || isNaN(this.height)) {
            this.requestLayout();
        }
    }
} 