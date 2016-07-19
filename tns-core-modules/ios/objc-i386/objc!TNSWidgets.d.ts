
declare class TNSLabel extends UILabel {

	borderThickness: UIEdgeInsets;

	padding: UIEdgeInsets;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare var TNSWidgetsVersionNumber: number;

declare var TNSWidgetsVersionString: interop.Reference<number>;
