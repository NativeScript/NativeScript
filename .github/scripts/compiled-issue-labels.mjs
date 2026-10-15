// Labels a `--compiled` report from its Platform, Framework and Kind fields, which the
// compiled.yml issue form writes, and `ns compiled report` writes the same way when it files through gh.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const FIELDS = {
  platform: { label: 'Platform', values: ['ios', 'android'], color: '1d76db' },
  framework: { label: 'Framework', values: ['angular', 'vue', 'svelte', 'react', 'solid', 'xml'], color: '5319e7' },
  kind: { label: 'Kind', values: ['compile-refused', 'native-compile', 'runtime'], color: 'd93f0b' },
};

export function readField(body, label) {
  return new RegExp(`^###\\s+${label}\\s*\\n+([^\\n]*)`, 'm').exec(body ?? '')?.[1].trim().toLowerCase();
}

export function wantedLabels(body) {
  const labels = ['compiled'];
  for (const [prefix, { label, values }] of Object.entries(FIELDS)) {
    const value = readField(body, label);
    if (values.includes(value)) labels.push(`${prefix}:${value}`);
  }
  return labels;
}

async function main() {
  const { issue, repository } = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const api = (path, { method = 'GET', body } = {}) =>
    fetch(`https://api.github.com/repos/${repository.full_name}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        accept: 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28',
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body && JSON.stringify(body),
    });

  const wanted = wantedLabels(issue.body);
  const current = issue.labels.map((l) => l.name);
  // An edit that changes a field replaces its label.
  for (const name of current.filter((n) => /^(platform|framework|kind):/.test(n) && !wanted.includes(n))) {
    await api(`/issues/${issue.number}/labels/${encodeURIComponent(name)}`, { method: 'DELETE' });
  }

  const usable = [];
  for (const name of wanted.filter((n) => !current.includes(n))) {
    if ((await api(`/labels/${encodeURIComponent(name)}`)).ok) {
      usable.push(name);
      continue;
    }
    const color = FIELDS[name.split(':')[0]]?.color ?? 'ededed';
    const created = await api('/labels', { method: 'POST', body: { name, color } });
    if (created.ok) usable.push(name);
    else console.log(`Skipping ${name}: it does not exist and this token cannot create it (${created.status}).`);
  }
  if (usable.length) {
    const added = await api(`/issues/${issue.number}/labels`, { method: 'POST', body: { labels: usable } });
    if (!added.ok) throw new Error(`Adding ${usable.join(', ')} failed: ${added.status} ${await added.text()}`);
  }
  console.log(`#${issue.number}: ${wanted.join(', ')}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
