// @lenient
// Locals declared null until a loop assigns them, then read with `??` and `??=`, as core's TabView picks
// the prominent tab: `prominentIdentifier ?? searchIdentifier`.
function prominent(roles: string[]): string {
  let prominentIdentifier: string = null;
  let searchIdentifier: string = null;
  roles.forEach((role, i) => {
    const identifier = `${i}`;
    if (role === 'prominent') prominentIdentifier ??= identifier;
    if (role === 'search') searchIdentifier ??= identifier;
  });
  return prominentIdentifier ?? searchIdentifier;
}
function counted(): number {
  let count: number = undefined;
  count ??= 3;
  return count;
}
console.log(prominent(['', '', '', 'search']), prominent(['prominent', 'search']), prominent(['']) == null, counted());
