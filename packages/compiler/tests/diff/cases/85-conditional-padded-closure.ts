// @lenient
// A choice between a function another function makes and a literal taking fewer parameters (core's componentSourceTracker).
interface Tracker {
  (component: string, line: number): void;
}
const tracked: string[] = [];
function tracker(uri: string): Tracker {
  return (component: string, line: number) => {
    tracked.push(`${uri}:${line}:${component}`);
  };
}
function trackerFor(debug: boolean, uri?: string): Tracker {
  const track = debug && uri ? tracker(uri) : () => {
    tracked.push('no-op');
  };
  return track;
}
trackerFor(true, 'main.xml')('Label', 3);
trackerFor(false)('Button', 4);
console.log(tracked.join(','));
