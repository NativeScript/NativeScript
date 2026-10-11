// `Date.parse` of an ISO string with a field out of its range is NaN; a day past its month's end and 24:00 roll over.
const texts = ['2024-13-01', '2024-00-10', '2024-02-32', '2024-01-00', '2024-01-01T24:00:01Z', '2024-01-01T23:60Z',
  '2024-01-01T23:59:60Z', '2024-01-01T25:00Z', '2024-01-01T10:00+24:00', '2024-01-01T10:00+12:60',
  '2024-02-30', '2024-04-31', '2024-01-01T24:00Z', '2024-01-01T10:00+23:59', '2024-12-31T23:59:59.999Z'];
for (const t of texts) console.log(t, Date.parse(t), new Date(t).getTime());
