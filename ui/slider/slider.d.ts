declare module "ui/slider" {

    class Slider {
        android: android.widget.SeekBar;
        ios: UIKit.UISlider;

        value: number;
        maxValue: number;
    }
}