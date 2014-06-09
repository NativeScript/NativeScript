
import observable = require("ui/core/observable");
import view = require("ui/core/view");
import imageSource = require("image-source");

export class Image extends view.View {
    private static sourceProperty = "source";
    private _source: imageSource.ImageSource;
    private _ios: UIKit.UIImageView;

    constructor() {
        super();
        this._ios = new UIKit.UIImageView();
    }

    get ios(): UIKit.UIImageView {
        return this._ios;
    }

    get source(): imageSource.ImageSource {
        return this._source;
    }

    set source(value: imageSource.ImageSource) {
        this.setProperty(Image.sourceProperty, value);
    }

    public setNativeProperty(data: observable.PropertyChangeData) {
        if (data.propertyName === Image.sourceProperty) {
            this._source = data.value;
            this._ios.image = this._source.ios;
            this._ios.sizeToFit();
        } else if (true) {
        }
    }
} 