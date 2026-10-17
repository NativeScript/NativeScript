// @plugin
// A plugin's generic classes as an app uses them: specialized by the plugin's subclasses, constructed with type arguments,
// read through their type parameters, and named by the app with arguments of its own.
import { GridPlot, ISeries, Point, Pool, Series, SeriesSet, StackedPlot, StackedPoint, StackedSeries, StackedSet, Tween } from './helpers/plugin/series.ts';

const series = new StackedSeries([new StackedPoint(1, 2), new StackedPoint(2, 5)], 'a');
const plot = new StackedPlot();
plot.listeners.push((p) => console.log('changed', p.describe()));
plot.setData(new StackedSet([series]));
console.log(plot.getData().setAt(0).label, plot.getData().setAt(0).barWidth, plot.getData().setAt(0).yMax);
const point = plot.getData().setAt(0).pointAt(1);
console.log(point.y, point.stack.length, point.describe());
console.log(series.map((p) => p.x * 10).join());
plot.moveTo(3);
console.log(plot.jobs.map((j) => j.run()).join());

const plain = new Series<Point>([new Point(0, 1)], 'plain');
const sets: SeriesSet<Point, ISeries<Point>> = new SeriesSet<Point, ISeries<Point>>([plain]);
console.log(sets.count(), sets.setAt(0).pointAt(0).describe());

function first(p: GridPlot<StackedPoint, StackedSeries, StackedSet>): StackedPoint {
  return p.getData().setAt(0).pointAt(0);
}
console.log(first(plot).describe());

new Tween<{ progress: number }>({ onRender: (v) => console.log('tween', v.progress) }).tween({ progress: 0 }, { progress: 1 }, 2);

const pool = Pool.of(() => ({ id: 1 }));
const item = pool.get();
item.id = 7;
pool.put(item);
console.log(pool.size, pool.get().id);
const counters = new Pool<number[]>(() => []);
counters.put([1, 2]);
console.log(counters.get().length);

console.log(series.points.length, series.points[1].describe());
series.points = [new StackedPoint(4, 4)];
console.log(series.size(), series.pointAt(0).stack.length);
plot.setData(new StackedSet([series, new StackedSeries([], 'empty')]));
console.log(plot.getData().count());
