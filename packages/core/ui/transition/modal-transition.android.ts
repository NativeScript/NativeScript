import { BackstackEntry } from '../frame';
import { FadeTransition } from './fade-transition';

export class ModalTransition extends FadeTransition {
	androidFragmentTransactionCallback(fragmentTransaction: androidx.fragment.app.FragmentTransaction, currentEntry: BackstackEntry, newEntry: BackstackEntry) {
		console.log('Not currently supported on Android.');
	}
}
