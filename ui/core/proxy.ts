import observable = require("ui/core/observable"); 
import bindable = require("ui/core/bindable");

export class ProxyObject extends bindable.Bindable {
    public setPropertyCore(data: observable.PropertyChangeData) {
        this.setNativeProperty(data);
        this.updateTwoWayBinding(data.propertyName, data.value);
    }

    public setNativeProperty(data: observable.PropertyChangeData) {
        // inheritors will override this method to provide specific implementation
    }

    public onNativePropertyChanged(data: observable.PropertyChangeData) {

    }
}