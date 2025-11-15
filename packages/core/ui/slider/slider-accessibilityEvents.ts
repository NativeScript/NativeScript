import { EventData } from '../../data/observable';

export interface AccessibilityDecrementEventData extends EventData {
	object: any; // The slider object
	eventName: string;
	value: number;
}

export interface AccessibilityIncrementEventData extends EventData {
	object: any; // The slider object
	eventName: string;
	value: number;
}
