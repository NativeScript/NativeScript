// A typed callback given where its slot takes the arguments as a rest (`callback: (...args: any[]) => void`).
const handlers: Array<(...args: any[]) => void> = [];
function on(name: string, callback: (...args: any[]) => void) {
  handlers.push(callback);
}
on('x', (data: { id: number }, extra: string) => console.log('got', data.id, extra));
on('y', (data: { id: number }) => console.log('one', data.id));
handlers.forEach((h) => h({ id: 3 }, 'more'));
