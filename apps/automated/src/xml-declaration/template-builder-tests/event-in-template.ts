// Our unit test will set this function and expect it to be set as a handler on a View in the XML.
export interface ITestEvent {
	test: (args: any) => void;
}
