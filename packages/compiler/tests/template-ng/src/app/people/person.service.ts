import { Injectable, signal } from '@angular/core';
import { Person } from './person';

@Injectable({providedIn: 'root'})
export class PersonService {
  items = signal<Person[]>([
    { id: 1, name: 'Alan Turing', nationality: 'British', notableAchievements: ['WW2 code breaking', 'Father of theoretical computer science and AI' ] },
    { id: 2, name: 'Grace Hopper', nationality: 'American', notableAchievements: ['COBOL development', 'Navy commander', 'Implementation of computer systems and components testing'] },
    { id: 3, name: 'Donal Knuth', nationality: 'American', notableAchievements: [ 'Author of The Art of Computer Programming', 'Created TeX typesetting system' ] },
    { id: 4, name: 'Ada Lovelace', nationality: 'British', notableAchievements: [ 'First computer programmer', 'Worked on Analytical Engine' ]},
    { id: 5, name: 'John von Neumann', nationality: 'Hungarian/American', notableAchievements: [ 'Von Neumann architecture', 'Game theory', 'Contributed to EDVAC' ] },
    { id: 6, name: 'Tim Berners-Lee', nationality: 'British', notableAchievements: [ 'Inventor of the World Wide Web' ] },
    { id: 7, name: 'Edsger Dijkstra', nationality: 'Dutch', notableAchievements: [ 'Shortest path algorithm', 'Structured programming advocate' ] },
    { id: 8, name: 'Linus Torvalds', nationality: 'Finnish-American', notableAchievements: ['Creator of Linux kernel', 'Creator of Git'] },
    { id: 9, name: 'John McCarthy', nationality: 'American', notableAchievements: ['Coined term "Artificial Intelligence"', 'Created LISP programming language'] },
    { id: 10, name: 'Dennis Ritchie', nationality: 'American', notableAchievements: ['Creator of C programming language', 'Co-creator of Unix'] },
    { id: 11, name: 'Bjarne Stroustrup', nationality: 'Danish', notableAchievements: [ 'Creator of C++ programming language' ] },
    { id: 12, name: 'Steve Wozniak', nationality: 'American', notableAchievements: ['Co-founder of Apple', 'Designer of Apple I & II', 'Pioneer of personal computing'] },
    { id: 13, name: 'Tommy Flowers', nationality: 'British', notableAchievements: ['Designer of Colossus', 'Pioneer in electronic computing'] },
    { id: 14, name: 'John Backus', nationality: 'American', notableAchievements: ['Created FORTRAN', 'Developed Backus-Naur form(BNF) notation'] },
    { id: 15, name: 'Niklaus Wirth', nationality: 'Swiss', notableAchievements: ['Creator of Pascal, Modula, Oberon languages', 'Software engineering pioneer'] },
  ]);

  getPerson(id: number): Person {
    return this.items().find((person) => person.id === id);
  }
}
