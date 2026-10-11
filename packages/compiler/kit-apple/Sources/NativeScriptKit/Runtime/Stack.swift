import Foundation

/// V8's RangeError for recursion deeper than the stack allows, thrown while there is still room to unwind
/// and handle it: a recursive function checks on entry (`try jsCheckStack()`), as do the runtime's recursive walks.
@inline(__always)
public func jsCheckStack() throws {
    var here: UInt8 = 0
    let address = withUnsafeMutablePointer(to: &here) { UInt(bitPattern: $0) }
    if address < jsStackFloor() { throw JSException(JSRangeError("Maximum call stack size exceeded")) }
}

/// The lowest address the current thread's code may reach before `jsCheckStack` throws: the stack's end
/// plus a reserve for the catch and what it calls.
@usableFromInline
func jsStackFloor() -> UInt {
    let thread = pthread_self()
    let top = UInt(bitPattern: pthread_get_stackaddr_np(thread))
    let size = UInt(pthread_get_stacksize_np(thread))
    return top - size + max(64 * 1024, size / 8)
}
