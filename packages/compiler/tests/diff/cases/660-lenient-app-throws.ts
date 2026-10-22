// @app-lenient
// A non-strict app's untyped value given to a class-typed slot and then read: a missing one is the TypeError
// script throws there, which the app's own try/catch handles.
class Card {
  title = 'card';
}

function local(x: any): string {
  const c: Card = x;
  return c.title;
}
function viaReturn(x: any): Card {
  return x;
}

const given: any[] = [new Card(), undefined, null];
for (const x of given) {
  try {
    console.log(local(x));
  } catch (e) {
    console.log('local', e instanceof TypeError);
  }
  try {
    console.log(viaReturn(x).title);
  } catch (e) {
    console.log('viaReturn', e instanceof TypeError);
  }
}
