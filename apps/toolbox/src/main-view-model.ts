import { Observable, Frame, StackLayout, AndroidOverflowInsetData } from '@nativescript/core';
import { pingSpikeWorker } from './__spike__/worker-spawner';

export class HelloWorldModel extends Observable {
	viewDemo(args) {
		console.log('Navigating to view demo:', args.object.text);
		Frame.topmost().navigate({
			moduleName: `pages/${args.object.text}`,
		});
	}

	pingSpikeWorker() {
		pingSpikeWorker(7).then(
			(reply) => console.log('[worker-spike] reply', JSON.stringify(reply)),
			(error) => console.error('[worker-spike] failed', error),
		);
	}

	onInset(args: AndroidOverflowInsetData) {
		args.inset.top += 10; // add 10px to the top inset
		args.inset.bottom += 10; // add 10px to the bottom inset
		args.inset.left += 10; // add 10px to the left inset
		args.inset.right += 10; // add 10px to the right inset

		args.inset.topConsumed = true; // consume the top inset
		args.inset.bottomConsumed = true; // consume the bottom inset
		args.inset.leftConsumed = true; // consume the left inset
		args.inset.rightConsumed = true; // consume the right inset
	}
}
