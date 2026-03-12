
/**
 * @since 13.4
 */
declare const enum UIAxis {

	Neither = 0,

	Horizontal = 1,

	Vertical = 2,

	Both = 3
}

interface UICoordinateSpace extends NSObjectProtocol {

	/**
	 * @since 8.0
	 */
	bounds: CGRect;

	/**
	 * @since 8.0
	 */
	convertPointFromCoordinateSpace(point: CGPoint, coordinateSpace: UICoordinateSpace): CGPoint;

	/**
	 * @since 8.0
	 */
	convertPointToCoordinateSpace(point: CGPoint, coordinateSpace: UICoordinateSpace): CGPoint;

	/**
	 * @since 8.0
	 */
	convertRectFromCoordinateSpace(rect: CGRect, coordinateSpace: UICoordinateSpace): CGRect;

	/**
	 * @since 8.0
	 */
	convertRectToCoordinateSpace(rect: CGRect, coordinateSpace: UICoordinateSpace): CGRect;
}
declare var UICoordinateSpace: {

	prototype: UICoordinateSpace;
};

/**
 * @since 7.0
 */
declare const enum UIRectEdge {

	None = 0,

	Top = 1,

	Left = 2,

	Bottom = 4,

	Right = 8,

	All = 15
}
