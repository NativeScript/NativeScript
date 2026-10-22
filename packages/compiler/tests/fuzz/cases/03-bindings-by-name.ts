// @members-by-name
// Values a template binding writes and reads by name, as core's Builder and a binding context do: the value
// comes from XML or another model untyped, and the class's typed members receive it.
function attempt(label: string, f: () => unknown) {
  try {
    console.log(label, f());
  } catch (e) {
    console.log(label, (e as Error).name, (e as Error).message);
  }
}

class Label {
  text: string = '';
  fontSize: number = 14;
  visible: boolean = true;
  className?: string;
  render(): string {
    const size = this.fontSize > 20 ? 'large' : 'normal';
    return `${this.visible ? 'shown' : 'hidden'} ${size} "${this.text}"${this.className ? ' .' + this.className : ''}`;
  }
}

function bind(target: object, key: string, value: unknown) {
  (target as any)[key] = value;
}
function read(target: object, key: string): unknown {
  return (target as any)[key];
}

const label = new Label();
const context: Record<string, unknown> = { title: 'Welcome', size: 24, show: true, style: 'heading' };
attempt('bind text', () => {
  bind(label, 'text', context['title']);
  return label.render();
});
attempt('bind size', () => {
  bind(label, 'fontSize', context['size']);
  return label.render();
});
attempt('bind visible', () => {
  bind(label, 'visible', context['show']);
  return label.render();
});
attempt('bind class', () => {
  bind(label, 'className', context['style']);
  return label.render();
});
attempt('read', () => [read(label, 'text'), read(label, 'fontSize'), read(label, 'visible')].join(','));

function converter(value: number, digits: number): string {
  return value.toFixed(digits);
}
attempt('convert', () => converter(read(label, 'fontSize') as number, 1));
const flag = read(label, 'visible') as boolean;
attempt('flag', () => (flag ? 'yes' : 'no'));
