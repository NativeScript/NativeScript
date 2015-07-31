declare module "native-api" {
    import global_alias = require("global_alias");
    //real Android module alias
    import ad = global_alias.ad;

    export module android {
        export module app {
            export type Activity = ad.app.Activity;
            export type Application = ad.app.Application;
            export type ActionBar = ad.app.ActionBar;
        }
        export module os {
            export type Bundle = ad.os.Bundle;
            export type Build = ad.os.Build;
            export var Build: typeof ad.os.Build;
            export var BatteryManager: typeof ad.os.BatteryManager;
            export type Looper = ad.os.Looper;
            export var Looper: typeof ad.os.Looper;
        }
        export module content {
            export type Intent = ad.content.Intent;
            export var Intent: typeof ad.content.Intent;
            export type Context = ad.content.Context;
            export module res {
                export var Configuration: typeof ad.content.res.Configuration;
            }
        }
        export module view {
            export module animation {
                export type AccelerateInterpolator = ad.view.animation.AccelerateInterpolator;
                export var AccelerateInterpolator: typeof ad.view.animation.AccelerateInterpolator;
                export type DecelerateInterpolator = ad.view.animation.DecelerateInterpolator;
                export var DecelerateInterpolator: typeof ad.view.animation.DecelerateInterpolator;
            }
            export module inputmethod {
                export var EditorInfo: typeof ad.view.inputmethod.EditorInfo;
            }
            export var Gravity: typeof ad.view.Gravity;
            export type View = ad.view.View;
            export var View: typeof ad.view.View;
            export type ViewGroup = ad.view.ViewGroup;
            export var ViewGroup: typeof ad.view.ViewGroup;
            export type IMenu = ad.view.IMenu;
            export type IMenuItem = ad.view.IMenuItem;
            export type MotionEvent = ad.view.MotionEvent;
        }
        export module location {
            export type Location = ad.location.Location;
            export type LocationManager = ad.location.LocationManager;
        }
        export module webkit {
            export type WebView = ad.webkit.WebView;
        }
        export module widget {
            export type TimePicker = ad.widget.TimePicker;
            export type EditText = ad.widget.EditText;
            export type Switch = ad.widget.Switch;
            export type ProgressBar = ad.widget.ProgressBar;
            export type ListView = ad.widget.ListView;
            export var ListView: typeof ad.widget.ListView;
            export type TextView = ad.widget.TextView;
            export type SeekBar = ad.widget.SeekBar;
            export type SearchView = ad.widget.SearchView;
            export type NumberPicker = ad.widget.NumberPicker;
            export type ImageView = ad.widget.ImageView;
            export var ImageView: typeof ad.widget.ImageView;
            export type DatePicker = ad.widget.DatePicker;
            export type Button = ad.widget.Button;
            export type ScrollView = ad.widget.ScrollView;
            export var ScrollView: typeof ad.widget.ScrollView;
            export type HorizontalScrollView = ad.widget.HorizontalScrollView;
            export var HorizontalScrollView: typeof ad.widget.HorizontalScrollView;
        }
        export module graphics {
            export type Typeface = ad.graphics.Typeface;
            export var Typeface: typeof ad.graphics.Typeface;
            export type Bitmap = ad.graphics.Bitmap;
            export module drawable {
                export type ColorDrawable = ad.graphics.drawable.ColorDrawable;
            }
            export type Color = ad.graphics.Color;
            export var Color: typeof ad.graphics.Color;
        }
        export module support {
            export module v4 {
                export module view {
                    export type ViewPager = ad.support.v4.view.ViewPager;
                }
            }
        }
        export module util {
            export var Log: typeof ad.util.Log;
            export type DisplayMetrics = ad.util.DisplayMetrics;
        }
        export module text {
            export var InputType: typeof ad.text.InputType;
            export var TextUtils: typeof ad.text.TextUtils;
        }
        export module provider {
            export var Settings: typeof ad.provider.Settings;
        }
    }

    //real Android module alias
    import aj = global_alias.aj;

    export module java {
        export module lang {
            export var System: typeof aj.lang.System;
            export var Class: typeof aj.lang.Class;
        }
    }
}
