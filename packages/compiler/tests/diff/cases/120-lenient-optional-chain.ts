// @lenient
// A string an optional chain reads, held where the chain stops short (core's native window without a scene).
class Session {
  persistentIdentifier = 'session-1';
}
class Scene {
  session: Session;
}
function describe(scene: Scene, id: string): string {
  const sessionId = scene?.session?.persistentIdentifier;
  const known = !!sessionId && id === `${sessionId}`;
  return `${known} ${sessionId}`;
}
const full = new Scene();
full.session = new Session();
console.log(describe(undefined, 'main'), describe(new Scene(), 'main'), describe(full, 'session-1'));
