declare module "native-api" {
    export module android {
        export module app {
            export type Activity = any;
            export type Application = any;
            export type ActionBar = any;
        }
        export module os {
            export type Bundle = any;
            export type Build = any;
            export var Build: any;
            export var BatteryManager: any;
            export type Looper = any;
            export var Looper: any;
        }
        export module content {
            export type Intent = any;
            export var Intent: any;
            export type Context = any;
            export module res {
                export var Configuration: any;
            }
        }
        export module view {
            export module animation {
                export type AccelerateInterpolator = any;
                export var AccelerateInterpolator: any;
                export type DecelerateInterpolator = any;
                export var DecelerateInterpolator: any;
            }
            export module inputmethod {
                export var EditorInfo: any;
            }
            export var Gravity: any;
            export type View = any;
            export var View: any;
            export type ViewGroup = any;
            export var ViewGroup: any;
            export type IMenu = any;
            export type IMenuItem = any;
            export type MotionEvent = any;
        }
        export module location {
            export type Location = any;
            export type LocationManager = any;
        }
        export module webkit {
            export type WebView = any;
        }
        export module widget {
            export type TimePicker = any;
            export type EditText = any;
            export type Switch = any;
            export type ProgressBar = any;
            export type ListView = any;
            export var ListView: any;
            export type TextView = any;
            export type SeekBar = any;
            export type SearchView = any;
            export type NumberPicker = any;
            export type ImageView = any;
            export var ImageView: any;
            export type DatePicker = any;
            export type Button = any;
            export type ScrollView = any;
            export var ScrollView: any;
            export type HorizontalScrollView = any;
            export var HorizontalScrollView: any;
        }
        export module graphics {
            export type Typeface = any;
            export var Typeface: any;
            export type Bitmap = any;
            export module drawable {
                export type ColorDrawable = any;
            }
            export type Color = any;
            export var Color: any;
        }
        export module support {
            export module v4 {
                export module view {
                    export type ViewPager = any;
                }
            }
        }
        export module util {
            export var Log: any;
            export type DisplayMetrics = any;
        }
        export module text {
            export var InputType: any;
            export var TextUtils: any;
        }
        export module provider {
            export var Settings: any;
        }
    }

    export module java {
        export module lang {
            export var System: any;
            export var Class: any;
        }
    }
}
