// Variables set on each path before they are read, conditions their types decide, and code after a return.
function grade(score: number): string {
  let label;
  if (score > 90) label = 'A';
  else if (score > 50) label = 'B';
  else return 'C';
  return label;
}

function lastEven(list: number[]): number {
  let found = -1;
  let item;
  for (let i = 0, n = list.length; i < n; i++) {
    item = list[i];
    if (item % 2 === 0) found = item;
  }
  return found;
}

function parsed(text: string): number {
  let value: number;
  try {
    value = JSON.parse(text);
  } catch (e) {
    value = -1;
  }
  return value;
}

function kind(size: number, name: string): string {
  if (typeof size === 'string') return 'never';
  else if (typeof name === 'string' && size === undefined) return 'never';
  let out = 'n';
  if (typeof size === 'number') out += ':' + size;
  return out;
  console.log('unreachable');
}

function counted(): number {
  let tries = 0;
  do {
    tries++;
  } while (tries < 3);
  var total = tries;
  var total = total * 2;
  return total;
}

function caught(): string {
  try {
    throw new Error('x');
  } catch (e) {
    return 'caught';
  }
}

function setOnce(flag: boolean): number {
  let v;
  if (flag) {
    v = 1;
  } else {
    v = 2;
  }
  const read = () => v;
  return read();
}

console.log(grade(95), grade(60), grade(10), lastEven([1, 4, 7, 8, 9]), parsed('3'), parsed('{'), kind(2, 'x'), counted(), caught(), setOnce(true), setOnce(false));
