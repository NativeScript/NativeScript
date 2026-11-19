export function formatCount(count: number): string {
	return `Tapped ${count} ${count === 1 ? 'time' : 'times'}`;
}
