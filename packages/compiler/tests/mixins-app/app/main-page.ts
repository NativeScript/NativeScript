import { EventData, Label, Page } from '@nativescript/core';
import { glowLog } from './glow';

export function onLoaded(args: EventData) {
  const page = <Page>args.object;
  const out = page.getViewById<Label>('out');
  const second = page.getViewById<Label>('second');
  setTimeout(() => {
    second.set('glow', true);
    const described = (second as any).glowDescription();
    const text = glowLog.join(', ') + ' | ' + described;
    out.text = text;
    console.log('RESULT ' + text);
  }, 300);
}
