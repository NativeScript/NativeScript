// @lenient
// A class held as a value and its static factory called through the variable, as core keeps
// `TouchControlHandler = TouchHandlerImpl` and calls `TouchControlHandler.initWithOwner(owner)`.
class Handler {
  static count = 0;
  owner: string;
  static initWithOwner(owner: string): Handler {
    const handler = new Handler();
    handler.owner = owner;
    Handler.count++;
    return handler;
  }
}
class LoudHandler extends Handler {}
let ControlHandler: { initWithOwner(owner: string): Handler; count: number };
ControlHandler = Handler;
const made = ControlHandler.initWithOwner('button');
const inherited: any = LoudHandler;
console.log(made.owner, ControlHandler.count, typeof inherited.initWithOwner, inherited.initWithOwner('layout').owner);
