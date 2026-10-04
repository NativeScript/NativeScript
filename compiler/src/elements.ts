/** The @nativescript/core elements the release build renders (NativeScriptKit's classes). */
export const ELEMENTS = new Set([
  'Frame', 'Page', 'ActionBar', 'StackLayout', 'GridLayout', 'ScrollView', 'ContentView',
  'Label', 'Button', 'TextField', 'Switch', 'Slider', 'SegmentedBar', 'SegmentedBarItem', 'Image', 'ActivityIndicator',
  'ListView',
  'FlexboxLayout', 'WrapLayout', 'AbsoluteLayout', 'DockLayout', 'RootLayout',
]);

/** Two-way bindings (`v-model`, `[(ngModel)]`, `bind:value`): the property, its change event and the value's type. */
export const MODELS: Record<string, { prop: string; event: string; type: string }> = {
  TextField: { prop: 'text', event: 'textChange', type: 'string' },
  Switch: { prop: 'checked', event: 'checkedChange', type: 'boolean' },
  Slider: { prop: 'value', event: 'valueChange', type: 'number' },
  SegmentedBar: { prop: 'selectedIndex', event: 'selectedIndexChange', type: 'number' },
};

/** Element names as each framework spells them (`stackLayout`, `stacklayout`), to the canonical class name. */
export function canonical(tag: string): string | null {
  const lower = tag.toLowerCase();
  for (const e of ELEMENTS) if (e.toLowerCase() === lower) return e;
  return null;
}
