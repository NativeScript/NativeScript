
import observable = require("ui/core/observable");
import view = require("ui/core/view");
import application = require("application");
import imageSource = require("image-source");

export class Image extends view.View {
    private static sourceProperty = "source";
    private _source: imageSource.ImageSource;
    private _android: android.widget.ImageView;

    constructor() {
        super();

        // TODO: Verify that this is always true
        var context = application.android.currentContext;
        if (!context) {
            // TODO: Delayed loading?
        }

        this._android = new android.widget.ImageView(context);

    }

    get android(): android.widget.ImageView {
        return this._android;
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
            this._android.setImageBitmap(data.value.android);
        } else if (true) {
        }
    }
}
