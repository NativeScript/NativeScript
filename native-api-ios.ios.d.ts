declare type native_NSObjectType = typeof NSObject;
declare type native_NSRunLoopType = typeof NSRunLoop;
declare type native_NSDateType = typeof NSDate;
declare type native_UIColor = UIColor;
declare type native_UIApplication = UIApplication;
declare type native_UIView = UIView;
declare type native_UIViewType = typeof UIView;
declare type native_UIViewController = UIViewController;

declare type native_UIControl = UIControl;
declare type native_CGRect = CGRect;
declare type native_UIDatePicker = UIDatePicker;
declare type native_UIWebView = UIWebView;
declare type native_UITextView = UITextView;
declare type native_UITabBarController = UITabBarController;
declare type native_UITextField = UITextField;
declare type native_UISwitch = UISwitch;
declare type native_UISlider = UISlider;
declare type native_UISearchBar = UISearchBar;
declare type native_UIProgressView = UIProgressView;
declare type native_UITableView = UITableView;
declare type native_UITableViewType = typeof UITableView;
declare type native_UITableViewCell = UITableViewCell;
declare type native_UITableViewCellType = typeof UITableViewCell;
declare type native_UIPickerView = UIPickerView;
declare type native_UILabel = UILabel;
declare type native_UIImage = UIImage;
declare type native_UIImageView = UIImageView;
declare type native_UIGestureRecognizer = UIGestureRecognizer;
declare type native_UINavigationController = UINavigationController;
declare type native_UIButton = UIButton;
declare type native_UIControlState = UIControlState;
declare type native_UIControlStateType = typeof UIControlState;

declare type native_UIActivityIndicatorView = UIActivityIndicatorView;
declare type native_CLLocation = CLLocation;
declare type native_CLLocationManager = CLLocationManager;
declare type native_CLLocationManagerType = typeof CLLocationManager;

declare type native_UIKeyboardTypeType = typeof UIKeyboardType;
declare type native_UIReturnKeyTypeType = typeof UIReturnKeyType;
declare type native_UIControlEventsType = typeof UIControlEvents;
declare type native_NSIndexPathType = typeof NSIndexPath;
declare type native_NSLineBreakModeType = typeof NSLineBreakMode;

declare type native_UIScrollView = UIScrollView;
declare type native_UIScrollViewType = typeof UIScrollView;

declare type native_UIViewContentModeType = typeof UIViewContentMode;
declare type native_UIDeviceType = typeof UIDevice;
declare type native_UIScreenType = typeof UIScreen;

declare type native_NSNotification = NSNotification;
declare type native_NSNotificationType = typeof NSNotification;
declare type native_UIDeviceBatteryLevelDidChangeNotificationType = typeof UIDeviceBatteryLevelDidChangeNotification;
declare type native_UIFont = UIFont;
declare type native_UIFontType = typeof UIFont;
declare type native_UIViewAnimationCurveType = typeof UIViewAnimationCurve;

declare module "native-api" {
    export var NSObject: native_NSObjectType;
    export var NSRunLoop: native_NSRunLoopType;
    export var NSDate: native_NSDateType;
    export type UIColor = native_UIColor;
    export type UIApplication = native_UIApplication;
    export type UIView = native_UIView;
    export var UIView: native_UIViewType;
    export type UIViewController = native_UIViewController;

    export type UIControl = native_UIControl;
    export type CGRect = native_CGRect;
    export type UIDatePicker = native_UIDatePicker;
    export type UIWebView = native_UIWebView;
    export type UITextView = native_UITextView;
    export type UITabBarController = native_UITabBarController;
    export type UITextField = native_UITextField;
    export type UISwitch = native_UISwitch;
    export type UISlider = native_UISlider;
    export type UISearchBar = native_UISearchBar;
    export type UIProgressView = native_UIProgressView;
    export type UITableView = native_UITableView;
    export var UITableView: native_UITableViewType;
    export type UITableViewCell = native_UITableViewCell;
    export var UITableViewCell: native_UITableViewCellType;
    export type UIPickerView = native_UIPickerView;
    export type UILabel = native_UILabel;
    export type UIImage = native_UIImage;
    export type UIImageView = native_UIImageView;
    export type UIGestureRecognizer = native_UIGestureRecognizer;
    export type UINavigationController = native_UINavigationController;
    export type UIButton = native_UIButton;
    export type UIControlState = native_UIControlState;
    export var UIControlState: native_UIControlStateType;

    export type UIActivityIndicatorView = native_UIActivityIndicatorView;
    export type CLLocation = native_CLLocation;
    export type CLLocationManager = native_CLLocationManager;
    export var CLLocationManager: native_CLLocationManagerType;

    export var UIKeyboardType: native_UIKeyboardTypeType;
    export var UIReturnKeyType: native_UIReturnKeyTypeType;
    export var UIControlEvents: native_UIControlEventsType;
    export var NSIndexPath: native_NSIndexPathType;
    export var NSLineBreakMode: native_NSLineBreakModeType;

    export type UIScrollView = native_UIScrollView;
    export var UIScrollView: native_UIScrollViewType;

    export var UIViewContentMode: native_UIViewContentModeType;
    export var UIDevice: native_UIDeviceType;
    export var UIScreen: native_UIScreenType;
    export var UIFont: native_UIFontType;

    export type NSNotification = native_NSNotification;
    export var NSNotification :native_NSNotificationType;
    export var UIViewAnimationCurve: native_UIViewAnimationCurveType;
    export type UIDeviceBatteryLevelDidChangeNotification = native_UIDeviceBatteryLevelDidChangeNotificationType;
    export var UIDeviceBatteryLevelDidChangeNotification: native_UIDeviceBatteryLevelDidChangeNotificationType;

    export type UIFont = native_UIFont;
    export var UIFont: native_UIFontType;
}
