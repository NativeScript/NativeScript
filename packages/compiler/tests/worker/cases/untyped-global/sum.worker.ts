interface Batch {
  values: number[];
}

(globalThis as any).onmessage = (message: { data: Batch }) => {
  const values = message.data.values;
  if (!values.length) {
    postMessage('closing');
    close();
    return;
  }
  postMessage(`total ${values.reduce((a, b) => a + b, 0)} from ${values.length} values`);
};
