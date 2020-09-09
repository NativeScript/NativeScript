// using import is important to ensure webpack keep it in order
import './globals';

// Register "dynamically" loaded module that need to be resolved by the
// XML/component builders.
import * as coreUIModules from './ui/index';
global.registerModule('@nativescript/core/ui', () => coreUIModules);

// global.registerModule('text/formatted-string', () => require('./text/formatted-string'));
// global.registerModule('text/span', () => require('./text/span'));
// global.registerModule('ui/text-base/formatted-string', () => require('./ui/text-base/formatted-string'));
// global.registerModule('ui/text-base/span', () => require('./ui/text-base/span'));
// global.registerModule('ui/action-bar', () => require('./ui/action-bar'));
// global.registerModule('ui/activity-indicator', () => require('./ui/activity-indicator'));
// global.registerModule('ui/bottom-navigation', () => require('./ui/bottom-navigation'));
// global.registerModule('ui/button', () => require('./ui/button'));
// global.registerModule('ui/content-view', () => require('./ui/content-view'));
// global.registerModule('ui/date-picker', () => require('./ui/date-picker'));
// global.registerModule('ui/frame', () => require('./ui/frame'));
// global.registerModule('ui/html-view', () => require('./ui/html-view'));
// global.registerModule('ui/image', () => require('./ui/image'));
// global.registerModule('ui/label', () => require('./ui/label'));
// global.registerModule('ui/layouts/absolute-layout', () => require('./ui/layouts/absolute-layout'));
// global.registerModule('ui/layouts/dock-layout', () => require('./ui/layouts/dock-layout'));
// global.registerModule('ui/layouts/grid-layout', () => require('./ui/layouts/grid-layout'));
// global.registerModule('ui/layouts/stack-layout', () => require('./ui/layouts/stack-layout'));
// global.registerModule('ui/layouts/flexbox-layout', () => require('./ui/layouts/flexbox-layout'));
// global.registerModule('ui/layouts/wrap-layout', () => require('./ui/layouts/wrap-layout'));
// global.registerModule('ui/list-picker', () => require('./ui/list-picker'));
// global.registerModule('ui/page', () => require('./ui/page'));
// global.registerModule('ui/placeholder', () => require('./ui/placeholder'));
// global.registerModule('ui/progress', () => require('./ui/progress'));
// global.registerModule('ui/proxy-view-container', () => require('./ui/proxy-view-container'));
// global.registerModule('ui/repeater', () => require('./ui/repeater'));
// global.registerModule('ui/scroll-view', () => require('./ui/scroll-view'));
// global.registerModule('ui/search-bar', () => require('./ui/search-bar'));
// global.registerModule('ui/segmented-bar', () => require('./ui/segmented-bar'));
// global.registerModule('ui/slider', () => require('./ui/slider'));
// global.registerModule('ui/switch', () => require('./ui/switch'));
// global.registerModule('ui/tab-view', () => require('./ui/tab-view'));
// global.registerModule('ui/tab-navigation-base/tab-strip', () => require('./ui/tab-navigation-base/tab-strip'));
// global.registerModule('ui/tab-navigation-base/tab-strip-item', () => require('./ui/tab-navigation-base/tab-strip-item'));
// global.registerModule('ui/tab-navigation-base/tab-content-item', () => require('./ui/tab-navigation-base/tab-content-item'));
// global.registerModule('ui/tabs', () => require('./ui/tabs'));
// global.registerModule('ui/web-view', () => require('./ui/web-view'));
// global.registerModule('ui/text-field', () => require('./ui/text-field'));
// global.registerModule('ui/text-view', () => require('./ui/text-view'));
// global.registerModule('ui/time-picker', () => require('./ui/time-picker'));
// global.registerModule('ui/list-view', () => require('./ui/list-view'));
