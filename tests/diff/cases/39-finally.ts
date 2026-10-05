// A finally block that throws, which replaces whatever the try completed with.
let stops = 0;
function stop(fail: boolean) {
  stops++;
  if (fail) throw new Error('stop failed');
}
function measured(fail: boolean, value: number): number {
  try {
    if (value < 0) throw new Error('negative');
    return value * 2;
  } finally {
    stop(fail);
  }
}
function caught(fail: boolean): string {
  try {
    throw new Error('inner');
  } catch (e) {
    return 'caught ' + (e as Error).message;
  } finally {
    stop(fail);
  }
}
function nested(fail: boolean): string {
  try {
    try {
      return 'inner value';
    } finally {
      stop(false);
    }
  } finally {
    stop(fail);
  }
}
function falls(fail: boolean): void {
  try {
    console.log('body runs');
  } finally {
    stop(fail);
  }
}
const attempt = (f: () => unknown) => {
  try {
    console.log('ok', f());
  } catch (e) {
    console.log('threw', (e as Error).message);
  }
};
attempt(() => measured(false, 2));
attempt(() => measured(true, 2));
attempt(() => measured(false, -1));
attempt(() => measured(true, -1));
attempt(() => caught(false));
attempt(() => caught(true));
attempt(() => nested(false));
attempt(() => nested(true));
attempt(() => falls(true));
console.log(stops);
