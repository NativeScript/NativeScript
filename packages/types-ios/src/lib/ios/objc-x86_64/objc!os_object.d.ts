
declare class OS_object extends NSObject {

	static alloc(): OS_object; // inherited from NSObject

	static new(): OS_object; // inherited from NSObject
}

declare function os_release(object: interop.Pointer | interop.Reference<any>): void;

declare function os_retain(object: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;
