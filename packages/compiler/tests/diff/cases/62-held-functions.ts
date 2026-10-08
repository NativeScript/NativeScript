// A class exposing functions as fields, as an Angular component exposes them to its template: a library
// function held (`readonly round = Math.round`) and a module function of the field's own name.
function initials(name: string): string {
  return name.split(' ').map((part) => part[0]).join('');
}
const SCALE = 100;

class Card {
  readonly round = Math.round;
  readonly initials = initials;
  readonly SCALE = SCALE;
  readonly percent = (value: number) => this.round(value * this.SCALE);

  label(name: string, value: number): string {
    return `${this.initials(name)} ${this.percent(value)}%`;
  }
}

const card = new Card();
console.log(card.label('Ada Lovelace', 0.426), card.round(2.5), card.initials('Grace Brewster Hopper'));
