// A generic class extended with its type argument: an override typed by it, and `any` read as the parameter's bound.
class View {
  constructor(public id: string) {}
  get kind(): string {
    return 'view';
  }
}
class Label extends View {
  text = 'hello';
  get kind(): string {
    return 'label';
  }
}
abstract class Test<T extends View> {
  private _view?: T;
  get view(): T {
    if (!this._view) this._view = this.create();
    return this._view;
  }
  abstract create(): T;
  describe(): string {
    return `${this.view.id}:${this.view.kind}`;
  }
}
class LabelTest extends Test<Label> {
  create(): Label {
    return new Label('l1');
  }
  text(): string {
    return this.view.text;
  }
}
class AnyTest extends Test<any> {
  create(): any {
    return new View('v1');
  }
}
const t = new LabelTest();
console.log(t.describe(), t.text());
console.log(new AnyTest().describe());
