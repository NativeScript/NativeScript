import { View } from './view';
export declare class ViewPool {
    _views: List<View>;
    _capacity: number;
    constructor(capacity: number);
    pop(): View;
    push(view: View): void;
    length(): number;
}
