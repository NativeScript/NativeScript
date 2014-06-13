import definition = require("ui/pages");
import pageCommon = require("ui/pages/page-common");

export class Page extends pageCommon.Page {
    private _android: AndroidPage;

    constructor() {
        super();

        this._android = new AndroidPage(this);
    }

    get android(): definition.AndroidPage {
        return this._android;
    }
}

class AndroidPage implements definition.AndroidPage {
    private _ownerPage: definition.Page;
    private _body: any;
    private _activityExtends: any;
    private _activity: android.app.Activity;

    constructor(ownerPage: definition.Page) {
        this._ownerPage = ownerPage;
    }

    get activity(): android.app.Activity {
        return this._activity;
    }

    get activityBody(): any {
        return this._body;
    }
    set activityBody(value: any) {
        if (this._activityExtends) {
            throw new Error("Activity already loaded and its body may not be changed.");
        }

        this._body = value;
    }

    public getActivityExtends(): any {
        if (!this._activityExtends) {
            this.rebuildExtends();
        }

        return this._activityExtends;
    }

    public resetBody() {
        this._body = null;
        this._activityExtends = null;
    }

    private rebuildExtends() {
        // we may have a body set externally
        if (!this._body) {
            var that = this;
            this._body = {
                onCreate: function () {
                    that._activity = this;
                    this.super.onCreate(null);

                    var view = that._ownerPage.contentView;
                    if (view) {
                        // TODO: Notify the entire visual tree for being initialized
                        view.onInitialized(that._activity);
                        that._activity.setContentView(view.android);
                    }
                }
            }

            if (this._ownerPage.onLoaded) {
                this._body.onStart = function () {
                    this.super.onStart();
                    that._ownerPage.onLoaded();
                }
            }
        }

        this._activityExtends = (<any>com).tns.NativeScriptActivity.extends(this._body);
    }
}