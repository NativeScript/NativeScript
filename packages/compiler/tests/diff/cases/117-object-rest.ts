// An object rest pattern: the keys the pattern does not name, in a new object.
interface Project { name: string; stars: number; tag?: string; site: string }
const projects: Project[] = [{ name: 'node', stars: 3, tag: 'v', site: 'n.org' }, { name: 'deno', stars: 2, site: 'd.land' }];
const { tag, ...rest } = projects[0];
console.log(tag, JSON.stringify(rest));
const trimmed = projects.map(({ tag, ...p }) => ({ ...p, stars: p.stars * 10 }));
console.log(JSON.stringify(trimmed));
