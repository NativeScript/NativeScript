// The stand-ins `release.stubPlugins` opts into for binary-only plugins (`nativescript-ui-*`), which ship no TypeScript
// source to compile: each view is an empty ContentView and each method does nothing.

import { ContentView, EventData, View } from '@nativescript/core';

export interface ListViewEventData extends EventData {
  eventName: string;
  object: any;
  index: number;
  view: View | any;
  returnValue: boolean;
  groupIndex?: number;
  data?: any;
}

export interface SwipeActionsEventData extends ListViewEventData {
  mainView: View | any;
  swipeView: View | any;
}

export interface LoadOnDemandListViewEventData extends ListViewEventData {}

export class ListViewItemSnapMode {
  static Auto = 'Auto';
  static Start = 'Start';
  static End = 'End';
  static Center = 'Center';
}

export class ListViewScrollPosition {
  static Auto = 'Auto';
  static None = 'None';
  static Top = 'Top';
  static CenteredVertically = 'CenteredVertically';
  static Bottom = 'Bottom';
  static Left = 'Left';
  static CenteredHorizontally = 'CenteredHorizontally';
  static Right = 'Right';
}

export class ListViewLoadOnDemandMode {
  static None = 'None';
  static Manual = 'Manual';
  static Auto = 'Auto';
}

export class ListViewSelectionBehavior {
  static None = 'None';
  static Press = 'Press';
  static LongPress = 'LongPress';
}

export class ListViewViewType {
  static ItemView = 'ItemView';
  static HeaderView = 'HeaderView';
  static FooterView = 'FooterView';
  static GroupView = 'GroupView';
  static LoadOnDemandView = 'LoadOnDemandView';
}

export class ListViewLayoutBase {
  scrollDirection: string = 'Vertical';
  itemInsertAnimation: string = 'Default';
  itemDeleteAnimation: string = 'Default';
  itemWidth?: number;
  itemHeight?: number;
}

export class ListViewLinearLayout extends ListViewLayoutBase {
  dynamicItemSize: boolean = true;
}

export class ListViewGridLayout extends ListViewLayoutBase {
  spanCount: number = 2;
}

export class ListViewStaggeredLayout extends ListViewLayoutBase {
  spanCount: number = 2;
}

export class RadListView extends ContentView {
  items: any = null;
  listViewLayout: ListViewLayoutBase | any = null;
  itemTemplate: any = null;
  itemTemplates: any = null;
  itemTemplateSelector: any = null;
  multipleSelection: boolean = false;
  selectionBehavior: string = 'None';
  loadOnDemandMode: string = 'None';
  loadOnDemandBufferSize: number = 0;
  pullToRefresh: boolean = false;
  swipeActions: boolean = false;
  itemReorder: boolean = false;
  filteringFunction: ((item: any) => boolean) | undefined = undefined;
  sortingFunction: ((item: any, otherItem: any) => number) | undefined = undefined;
  groupingFunction: ((item: any) => any) | undefined = undefined;

  refresh(): void {}
  scrollWithAmount(_amount: number, _animate: boolean): void {}
  scrollToIndex(
    _index: number,
    _animate?: boolean,
    _snapMode?: string,
  ): void {}
  getViewForItem(_item: any): View | undefined {
    return undefined;
  }
  getSelectedItems(): any[] {
    return [];
  }
  selectAll(): void {}
  deselectAll(): void {}
  selectItemAt(_index: number): void {}
  deselectItemAt(_index: number): void {}
  isItemSelected(_item: any): boolean {
    return false;
  }
  notifyLoadOnDemandFinished(_disableLoadOnDemand?: boolean): void {}
  notifyPullToRefreshFinished(): void {}
  notifySwipeToExecuteFinished(): void {}
  resumeUpdates(_refresh: boolean): void {}
  suspendUpdates(): void {}
}

export class RadListViewComponent {
  listView: RadListView = new RadListView();
  nativeElement: RadListView = this.listView;
}

export class GaugeScale {
  minimum: number = 0;
  maximum: number = 100;
  startAngle: number = 0;
  sweepAngle: number = 360;
   radius: number = 1;
}

export class RadialScale extends GaugeScale {
  indicators: any[] = [];
}

export class GaugeIndicator {
  minimum: number = 0;
  maximum: number = 0;
  value: number = 0;
}

export class RadialIndicator extends GaugeIndicator {}

export class RadialBarIndicator extends RadialIndicator {
  location: number = 1;
  barWidth: number = 0.1;
  fillColor: any = null;
  cap: string = 'Round';
}

export class RadialNeedle extends RadialIndicator {
  length: number = 1;
  offset: number = 0;
  topWidth: number = 0;
  bottomWidth: number = 5;
  fillColor: any = null;
  strokeColor: any = null;
  strokeWidth: number = 0;
}

export class RadGauge extends ContentView {
  scales: any[] = [];
  title: string = '';
  subtitle: string = '';
}

export class RadRadialGauge extends RadGauge {}

export class RadRadialGaugeComponent {
  gauge: RadRadialGauge = new RadRadialGauge();
  nativeElement: RadRadialGauge = this.gauge;
}

export class SideDrawerLocation {
  static Left = 'Left';
  static Right = 'Right';
  static Top = 'Top';
  static Bottom = 'Bottom';
}

export class DrawerTransitionBase {}
export class FadeTransition extends DrawerTransitionBase {}
export class PushTransition extends DrawerTransitionBase {}
export class RevealTransition extends DrawerTransitionBase {}
export class ReverseSlideOutTransition extends DrawerTransitionBase {}
export class ScaleDownPusherTransition extends DrawerTransitionBase {}
export class ScaleUpTransition extends DrawerTransitionBase {}
export class SlideAlongTransition extends DrawerTransitionBase {}
export class SlideInOnTopTransition extends DrawerTransitionBase {}

export interface DrawerStateChangingEventArgs extends EventData {
  eventName: string;
  object: any;
  returnValue: boolean;
}

export interface DrawerStateChangedEventArgs extends EventData {
  eventName: string;
  object: any;
}

export class RadSideDrawer extends ContentView {
  drawerContent: View | any = null;
  mainContent: View | any = null;
  drawerLocation: string = 'Left';
  drawerContentSize: number = 280;
  drawerTransition: DrawerTransitionBase | any = null;
  gesturesEnabled: boolean = true;
  allowEdgeSwipe: boolean = true;
  showOverNavigation: boolean = false;

  showDrawer(): void {}
  closeDrawer(): void {}
  toggleDrawerState(): void {}
  getIsOpen(): boolean {
    return false;
  }
}

export class RadSideDrawerComponent {
  sideDrawer: RadSideDrawer = new RadSideDrawer();
  nativeElement: RadSideDrawer = this.sideDrawer;
  showDrawer(): void {}
  closeDrawer(): void {}
  toggleDrawerState(): void {}
}

export class RadCalendar extends ContentView {}
export class RadDataForm extends ContentView {}
export class RadAutoCompleteTextView extends ContentView {}
export class RadCartesianChart extends ContentView {}
export class RadPieChart extends ContentView {}

export class NativeScriptUIListViewModule {}
export class NativeScriptUIGaugeModule {}
export class NativeScriptUISideDrawerModule {}
export class NativeScriptUICalendarModule {}
export class NativeScriptUIDataFormModule {}
export class NativeScriptUIAutoCompleteTextViewModule {}
export class NativeScriptUIChartModule {}
