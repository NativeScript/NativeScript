export interface PlatformFSPluginOptions {
    /**
     * The target platform.
     */
    platform?: string;
    /**
     * A list of all platforms. By default it is `["ios", "android", "desktop"]`.
     */
    platforms?: string[];
    /**
     * An array of minimatch expressions used to filter nodes from the file system.
     */
    ignore?: string[];
}
export declare class PlatformFSPlugin {
    protected readonly platform: string;
    protected readonly platforms: ReadonlyArray<string>;
    protected readonly ignore: ReadonlyArray<string>;
    protected context: string;
    constructor({ platform, platforms, ignore }: PlatformFSPluginOptions);
    apply(compiler: any): void;
}
export interface MapFileSystemArgs {
    /**
     * This is the underlying webpack compiler.inputFileSystem, its interface is similar to Node's fs.
     */
    readonly context: string;
    readonly platform: string;
    readonly platforms: ReadonlyArray<string>;
    readonly ignore: ReadonlyArray<string>;
    readonly compiler: any;
}
export declare function mapFileSystem(args: MapFileSystemArgs): any;
