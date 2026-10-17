// @plugin
// A plugin's namespace, enum, interface and type named as the kit's own (ui-chart's `Utils`), used by the plugin and the app,
// and the app's own interface, namespace and enum named so, and a namespace's interface named as another declaration.
import { Color, Screen as Display, Trace, Utils, describe } from './helpers/plugin/charting.ts';
import { Http, Page, Screen, Settings } from './helpers/kit-names/theme.ts';

const color: Color = { name: 'red', alpha: 0.5 };
const screen: Display = { width: 3, height: 4 };
console.log(Utils.scaled(3), Utils.unit, Trace.Verbose, Trace[Trace.Off]);
console.log(describe(color, screen, Trace.Verbose));
const colors: Color[] = [color, { name: 'blue', alpha: 1 }];
console.log(colors.map((c) => c.name).join(), colors.length);

const pages: Page[] = [{ title: 'home', depth: 0 }, { title: 'about', depth: 1 }];
console.log(pages.map((p) => Http.path(p)).join(' '), Screen.Tablet, Screen[Screen.Phone]);
const traces: Settings.Trace[] = [{ level: 2, label: 'net' }];
console.log(traces.map((t) => Settings.describe(t)).join(), traces[0].level);
