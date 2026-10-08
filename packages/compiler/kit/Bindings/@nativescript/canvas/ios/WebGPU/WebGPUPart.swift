import Foundation
import NativeScriptKit
import CanvasNative

/// CanvasModule's WebGPU.
enum WebGPUPart: CanvasModulePart {
    static let classes: [String: JSConstructor] = [
        "GPU": JSConstructor { GPUHost(Args($0)) },
        "GPUSupportedLimits": JSConstructor { GPUSupportedLimitsHost(Args($0)) },
        // Devices and queues come from adapters; constructed by script they would wrap nothing.
        "GPUDevice": JSConstructor { _ in throw typeError("Illegal constructor") },
        "GPUQueue": JSConstructor { _ in throw typeError("Illegal constructor") },
    ]

    static let functions: Set<String> = ["createWebGPUContextWithPointer"]

    static func call(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "createWebGPUContextWithPointer":
            return .some(GPUCanvasContextHost(OpaquePointer(bitPattern: Int(args.pointer(0)))))
        default:
            return nil
        }
    }
}
