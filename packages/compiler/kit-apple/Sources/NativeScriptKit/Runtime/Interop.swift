import Foundation
import CoreGraphics

/// `interop.Reference`: a cell a native out-parameter writes; `value` reads it as a number.
public final class InteropReference: JSDynamic {
    nonisolated deinit {}
    private var _value: Any?
    public var value: Any? {
        get {
            if let ptr = _value as? InteropPointer, let p = ptr.pointer {
                return Double(p.load(as: UInt8.self))
            }
            return _value
        }
        set { _value = newValue }
    }

    public init(_ value: Any? = nil) { self._value = value }
    public init(_ type: Any?, _ value: Any?) { self._value = value }

    public var cgFloat: CGFloat {
        get { CGFloat(jsToNumber(value)) }
        set { _value = Double(newValue) }
    }
    public var int: Int {
        get { jsNativeInteger(jsToNumber(value), Int.self) }
        set { _value = Double(newValue) }
    }
    public var bool: ObjCBool {
        get { ObjCBool(jsTruthy(value)) }
        set { _value = newValue.boolValue }
    }
    /// An object out-parameter of the type the function writes (`CFTypeRef?` of `SecItemCopyMatching`), held as it.
    public subscript<T>(pointee type: T.Type) -> T? {
        get { _value as? T }
        set { _value = newValue }
    }
    /// A Core Foundation error out-parameter: what the function writes is owned by the caller, and held as an NSError.
    public var cfError: Unmanaged<CFError>? {
        get { (_value as? NSError).map { Unmanaged.passUnretained($0 as CFError) } }
        set { _value = newValue.map { $0.takeRetainedValue() as Error as NSError } }
    }
    public subscript(jsKey key: String) -> Any? {
        get {
            if key == "value" { return value }
            if let idx = Int(key), let ptr = _value as? InteropPointer, let p = ptr.pointer, idx >= 0, (ptr.size == 0 || idx < ptr.size) {
                return Double(p.load(fromByteOffset: idx, as: UInt8.self))
            }
            return nil
        }
        set {
            if key == "value" { value = newValue; return }
            if let idx = Int(key), let ptr = _value as? InteropPointer, let p = ptr.pointer, idx >= 0, (ptr.size == 0 || idx < ptr.size) {
                p.storeBytes(of: UInt8(truncatingIfNeeded: Int(jsToNumber(newValue))), toByteOffset: idx, as: UInt8.self)
            }
        }
    }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "Reference" }
}

/// `new interop.Pointer()`: the null pointer, which a native out-parameter (`NSError **`) takes as no place to write;
/// or `interop.alloc(size)`: an allocated byte buffer.
public final class InteropPointer: JSDynamic {
    nonisolated(unsafe) public let pointer: UnsafeMutableRawPointer?
    public let size: Int
    nonisolated deinit { pointer?.deallocate() }
    public init() {
        self.pointer = nil
        self.size = 0
    }
    public init(size: Int) {
        self.size = max(0, size)
        let p = self.size > 0 ? UnsafeMutableRawPointer.allocate(byteCount: self.size, alignment: 8) : nil
        p?.initializeMemory(as: UInt8.self, repeating: 0, count: self.size)
        self.pointer = p
    }
    public subscript(jsKey key: String) -> Any? { get { nil } set {} }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "Pointer" }
}
