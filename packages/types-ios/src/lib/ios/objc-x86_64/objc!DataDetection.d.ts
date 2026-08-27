
/**
 * @since 15.0
 */
declare class DDMatch extends NSObject {

	static alloc(): DDMatch; // inherited from NSObject

	static new(): DDMatch; // inherited from NSObject

	readonly matchedString: string;
}

/**
 * @since 15.0
 */
declare class DDMatchCalendarEvent extends DDMatch {

	static alloc(): DDMatchCalendarEvent; // inherited from NSObject

	static new(): DDMatchCalendarEvent; // inherited from NSObject

	readonly allDay: boolean;

	readonly endDate: Date | null;

	readonly endTimeZone: NSTimeZone | null;

	readonly startDate: Date | null;

	readonly startTimeZone: NSTimeZone | null;
}

/**
 * @since 15.0
 */
declare class DDMatchEmailAddress extends DDMatch {

	static alloc(): DDMatchEmailAddress; // inherited from NSObject

	static new(): DDMatchEmailAddress; // inherited from NSObject

	readonly emailAddress: string;

	readonly label: string | null;
}

/**
 * @since 15.0
 */
declare class DDMatchFlightNumber extends DDMatch {

	static alloc(): DDMatchFlightNumber; // inherited from NSObject

	static new(): DDMatchFlightNumber; // inherited from NSObject

	readonly airline: string;

	readonly flightNumber: string;
}

/**
 * @since 15.0
 */
declare class DDMatchLink extends DDMatch {

	static alloc(): DDMatchLink; // inherited from NSObject

	static new(): DDMatchLink; // inherited from NSObject

	readonly URL: NSURL;
}

/**
 * @since 15.0
 */
declare class DDMatchMoneyAmount extends DDMatch {

	static alloc(): DDMatchMoneyAmount; // inherited from NSObject

	static new(): DDMatchMoneyAmount; // inherited from NSObject

	readonly amount: number;

	readonly currency: string;
}

/**
 * @since 15.0
 */
declare class DDMatchPhoneNumber extends DDMatch {

	static alloc(): DDMatchPhoneNumber; // inherited from NSObject

	static new(): DDMatchPhoneNumber; // inherited from NSObject

	readonly label: string | null;

	readonly phoneNumber: string;
}

/**
 * @since 15.0
 */
declare class DDMatchPostalAddress extends DDMatch {

	static alloc(): DDMatchPostalAddress; // inherited from NSObject

	static new(): DDMatchPostalAddress; // inherited from NSObject

	readonly city: string | null;

	readonly country: string | null;

	readonly postalCode: string | null;

	readonly state: string | null;

	readonly street: string | null;
}

/**
 * @since 15.0
 */
declare class DDMatchShipmentTrackingNumber extends DDMatch {

	static alloc(): DDMatchShipmentTrackingNumber; // inherited from NSObject

	static new(): DDMatchShipmentTrackingNumber; // inherited from NSObject

	readonly carrier: string;

	readonly trackingNumber: string;
}
