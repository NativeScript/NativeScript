global.onmessage = (message: { data: string }) => {
  setTimeout(() => postMessage(message.data === 'ping' ? 'pong from its own thread' : 'what?'), 0);
};
