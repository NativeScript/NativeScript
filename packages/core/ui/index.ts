export { ActionBar, ActionItem, ActionItems, NavigationButton } from './action-bar';
export { ActivityIndicator } from './activity-indicator';
export { Animation, _resolveAnimationCurve } from './animation';
export { KeyframeAnimation, KeyframeAnimationInfo, KeyframeDeclaration, KeyframeInfo } from './animation/keyframe-animation';
export type { AnimationDefinition, Pair, Transformation, TransformationType, TransformationValue, TransformFunctionsInfo, Point3D, AnimationPromise, Cancelable } from './animation/animation-types';
export * from './animation/animation-shared';
export { Builder } from './builder';
export type { LoadOptions } from './builder';
export type { ComponentModule } from './builder/component-builder';
export { sanitizeModuleName } from '../utils/common';
export { Button } from './button';
export { ContentView } from './content-view';
export { Binding } from './core/bindable';
export type { BindingOptions } from './core/bindable/bindable-types';
export { ControlStateChangeListener } from './core/control-state-change';
export { ViewBase, eachDescendant, getAncestor, getViewById, booleanConverter, querySelectorAll } from './core/view-base';
export type { ShowModalOptions } from './core/view-base';
export { View, CSSType, ContainerView, ViewHelper, AndroidHelper, IOSHelper, isUserInteractionEnabledProperty, PseudoClassHandler, CustomLayoutView } from './core/view';
export type { Template, KeyedTemplate, AddArrayFromBuilder, AddChildFromBuilder, GlassEffectConfig, GlassEffectType, GlassEffectVariant } from './core/view';
export type { ShownModallyData, Size } from './core/view/view-interfaces';
export { Property, CoercibleProperty, InheritedProperty, CssProperty, InheritedCssProperty, ShorthandProperty, CssAnimationProperty, makeParser, makeValidator } from './core/properties';
export { unsetValue } from './core/properties/property-shared';
export { addWeakEventListener, removeWeakEventListener } from './core/weak-event-listener';
export { DatePicker } from './date-picker';

// import { installPolyfills } from '../globals';
// No need to export dialogs, they are already export exported globally
import * as uiDialogs from '../ui/dialogs';
global.alert = uiDialogs.alert;
// @ts-ignore
global.confirm = uiDialogs.confirm;
// @ts-ignore
global.prompt = uiDialogs.prompt;
global.login = uiDialogs.login;
global.action = uiDialogs.action;
// global.registerModule('ui-dialogs', () => uiDialogs);
// installPolyfills('ui-dialogs', ['alert', 'confirm', 'prompt', 'login', 'action']);
export { DialogStrings, action, alert, confirm, login, prompt, getCurrentPage, Dialogs, inputType, capitalizationType } from './dialogs';
export type { DialogOptions, CancelableOptions, AlertOptions, PromptResult, PromptOptions, ActionOptions, ConfirmOptions, LoginResult, LoginOptions } from './dialogs';

export * from './editable-text-base';
export { isEmbedded } from './embedding';
export { Frame, setActivityCallbacks, NavigationType } from './frame';
export type { NavigationEntry, NavigationContext, NavigationTransition, BackstackEntry, ViewEntry, AndroidActivityCallbacks, NavigationData } from './frame';

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
export type { ItemEventData, TemplatedItemsView, ItemsSource, SearchEventData } from './list-view';
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
export type { ShadowCSSValues } from './styling/css-shadow';
export { parseCSSStroke } from './styling/css-stroke';
export type { StrokeCSSValues } from './styling/css-stroke';
export { animationTimingFunctionConverter, timeConverter } from './styling/converters';
export { Font, FontStyle, FontWeight, FontVariationSettings } from './styling/font';
export type { FontStyleType, FontWeightType, FontVariationSettingsType } from './styling/font-interfaces';
export { Style } from './styling/style';
export type { CommonLayoutParams } from './styling/style';
export * from './styling/style-properties';
export * from './styling/length-shared';
export { LinearGradient } from './styling/linear-gradient';
export { CssAnimationParser, parseKeyframeDeclarations } from './styling/css-animation-parser';
export { CSSHelper } from './styling/css-selector';

export { Switch } from './switch';
export { TabView, TabViewItem } from './tab-view';
export { TextBase, getTransformedText, letterSpacingProperty, textAlignmentProperty, textDecorationProperty, textTransformProperty, textShadowProperty, textStrokeProperty, whiteSpaceProperty, textOverflowProperty, lineHeightProperty } from './text-base';
export { FormattedString } from './text-base/formatted-string';
export { Span } from './text-base/span';
export { TextField } from './text-field';
export { TextView, WritingToolsAllowedInput, WritingToolsBehavior } from './text-view';
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
