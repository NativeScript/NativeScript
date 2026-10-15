import { Application, EventData, Property, Screen, View } from '@nativescript/core';

// Values core's typings give present that the kit holds optional (a module constant, a static, a function-typed member, an inherited getter).
class Pager extends View {
  pageId(): string {
    return this.page ? this.page.id : '';
  }
}
const indexProperty = new Property<Pager, number>({ name: 'index', defaultValue: 0 });
indexProperty.register(Pager);

export function kitOptionalValues(pager: Pager): number {
  const handler = (args: EventData) => console.log(args.eventName);
  Application.on(Application.suspendEvent, handler);
  Application.off(Application.suspendEvent, handler);
  indexProperty.nativeValueChange(pager, 1);
  console.log(pager.pageId(), Application.ios.rootController);
  return Screen.mainScreen.widthDIPs + Screen.mainScreen.scale;
}
