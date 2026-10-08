import Foundation
import CoreGraphics

/// `interop.Reference`: a cell a native out-parameter writes; `value` reads it as a number.
public final class InteropReference {
    public var value: Any?

    public init(_ value: Any? = nil) { self.value = value }

    public var cgFloat: CGFloat {
        get { CGFloat(jsToNumber(value)) }
        set { value = Double(newValue) }
    }
    public var int: Int {
        get { Int(jsToNumber(value)) }
        set { value = Double(newValue) }
    }
    public var bool: ObjCBool {
        get { ObjCBool(jsTruthy(value)) }
        set { value = newValue.boolValue }
    }
    /// A Core Foundation error out-parameter: what the function writes is owned by the caller, and held as an NSError.
    public var cfError: Unmanaged<CFError>? {
        get { (value as? NSError).map { Unmanaged.passUnretained($0 as CFError) } }
        set { value = newValue.map { $0.takeRetainedValue() as Error as NSError } }
    }
}
