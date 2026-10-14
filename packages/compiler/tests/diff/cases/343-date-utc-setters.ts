// Date's UTC setters: each sets its fields in UTC, the others kept, and returns the new time value.
const d = new Date(Date.UTC(2020, 1, 29, 12, 30, 15, 250));
console.log(d.setUTCMonth(12), d.toISOString());
d.setUTCFullYear(2019, 0, 31);
console.log(d.setUTCDate(15), d.toISOString());
d.setUTCHours(1, 2, 3, 4);
console.log(d.toISOString(), d.setUTCMinutes(59, 58), d.setUTCSeconds(30), d.setUTCMilliseconds(999));
console.log(d.toISOString(), d.getUTCDay());
d.setUTCDate(0);
console.log(d.toISOString());
const invalid = new Date(NaN);
console.log(invalid.setUTCHours(1), invalid.setUTCFullYear(2000), invalid.toISOString());
