declare module "ui/image" {

    import imageSource = require("image-source");

    class Image {
        android: android.widget.ImageView;
        ios: UIKit.UIImageView;

        source: imageSource.ImageSource;
    }
}