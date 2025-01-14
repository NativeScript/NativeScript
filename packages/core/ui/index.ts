export { ActionBar, ActionItem, ActionItems, NavigationButton } from './action-bar';
export { ActivityIndicator } from './activity-indicator';
export { Animation, KeyframeAnimation, KeyframeAnimationInfo, KeyframeDeclaration, KeyframeInfo } from './animation';
export type { AnimationDefinition } from './animation';
export { Builder } from './builder';
export type { LoadOptions } from './builder';
export type { ComponentModule } from './builder/component-builder';
export { sanitizeModuleName } from '../utils/common';
export { Button } from './button';
export { ContentView } from './content-view';
export { Binding } from './core/bindable';
export type { BindingOptions } from './core/bindable';
export { ControlStateChangeListener } from './core/control-state-change';
export { ViewBase, eachDescendant, getAncestor, getViewById, booleanConverter, querySelectorAll } from './core/view-base';
export type { ShowModalOptions } from './core/view-base';
export { View, CSSType, ContainerView, ViewHelper, AndroidHelper, IOSHelper, isUserInteractionEnabledProperty, PseudoClassHandler, CustomLayoutView } from './core/view';
export type { Template, KeyedTemplate, ShownModallyData, AddArrayFromBuilder, AddChildFromBuilder, Size } from './core/view';
export { Property, CoercibleProperty, InheritedProperty, CssProperty, InheritedCssProperty, ShorthandProperty, CssAnimationProperty, unsetValue, makeParser, makeValidator } from './core/properties';
export { addWeakEventListener, removeWeakEventListener } from './core/weak-event-listener';
export { DatePicker } from './date-picker';

// No need go export dialogs, they are already export exported globally
export { DialogStrings, action, alert, confirm, login, prompt, getCurrentPage, Dialogs, inputType, capitalizationType } from './dialogs';
export type { DialogOptions, CancelableOptions, AlertOptions, PromptResult, PromptOptions, ActionOptions, ConfirmOptions, LoginResult, LoginOptions } from './dialogs';

export * from './editable-text-base';
export { isEmbedded } from './embedding';
export { Frame, setActivityCallbacks } from './frame';
export type { NavigationEntry, NavigationContext, NavigationTransition, BackstackEntry, ViewEntry, AndroidActivityCallbacks } from './frame';

export { GesturesObserver, TouchAction, GestureTypes, GestureStateTypes, SwipeDirection, GestureEvents, TouchManager } from './gestures';
export type { GestureEventData, GestureEventDataWithState, TapGestureEventData, PanGestureEventData, PinchGestureEventData, RotationGestureEventData, SwipeGestureEventData, TouchGestureEventData, TouchAnimationOptions, VisionHoverOptions } from './gestures';

export { HtmlView } from './html-view';
export { Image, ImageSymbolEffect, ImageSymbolEffects } from './image';
export { Cache as ImageCache } from './image-cache';
export type { DownloadError, DownloadRequest, DownloadedData } from './image-cache';
export { Label } from './label';

export * from './layouts'; // barrel export

export { ListPicker } from './list-picker';
export { ListView } from './list-view';
export type { ItemEventData, TemplatedItemsView, ItemsSource } from './list-view';
export { Page, PageBase } from './page';
export type { NavigatedData } from './page';
export { Placeholder } from './placeholder';
export type { CreateViewEventData } from './placeholder';
export { Progress } from './progress';
export { ProxyViewContainer } from './proxy-view-container';
export { Repeater } from './repeater';
export { ScrollView } from './scroll-view';
export type { ScrollEventData } from './scroll-view';
export { SearchBar } from './search-bar';
export { SegmentedBar, SegmentedBarItem } from './segmented-bar';
export type { SelectedIndexChangedEventData } from './segmented-bar';
export { Slider } from './slider';
export type { AccessibilityDecrementEventData, AccessibilityIncrementEventData } from './slider';

export { addTaggedAdditionalCSS, removeTaggedAdditionalCSS, resolveFileNameFromUrl } from './styling/style-scope';
export { Background } from './styling/background';
export type { CacheMode } from './styling/background';
export { parseCSSShadow } from './styling/css-shadow';
export { animationTimingFunctionConverter, timeConverter } from './styling/converters';
export { Font, FontStyle, FontWeight, FontVariationSettings } from './styling/font';
export { Style } from './styling/style';
export type { CommonLayoutParams } from './styling/style';
export * from './styling/style-properties';
export { CssAnimationParser, parseKeyframeDeclarations } from './styling/css-animation-parser';
export { CSSHelper } from './styling/css-selector';

export { Switch } from './switch';
export { TabView, TabViewItem } from './tab-view';
export { TextBase, getTransformedText, letterSpacingProperty, textAlignmentProperty, textDecorationProperty, textTransformProperty, textShadowProperty, textStrokeProperty, whiteSpaceProperty, textOverflowProperty, lineHeightProperty } from './text-base';
export { FormattedString } from './text-base/formatted-string';
export { Span } from './text-base/span';
export { TextField } from './text-field';
export { TextView } from './text-view';
export { TimePicker } from './time-picker';
export { Transition } from './transition';
export { ModalTransition } from './transition/modal-transition';
export { PageTransition } from './transition/page-transition';
export { FadeTransition } from './transition/fade-transition';
export { SlideTransition } from './transition/slide-transition';
export { SharedTransition, SharedTransitionAnimationType } from './transition/shared-transition';
export { SharedTransitionHelper } from './transition/shared-transition-helper';
export type { SharedTransitionConfig, SharedTransitionTagProperties } from './transition/shared-transition';
export { WebView } from './web-view';
export type { LoadEventData, WebViewNavigationType } from './web-view';
