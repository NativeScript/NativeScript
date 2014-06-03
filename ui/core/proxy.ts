import observable = require("ui/core/observable"); 

export class ProxyObject extends observable.Observable {
    public setPropertyCore(data: observable.PropertyChangeData) {
        super.setPropertyCore(data);
        this.setNativeProperty(data);
    }

    public setNativeProperty(data: observable.PropertyChangeData) {
        // TODO:
    }
}