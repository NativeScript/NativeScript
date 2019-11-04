import { BehaviorSubject, Observable } from "rxjs";

export class SelectedPageService {
    static getInstance(): SelectedPageService {
        return SelectedPageService._instance;
    }

    private static _instance: SelectedPageService = new SelectedPageService();

    selectedPage$: Observable<string>;

    private _selectedPageSource: BehaviorSubject<string>;

    constructor() {
        if (SelectedPageService._instance) {
            throw new Error("Use SelectedPageService.getInstance() instead of new.");
        }

        SelectedPageService._instance = this;

        // Observable selectedPage source
        this._selectedPageSource = new BehaviorSubject<string>("Home");

        // Observable selectedPage stream
        this.selectedPage$ = this._selectedPageSource.asObservable();
    }

    updateSelectedPage(selectedPage: string) {
        this._selectedPageSource.next(selectedPage);
    }
}
