
interface MouseParams {
	position: interop.Reference<number>;
	direction: interop.Reference<number>;
	has_value: boolean;
}
declare var MouseParams: interop.StructType<MouseParams>;

interface Viewpoint {
	position: interop.Reference<number>;
	direction: interop.Reference<number>;
	has_position: boolean;
	has_direction: boolean;
}
declare var Viewpoint: interop.StructType<Viewpoint>;
