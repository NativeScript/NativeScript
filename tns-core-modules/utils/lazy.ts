export default function lazy<T>(action: () => T): () => T {
    let _value: T;
    return () => _value || (_value = action());
}

export function lazyExtend<T>(classExtend: () => T): { value: T } {
    let result = { value: null };
    let register = () => result.value = classExtend();

    if (!global.__snapshot) {
        register();
    } else {
        global.__pendingJavaExtendCalls = global.__pendingJavaExtendCalls || [];
        global.__pendingJavaExtendCalls.push(register);
    }

    return result;
}
