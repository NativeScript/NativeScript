interface Command {
  type: string;
  values?: number[] | Float32Array;
}

let count = 0;

global.onmessage = (message: { data: Command }) => {
  const command = message.data;
  count++;
  if (command.type === 'start') {
    postMessage({ type: 'started', text: `started with ${command.values!.length} strings` });
  } else if (command.type === 'sum') {
    let sum = 0;
    for (const v of command.values as Float32Array) sum += v;
    postMessage({ type: 'sum', value: sum });
  } else if (command.type === 'bad') {
    throw new Error('bad command');
  } else if (command.type === 'stop') {
    postMessage({ type: 'stopping', count });
    close();
  }
};
