// A plugin's generic class hierarchy: classes bounded by others, specialized by subclasses, named with arguments.
export class Point {
  constructor(public x: number, public y: number) {}
  describe() {
    return `${this.x},${this.y}`;
  }
}

export class StackedPoint extends Point {
  stack = [1, 2];
  describe() {
    return `${super.describe()}+${this.stack.length}`;
  }
}

export interface ISeries<T extends Point> {
  label: string;
  pointAt(i: number): T;
  size(): number;
}

export class Series<T extends Point> implements ISeries<T> {
  constructor(public points: T[], public label: string) {}
  pointAt(i: number): T {
    return this.points[i];
  }
  size() {
    return this.points.length;
  }
  get yMax() {
    return Math.max(...this.points.map((p) => p.y));
  }
  map<R>(f: (p: T) => R): R[] {
    return this.points.map(f);
  }
}

export class StackedSeries extends Series<StackedPoint> {
  barWidth = 0.5;
}

export class SeriesSet<U extends Point, T extends ISeries<U>> {
  sets: T[];
  constructor(sets: T[]) {
    this.sets = sets;
  }
  setAt(i: number): T {
    return this.sets[i];
  }
  count(): number {
    return this.sets.reduce((n, s) => n + s.size(), 0);
  }
}

export class StackedSet extends SeriesSet<StackedPoint, StackedSeries> {}

export abstract class Plot<U extends Point, D extends ISeries<U>, T extends SeriesSet<U, D>> {
  protected data: T;
  listeners: ((plot: Plot<U, D, T>) => void)[] = [];
  setData(data: T) {
    this.data = data;
    for (const l of this.listeners) l(this);
  }
  getData(): T {
    return this.data;
  }
  abstract describe(): string;
}

export abstract class GridPlot<U extends Point, D extends ISeries<U>, T extends SeriesSet<U, D>> extends Plot<U, D, T> {
  jobs: Job[] = [];
  moveTo(x: number) {
    this.jobs.push(MoveJob.getInstance(this, x));
  }
}

export class Job {
  constructor(protected plot: GridPlot<any, any, any>) {}
  run(): string {
    return this.plot.describe();
  }
}

export class MoveJob extends Job {
  constructor(plot: GridPlot<Point, ISeries<Point>, SeriesSet<Point, ISeries<Point>>>, private x: number) {
    super(plot);
  }
  static getInstance(plot: GridPlot<Point, ISeries<Point>, SeriesSet<Point, ISeries<Point>>>, x: number) {
    return new MoveJob(plot, x);
  }
  run() {
    return `${super.run()} to ${this.x}`;
  }
}

export class StackedPlot extends GridPlot<StackedPoint, StackedSeries, StackedSet> {
  describe() {
    return `stacked ${this.data.count()} ${this.data.setAt(0).barWidth}`;
  }
}

export class Tween<T extends Record<string, number>> {
  constructor(public options: { onRender: (value: T) => void }) {}
  tween(from: T, to: T, steps: number) {
    for (let k = 0; k <= steps; k++) {
      const value: Record<string, number> = {};
      for (const key of Object.keys(from)) value[key] = from[key] + ((to[key] - from[key]) * k) / steps;
      this.options.onRender(value as T);
    }
  }
}

export class Pool<T> {
  private items: T[] = [];
  constructor(private make: () => T) {}
  static of<T>(make: () => T): Pool<T> {
    return new Pool(make);
  }
  get(): T {
    return this.items.pop() ?? this.make();
  }
  put(item: T) {
    this.items.push(item);
  }
  get size() {
    return this.items.length;
  }
}
