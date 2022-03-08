export * as constants from './constants';

export function open(path: string, callback: (error: Error, fd: number) => void);
export function open(path: string, flags: string | number, callback: (error: Error, fd: number) => void);
export function open(path: string, flags: string | number, mode: number | undefined | null, callback: (error: Error | null, fd: number) => void);
export function open(path: string, flags: string | number, mode?: number | undefined | null, callback?: (error: Error | null, fd: number) => void);
