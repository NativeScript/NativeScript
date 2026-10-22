// An app's event plumbing: handlers registered and called with event data, `args.object as View`, options
// with optional fields, and a plugin handing back an object of its own shape.
function attempt(label: string, f: () => unknown) {
  try {
    console.log(label, f());
  } catch (e) {
    console.log(label, (e as Error).name, (e as Error).message);
  }
}

interface EventData {
  eventName: string;
  object: unknown;
}
interface ChangeData extends EventData {
  value: number;
  oldValue?: number;
}
type Handler = (args: EventData) => void;

class View {
  constructor(public id: string, public visible: boolean = true) {}
  describe(): string {
    return `${this.id}${this.visible ? '' : ' (hidden)'}`;
  }
}

class Observable {
  private handlers = new Map<string, Handler[]>();
  on(name: string, handler: Handler) {
    const list = this.handlers.get(name) ?? [];
    list.push(handler);
    this.handlers.set(name, list);
  }
  notify(args: EventData): number {
    const list = this.handlers.get(args.eventName) ?? [];
    for (const h of list) h(args);
    return list.length;
  }
}

const source = new Observable();
const log: string[] = [];
source.on('tap', (args) => {
  const view = args.object as View;
  log.push('tap ' + view.describe());
});
source.on('change', (args) => {
  const change = args as ChangeData;
  log.push(`change ${change.value.toFixed(1)} from ${change.oldValue ?? 'none'}`);
});
source.on('loaded', (args) => {
  const view = args.object as View | undefined;
  log.push('loaded ' + (view?.id ?? 'nothing'));
});

attempt('tap', () => source.notify({ eventName: 'tap', object: new View('button') }));
attempt('change', () => source.notify({ eventName: 'change', object: source, value: 2, oldValue: 1 } as ChangeData));
attempt('change first', () => source.notify({ eventName: 'change', object: source, value: 3 } as ChangeData));
attempt('loaded', () => source.notify({ eventName: 'loaded', object: undefined }));
console.log(log.join(' | '));

interface Options {
  animated?: boolean;
  duration?: number;
  title?: string;
  onDone?: (ok: boolean) => void;
}
function show(view: View, options: Options): string {
  const animated = (options.animated as boolean) || false;
  const duration = options.duration ?? 300;
  const title = options.title ? options.title.trim() : 'untitled';
  options.onDone?.(animated);
  return `${view.describe()} ${animated ? 'animated' : 'still'} ${duration}ms "${title}"`;
}
attempt('show', () => show(new View('sheet'), { animated: true, duration: 150, title: ' Hello ', onDone: (ok) => log.push('done ' + ok) }));
attempt('show defaults', () => show(new View('panel', false), {}));
console.log(log.slice(-1).join(''));

// A plugin's result, typed by its declaration, with fields it may not set.
interface PluginResult {
  status: 'ok' | 'cancelled';
  count: number;
  items: string[];
  meta?: { source: string };
}
function pluginCall(cancel: boolean): PluginResult {
  return cancel ? ({ status: 'cancelled' } as PluginResult) : { status: 'ok', count: 2, items: ['a', 'b'], meta: { source: 'camera' } };
}
function summarize(r: PluginResult): string {
  const items = r.items ? r.items.join(',') : 'no items';
  return `${r.status} ${r.count} ${items} ${r.meta?.source ?? 'unknown'}`;
}
attempt('plugin', () => summarize(pluginCall(false)));
attempt('plugin cancelled', () => summarize(pluginCall(true)));
