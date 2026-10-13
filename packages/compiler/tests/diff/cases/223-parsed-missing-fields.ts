// Parsed JSON typed as an interface that lacks some of its fields: the app reads on, as JavaScript does.
// A missing number reads NaN and a missing string '' where JavaScript has undefined, so this prints only what agrees.
interface User {
  name: string;
  age: number;
  admin: boolean;
  nick?: string;
}
const users = JSON.parse('[{"name":"a","age":3,"admin":true},{"name":"b"},{}]') as User[];
for (const u of users) console.log(u.name || '-', u.age > 1, Number.isFinite(u.age), !!u.admin, u.nick ?? 'none');
