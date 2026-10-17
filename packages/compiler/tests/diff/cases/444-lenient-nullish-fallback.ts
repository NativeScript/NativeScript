// @lenient-both
// `a ?? b` where `a` is a call that gives null or an optional chain that stops: the fallback applies, as nothing has
// converted the missing value to a string, number or boolean first.
class Window {
  constructor(private appearance: 'dark' | 'light' | null) {}
  systemAppearance(): 'dark' | 'light' | null {
    return this.appearance;
  }
  scale(): number {
    return this.appearance ? 2 : null;
  }
}

class App {
  primaryWindow: Window;
  private _systemAppearance: 'dark' | 'light' | null;
  private lookups = 0;
  getSystemAppearance(): 'dark' | 'light' | null {
    this.lookups++;
    return 'light';
  }
  systemAppearance(): 'dark' | 'light' | null {
    return this.primaryWindow?.systemAppearance() ?? (this._systemAppearance ??= this.getSystemAppearance());
  }
  scale(): number {
    return this.primaryWindow?.scale() ?? 1;
  }
  report(label: string) {
    // Lenient code holds null as undefined: printed through a fallback, which treats both alike.
    console.log(label, this.systemAppearance() ?? 'none', this.systemAppearance() ?? 'none', this.lookups, this.scale());
  }
}

const app = new App();
app.report('no window');
app.primaryWindow = new Window(null);
app.report('window without appearance');
app.primaryWindow = new Window('dark');
app.report('dark window');

class Headless extends App {
  getSystemAppearance(): 'dark' | 'light' | null {
    return null;
  }
}
new Headless().report('headless');
