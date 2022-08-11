
declare class DDMatch extends NSObject {

	static alloc(): DDMatch; // inherited from NSObject

	static new(): DDMatch; // inherited from NSObject

	readonly matchedString: string;
}

declare class DDMatchCalendarEvent extends DDMatch {

	static alloc(): DDMatchCalendarEvent; // inherited from NSObject

	static new(): DDMatchCalendarEvent; // inherited from NSObject

	readonly allDay: boolean;

	readonly endDate: Date;

	readonly endTimeZone: NSTimeZone;

	readonly startDate: Date;

	readonly startTimeZone: NSTimeZone;
}

declare class DDMatchEmailAddress extends DDMatch {

	static alloc(): DDMatchEmailAddress; // inherited from NSObject

	static new(): DDMatchEmailAddress; // inherited from NSObject

	readonly emailAddress: string;

	readonly label: string;
}

declare class DDMatchFlightNumber extends DDMatch {

	static alloc(): DDMatchFlightNumber; // inherited from NSObject

	static new(): DDMatchFlightNumber; // inherited from NSObject

	readonly airline: string;

	readonly flightNumber: string;
}

declare class DDMatchLink extends DDMatch {

	static alloc(): DDMatchLink; // inherited from NSObject

	static new(): DDMatchLink; // inherited from NSObject

	readonly URL: NSURL;
}

declare class DDMatchMoneyAmount extends DDMatch {

	static alloc(): DDMatchMoneyAmount; // inherited from NSObject

	static new(): DDMatchMoneyAmount; // inherited from NSObject

	readonly amount: number;

	readonly currency: string;
}

declare class DDMatchPhoneNumber extends DDMatch {

	static alloc(): DDMatchPhoneNumber; // inherited from NSObject

	static new(): DDMatchPhoneNumber; // inherited from NSObject

	readonly label: string;

	readonly phoneNumber: string;
}

declare class DDMatchPostalAddress extends DDMatch {

	static alloc(): DDMatchPostalAddress; // inherited from NSObject

	static new(): DDMatchPostalAddress; // inherited from NSObject

	readonly city: string;

	readonly country: string;

	readonly postalCode: string;

	readonly state: string;

	readonly street: string;
}

declare class DDMatchShipmentTrackingNumber extends DDMatch {

	static alloc(): DDMatchShipmentTrackingNumber; // inherited from NSObject

	static new(): DDMatchShipmentTrackingNumber; // inherited from NSObject

	readonly carrier: string;

	readonly trackingNumber: string;
}
