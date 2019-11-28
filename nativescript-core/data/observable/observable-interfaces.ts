// Types
import { Observable } from ".";

export interface EventData {
    eventName: string;
    object: Observable;
}

export interface PropertyChangeData extends EventData {
    propertyName: string;
    value: any;
    oldValue?: any;
}