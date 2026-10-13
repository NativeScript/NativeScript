// Date.parse and new Date(string) read the non-ISO forms apps receive: HTTP dates, toString's and toUTCString's, month names.
const t = Date.UTC(2024, 2, 7, 10, 30, 15);
const d = new Date(t);
console.log(Date.parse('Thu, 07 Mar 2024 10:30:15 GMT') === t, new Date(d.toUTCString()).getTime() === t, new Date(d.toString()).getTime() === t);
console.log(Date.parse('Thu, 07 Mar 2024 12:30:15 +0200') === t, Date.parse('March 7, 2024') === new Date(2024, 2, 7).getTime());
console.log(Date.parse('Mar 7, 2024 10:30') === new Date(2024, 2, 7, 10, 30).getTime(), Date.parse('2024/03/07') === new Date(2024, 2, 7).getTime());
console.log(Date.parse('3/7/2024') === new Date(2024, 2, 7).getTime(), Date.parse('not a date'), Date.parse('2024-03-07T10:30:15Z') === t);
