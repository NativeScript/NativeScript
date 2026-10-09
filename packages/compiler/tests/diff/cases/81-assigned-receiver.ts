// @lenient
// A member called on an assignment's value (`(start = new Parser()).pipe(…)`, core's parseInternal).
class Stage {
  log: string[] = [];
  next: Stage;
  constructor(public name: string) {}
  pipe(next: Stage): Stage {
    this.next = next;
    return next;
  }
}
let start: Stage;
let end: Stage;
(start = new Stage('start')).pipe(new Stage('middle')).pipe((end = new Stage('end')));
console.log(start.name, start.next.name, start.next.next === end, end.name);
