// A navigation whose page component throws while it is made: the navigation's promise rejects, an unhandled
// rejection is reported as uncaught, a handled one reaches its handler, and the app navigates again afterwards.
(globalThis as any).__onUncaughtError = (e: unknown) => console.log('uncaught:', e instanceof Error ? `${e.name}: ${e.message}` : String(e));

class DetailPage {
  readonly id: number;
  constructor(params: Record<string, string>) {
    const id = Number(params.id);
    if (Number.isNaN(id)) throw new TypeError(`invalid id: ${params.id}`);
    this.id = id;
  }
  title() {
    return `Detail ${this.id}`;
  }
}

const history: string[] = [];

async function navigate(path: string, params: Record<string, string>): Promise<boolean> {
  await Promise.resolve();
  const page = new DetailPage(params);
  history.push(`${path} ${page.title()}`);
  return true;
}

navigate('/detail', { id: 'x' });
navigate('/detail', { id: 'y' }).catch((e: Error) => console.log('navigation failed:', e.message));
navigate('/detail', { id: '7' }).then((ok) => console.log('navigated', ok, history.join(', ')));
setTimeout(() => console.log('history', history.length), 10);
