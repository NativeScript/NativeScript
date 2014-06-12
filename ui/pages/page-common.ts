import view = require("ui/core/view");
import dts = require("ui/pages");
import frame = require("ui/frame");
import application = require("application");

export class Page extends view.View implements dts.Page {
    private _contentView: view.View;
    private _frame: frame.Frame;
    private _navigationContext: any;

    public onLoaded: () => any;

    get contentView(): view.View {
        return this._contentView;
    }
    set contentView(value: view.View) {
        this._contentView = value;

        // TODO: Check if page is already loaded and update as needed
    }

    get frame(): frame.Frame {
        return this._frame;
    }
    set frame(value: frame.Frame) {
        // TODO: This method is called internally, check how to hide the setter from users.
        this._frame = value;
    }

    public onNavigatedTo(context: any) {
        this._navigationContext = context;
    }

    public onNavigatedFrom() {
    }
} 