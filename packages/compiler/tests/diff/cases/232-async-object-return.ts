// An object literal an async function returns takes the type its declared Promise names.
interface Stat {
  m: number;
  label: string;
}
async function stat(cond: boolean): Promise<Stat> {
  if (cond) return { m: 0, label: 'zero' };
  await Promise.resolve();
  return { m: 1, label: 'one' };
}
const quick = async (): Promise<Stat> => ({ m: 2, label: 'two' });
const block = async (): Promise<Stat> => {
  return { m: 3, label: 'three' };
};
async function wrapped(): Promise<Stat> {
  return ({ m: 4, label: 'four' });
}
stat(true).then((s) => console.log(s.m, s.label));
stat(false).then((s) => console.log(s.m, s.label));
quick().then((s) => console.log(s.m, s.label));
block().then((s) => console.log(s.m, s.label));
wrapped().then((s) => console.log(s.m, s.label));
