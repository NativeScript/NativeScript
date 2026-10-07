// @lenient
// A method declared to return `string | null`, which code checked without strictNullChecks reads as
// `string`: null still means missing, as core's style gives for an undeclared CSS variable.
class Scope {
  vars = new Map<string, string>();
  getVariable(name: string): string | null {
    if (this.vars.has(name)) {
      return this.vars.get(name);
    }
    return null;
  }
}
class Child extends Scope {
  getVariable(name: string): string {
    return name === '--own' ? 'teal' : super.getVariable(name);
  }
}
function evaluate(scope: Scope, expression: string): string {
  const [name, ...fallback] = expression.split(',').map((v) => v.trim());
  let value = scope.getVariable(name);
  if (value === null && fallback.length) {
    value = fallback.join(', ');
  }
  if (!value) {
    value = 'unset';
  }
  return value;
}
const scope = new Child();
scope.vars.set('--accent', 'red');
console.log(evaluate(scope, '--accent'), evaluate(scope, '--missing, green'), evaluate(scope, '--missing'), evaluate(scope, '--own'));
abstract class Window {
  protected abstract appearance(): 'light' | 'dark' | null;
  describe(): string {
    const value = this.appearance();
    return value === null ? 'unknown' : value;
  }
}
class Detached extends Window {
  protected appearance(): 'light' | 'dark' | null {
    return null;
  }
}
class Shown extends Window {
  protected appearance(): 'light' | 'dark' | null {
    return 'dark';
  }
}
console.log(new Detached().describe(), new Shown().describe());
