import { createSignal } from 'solid-js';

export function Counter() {
	const [count, setCount] = createSignal(0);
	return (
		<stacklayout>
			<label text={`Count ${count()}`} />
			<button text="Tap" on:tap={() => setCount(count() + 1)} />
		</stacklayout>
	);
}
