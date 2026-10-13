/**
 * Android APIs, deprecated in the SDK the kit compiles against, that core calls on purpose: the Android versions it
 * supports (minSdk 24) have no replacement for them, or core keeps an older behavior apps rely on. A declaration using
 * one is marked `@Suppress("DEPRECATION")`; any other deprecated API stays a warning, which fails the kit's strict build.
 *
 * Keys are a class's internal name, for the class and everything it declares, or `class#member`.
 */
const ALLOWED = new Set([
  // Accessibility roles and announcements on API 24–29.
  'android/inputmethodservice/Keyboard',
  'android/inputmethodservice/Keyboard$Key',
  'android/view/accessibility/AccessibilityEvent#MAX_TEXT_LENGTH',
  'android/view/accessibility/AccessibilityEvent#TYPE_ANNOUNCEMENT',
  'android/view/accessibility/AccessibilityEvent#obtain',
  'android/view/accessibility/AccessibilityNodeInfo#setChecked',
  // Connectivity before NetworkCallback (API 24–27).
  'android/net/NetworkInfo',
  'android/net/ConnectivityManager#getActiveNetworkInfo',
  'android/net/ConnectivityManager#CONNECTIVITY_ACTION',
  // System bars before WindowInsetsController (API 24–29).
  'android/view/View#getSystemUiVisibility',
  'android/view/View#setSystemUiVisibility',
  'android/view/View#SYSTEM_UI_FLAG_LIGHT_STATUS_BAR',
  'android/view/Window#getStatusBarColor',
  'android/view/Window#setStatusBarColor',
  'android/view/WindowManager$LayoutParams#FLAG_TRANSLUCENT_STATUS',
  // Views and resources as core has always drawn them.
  'android/view/View#setBackgroundDrawable',
  'android/view/View#getDrawingCache',
  'android/view/View#setDrawingCacheEnabled',
  'android/view/View#getDrawingCacheBackgroundColor',
  'android/content/res/Resources#getDrawable',
  'android/content/res/Configuration#locale',
  'android/os/Build$VERSION#SDK',
  'android/text/Html#fromHtml',
  'android/widget/DatePicker#setCalendarViewShown',
  'android/widget/TimePicker#setCurrentHour',
  'android/widget/TimePicker#setCurrentMinute',
  // TabView's and SegmentedBar's TabHost.
  'android/widget/TabHost',
  'android/widget/TabWidget',
  // Callbacks core implements for the Android versions that still call them.
  'android/app/Activity#onBackPressed',
  'androidx/activity/ComponentActivity#onBackPressed',
  'android/content/ComponentCallbacks#onLowMemory',
  'android/webkit/WebViewClient#onReceivedError',
  'android/webkit/WebViewClient#shouldOverrideUrlLoading',
  // TabView's pager adapter, overriding PagerAdapter's View-taking methods ViewPager still calls.
  'androidx/viewpager/widget/PagerAdapter#startUpdate',
  'androidx/viewpager/widget/PagerAdapter#instantiateItem',
  'androidx/viewpager/widget/PagerAdapter#destroyItem',
  'androidx/viewpager/widget/PagerAdapter#setPrimaryItem',
  'androidx/viewpager/widget/PagerAdapter#finishUpdate',
  // Fragments and gestures as core's frame and gesture modules use them.
  'androidx/fragment/app/Fragment#setHasOptionsMenu',
  'androidx/fragment/app/Fragment#getFragmentManager',
  'androidx/fragment/app/Fragment#setUserVisibleHint',
  'androidx/core/view/GestureDetectorCompat',
]);

/** Whether core may use a deprecated API (`android/view/View#setSystemUiVisibility`, or a class). */
export function allowedDeprecation(api: string): boolean {
  if (ALLOWED.has(api)) return true;
  const [owner] = api.split('#');
  for (let cls = owner; ; cls = cls.slice(0, cls.lastIndexOf('$'))) {
    if (ALLOWED.has(cls)) return true;
    if (!cls.includes('$')) return false;
  }
}
