
/**
 * @since 2.0
 * @deprecated 12.0
 */
declare class EAGLContext extends NSObject {

	static alloc(): EAGLContext; // inherited from NSObject

	static currentContext(): EAGLContext;

	static new(): EAGLContext; // inherited from NSObject

	static setCurrentContext(context: EAGLContext): boolean;

	readonly API: EAGLRenderingAPI;

	/**
	 * @since 6.0
	 */
	debugLabel: string;

	/**
	 * @since 7.1
	 */
	multiThreaded: boolean;

	readonly sharegroup: EAGLSharegroup;

	constructor(o: { API: EAGLRenderingAPI; });

	constructor(o: { API: EAGLRenderingAPI; sharegroup: EAGLSharegroup; });

	initWithAPI(api: EAGLRenderingAPI): this;

	initWithAPISharegroup(api: EAGLRenderingAPI, sharegroup: EAGLSharegroup): this;

	presentRenderbuffer(target: number): boolean;

	presentRenderbufferAfterMinimumDuration(target: number, duration: number): boolean;

	presentRenderbufferAtTime(target: number, presentationTime: number): boolean;

	renderbufferStorageFromDrawable(target: number, drawable: EAGLDrawable): boolean;
}

/**
 * @since 2.0
 * @deprecated 12.0
 */
interface EAGLDrawable {

	drawableProperties: NSDictionary<string, any>;
}
declare var EAGLDrawable: {

	prototype: EAGLDrawable;
};

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function EAGLGetVersion(major: interop.Pointer | interop.Reference<number>, minor: interop.Pointer | interop.Reference<number>): void;

declare const enum EAGLRenderingAPI {

	kEAGLRenderingAPIOpenGLES1 = 1,

	kEAGLRenderingAPIOpenGLES2 = 2,

	kEAGLRenderingAPIOpenGLES3 = 3
}

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare class EAGLSharegroup extends NSObject {

	static alloc(): EAGLSharegroup; // inherited from NSObject

	static new(): EAGLSharegroup; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	debugLabel: string;
}

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glActiveShaderProgramEXT(pipeline: number, program: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glActiveShaderProgramEXTFunction(pipeline: number, program: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glActiveTexture(texture: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glActiveTextureFunction(texture: number): void;

declare function glActiveTextureFunction2(texture: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glAlphaFunc(func: number, ref: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glAlphaFuncx(func: number, ref: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glAttachShader(program: number, shader: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glAttachShaderFunction(program: number, shader: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glBeginQuery(target: number, id: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glBeginQueryEXT(target: number, id: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glBeginTransformFeedback(primitiveMode: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBindAttribLocation(program: number, index: number, name: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBindAttribLocationFunction(program: number, index: number, name: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBindBuffer(target: number, buffer: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glBindBufferBase(target: number, index: number, buffer: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBindBufferFunction(target: number, buffer: number): void;

declare function glBindBufferFunction2(target: number, buffer: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glBindBufferRange(target: number, index: number, buffer: number, offset: number, size: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBindFramebuffer(target: number, framebuffer: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBindFramebufferFunction(target: number, framebuffer: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glBindFramebufferOES(target: number, framebuffer: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glBindProgramPipelineEXT(pipeline: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glBindProgramPipelineEXTFunction(pipeline: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBindRenderbuffer(target: number, renderbuffer: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBindRenderbufferFunction(target: number, renderbuffer: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glBindRenderbufferOES(target: number, renderbuffer: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glBindSampler(unit: number, sampler: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBindTexture(target: number, texture: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBindTextureFunction(target: number, texture: number): void;

declare function glBindTextureFunction2(target: number, texture: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glBindTransformFeedback(target: number, id: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glBindVertexArray(array: number): void;

/**
 * @since 4.0
 * @deprecated 12.0
 */
declare function glBindVertexArrayOES(array: number): void;

/**
 * @since 4.0
 * @deprecated 12.0
 */
declare function glBindVertexArrayOESFunction(array: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBlendColor(red: number, green: number, blue: number, alpha: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBlendColorFunction(red: number, green: number, blue: number, alpha: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBlendEquation(mode: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBlendEquationFunction(mode: number): void;

declare function glBlendEquationOES(mode: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBlendEquationSeparate(modeRGB: number, modeAlpha: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBlendEquationSeparateFunction(modeRGB: number, modeAlpha: number): void;

/**
 * @since 3.1
 * @deprecated 12.0
 */
declare function glBlendEquationSeparateOES(modeRGB: number, modeAlpha: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBlendFunc(sfactor: number, dfactor: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBlendFuncFunction(sfactor: number, dfactor: number): void;

declare function glBlendFuncFunction2(sfactor: number, dfactor: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBlendFuncSeparate(srcRGB: number, dstRGB: number, srcAlpha: number, dstAlpha: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBlendFuncSeparateFunction(srcRGB: number, dstRGB: number, srcAlpha: number, dstAlpha: number): void;

/**
 * @since 3.1
 * @deprecated 12.0
 */
declare function glBlendFuncSeparateOES(srcRGB: number, dstRGB: number, srcAlpha: number, dstAlpha: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glBlitFramebuffer(srcX0: number, srcY0: number, srcX1: number, srcY1: number, dstX0: number, dstY0: number, dstX1: number, dstY1: number, mask: number, filter: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBufferData(target: number, size: number, data: interop.Pointer | interop.Reference<any>, usage: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBufferDataFunction(target: number, size: number, data: interop.Pointer | interop.Reference<any>, usage: number): void;

declare function glBufferDataFunction2(target: number, size: number, data: interop.Pointer | interop.Reference<any>, usage: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBufferSubData(target: number, offset: number, size: number, data: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glBufferSubDataFunction(target: number, offset: number, size: number, data: interop.Pointer | interop.Reference<any>): void;

declare function glBufferSubDataFunction2(target: number, offset: number, size: number, data: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glCheckFramebufferStatus(target: number): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glCheckFramebufferStatusFunction(target: number): number;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glCheckFramebufferStatusOES(target: number): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glClear(mask: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glClearBufferfi(buffer: number, drawbuffer: number, depth: number, stencil: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glClearBufferfv(buffer: number, drawbuffer: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glClearBufferiv(buffer: number, drawbuffer: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glClearBufferuiv(buffer: number, drawbuffer: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glClearColor(red: number, green: number, blue: number, alpha: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glClearColorFunction(red: number, green: number, blue: number, alpha: number): void;

declare function glClearColorFunction2(red: number, green: number, blue: number, alpha: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glClearColorx(red: number, green: number, blue: number, alpha: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glClearDepthf(depth: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glClearDepthfFunction(depth: number): void;

declare function glClearDepthfFunction2(depth: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glClearDepthx(depth: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glClearFunction(mask: number): void;

declare function glClearFunction2(mask: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glClearStencil(s: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glClearStencilFunction(s: number): void;

declare function glClearStencilFunction2(s: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glClientActiveTexture(texture: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glClientWaitSync(sync: interop.Pointer | interop.Reference<any>, flags: number, timeout: number): number;

/**
 * @since 6.0
 * @deprecated 12.0
 */
declare function glClientWaitSyncAPPLE(sync: interop.Pointer | interop.Reference<any>, flags: number, timeout: number): number;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glClipPlanef(plane: number, equation: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glClipPlanex(plane: number, equation: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glColor4f(red: number, green: number, blue: number, alpha: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glColor4ub(red: number, green: number, blue: number, alpha: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glColor4x(red: number, green: number, blue: number, alpha: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glColorMask(red: number, green: number, blue: number, alpha: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glColorMaskFunction(red: number, green: number, blue: number, alpha: number): void;

declare function glColorMaskFunction2(red: number, green: number, blue: number, alpha: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glColorPointer(size: number, type: number, stride: number, pointer: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glCompileShader(shader: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glCompileShaderFunction(shader: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glCompressedTexImage2D(target: number, level: number, internalformat: number, width: number, height: number, border: number, imageSize: number, data: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glCompressedTexImage2DFunction(target: number, level: number, internalformat: number, width: number, height: number, border: number, imageSize: number, data: interop.Pointer | interop.Reference<any>): void;

declare function glCompressedTexImage2DFunction2(target: number, level: number, internalformat: number, width: number, height: number, border: number, imageSize: number, data: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glCompressedTexImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, imageSize: number, data: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glCompressedTexSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, imageSize: number, data: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glCompressedTexSubImage2DFunction(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, imageSize: number, data: interop.Pointer | interop.Reference<any>): void;

declare function glCompressedTexSubImage2DFunction2(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, imageSize: number, data: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glCompressedTexSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, width: number, height: number, depth: number, format: number, imageSize: number, data: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glCopyBufferSubData(readTarget: number, writeTarget: number, readOffset: number, writeOffset: number, size: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glCopyTexImage2D(target: number, level: number, internalformat: number, x: number, y: number, width: number, height: number, border: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glCopyTexImage2DFunction(target: number, level: number, internalformat: number, x: number, y: number, width: number, height: number, border: number): void;

declare function glCopyTexImage2DFunction2(target: number, level: number, internalformat: number, x: number, y: number, width: number, height: number, border: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glCopyTexSubImage2D(target: number, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glCopyTexSubImage2DFunction(target: number, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number): void;

declare function glCopyTexSubImage2DFunction2(target: number, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glCopyTexSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, x: number, y: number, width: number, height: number): void;

/**
 * @since 6.0
 * @deprecated 12.0
 */
declare function glCopyTextureLevelsAPPLE(destinationTexture: number, sourceTexture: number, sourceBaseLevel: number, sourceLevelCount: number): void;

/**
 * @since 6.0
 * @deprecated 12.0
 */
declare function glCopyTextureLevelsAPPLEFunction(destinationTexture: number, sourceTexture: number, sourceBaseLevel: number, sourceLevelCount: number): void;

/**
 * @since 6.0
 * @deprecated 12.0
 */
declare function glCopyTextureLevelsAPPLEFunction2(destinationTexture: number, sourceTexture: number, sourceBaseLevel: number, sourceLevelCount: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glCreateProgram(): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glCreateProgramFunction(): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glCreateShader(type: number): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glCreateShaderFunction(type: number): number;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glCreateShaderProgramvEXT(type: number, count: number, strings: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glCreateShaderProgramvEXTFunction(type: number, count: number, strings: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glCullFace(mode: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glCullFaceFunction(mode: number): void;

declare function glCullFaceFunction2(mode: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glCurrentPaletteMatrixOES(matrixpaletteindex: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDeleteBuffers(n: number, buffers: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDeleteBuffersFunction(n: number, buffers: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteBuffersFunction2(n: number, buffers: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDeleteFramebuffers(n: number, framebuffers: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDeleteFramebuffersFunction(n: number, framebuffers: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glDeleteFramebuffersOES(n: number, framebuffers: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDeleteProgram(program: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDeleteProgramFunction(program: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glDeleteProgramPipelinesEXT(n: number, pipelines: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glDeleteProgramPipelinesEXTFunction(n: number, pipelines: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glDeleteQueries(n: number, ids: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glDeleteQueriesEXT(n: number, ids: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDeleteRenderbuffers(n: number, renderbuffers: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDeleteRenderbuffersFunction(n: number, renderbuffers: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glDeleteRenderbuffersOES(n: number, renderbuffers: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glDeleteSamplers(count: number, samplers: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDeleteShader(shader: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDeleteShaderFunction(shader: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glDeleteSync(sync: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 6.0
 * @deprecated 12.0
 */
declare function glDeleteSyncAPPLE(sync: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDeleteTextures(n: number, textures: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDeleteTexturesFunction(n: number, textures: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteTexturesFunction2(n: number, textures: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glDeleteTransformFeedbacks(n: number, ids: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glDeleteVertexArrays(n: number, arrays: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 4.0
 * @deprecated 12.0
 */
declare function glDeleteVertexArraysOES(n: number, arrays: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 4.0
 * @deprecated 12.0
 */
declare function glDeleteVertexArraysOESFunction(n: number, arrays: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDepthFunc(func: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDepthFuncFunction(func: number): void;

declare function glDepthFuncFunction2(func: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDepthMask(flag: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDepthMaskFunction(flag: number): void;

declare function glDepthMaskFunction2(flag: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDepthRangef(zNear: number, zFar: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDepthRangefFunction(zNear: number, zFar: number): void;

declare function glDepthRangefFunction2(zNear: number, zFar: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glDepthRangex(zNear: number, zFar: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDetachShader(program: number, shader: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDetachShaderFunction(program: number, shader: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDisable(cap: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glDisableClientState(array: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDisableFunction(cap: number): void;

declare function glDisableFunction2(cap: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDisableVertexAttribArray(index: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDisableVertexAttribArrayFunction(index: number): void;

/**
 * @since 4.0
 * @deprecated 12.0
 */
declare function glDiscardFramebufferEXT(target: number, numAttachments: number, attachments: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 4.0
 * @deprecated 12.0
 */
declare function glDiscardFramebufferEXTFunction(target: number, numAttachments: number, attachments: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDrawArrays(mode: number, first: number, count: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDrawArraysFunction(mode: number, first: number, count: number): void;

declare function glDrawArraysFunction2(mode: number, first: number, count: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glDrawArraysInstanced(mode: number, first: number, count: number, instancecount: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glDrawArraysInstancedEXT(mode: number, first: number, count: number, instanceCount: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glDrawBuffers(n: number, bufs: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDrawElements(mode: number, count: number, type: number, indices: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glDrawElementsFunction(mode: number, count: number, type: number, indices: interop.Pointer | interop.Reference<any>): void;

declare function glDrawElementsFunction2(mode: number, count: number, type: number, indices: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glDrawElementsInstanced(mode: number, count: number, type: number, indices: interop.Pointer | interop.Reference<any>, instancecount: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glDrawElementsInstancedEXT(mode: number, count: number, type: number, indices: interop.Pointer | interop.Reference<any>, instanceCount: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glDrawRangeElements(mode: number, start: number, end: number, count: number, type: number, indices: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glDrawTexfOES(x: number, y: number, z: number, width: number, height: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glDrawTexfvOES(coords: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glDrawTexiOES(x: number, y: number, z: number, width: number, height: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glDrawTexivOES(coords: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glDrawTexsOES(x: number, y: number, z: number, width: number, height: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glDrawTexsvOES(coords: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glDrawTexxOES(x: number, y: number, z: number, width: number, height: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glDrawTexxvOES(coords: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glEnable(cap: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glEnableClientState(array: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glEnableFunction(cap: number): void;

declare function glEnableFunction2(cap: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glEnableVertexAttribArray(index: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glEnableVertexAttribArrayFunction(index: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glEndQuery(target: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glEndQueryEXT(target: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glEndTransformFeedback(): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glFenceSync(condition: number, flags: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 6.0
 * @deprecated 12.0
 */
declare function glFenceSyncAPPLE(condition: number, flags: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glFinish(): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glFinishFunction(): void;

declare function glFinishFunction2(): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glFlush(): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glFlushFunction(): void;

declare function glFlushFunction2(): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glFlushMappedBufferRange(target: number, offset: number, length: number): void;

/**
 * @since 6.0
 * @deprecated 12.0
 */
declare function glFlushMappedBufferRangeEXT(target: number, offset: number, length: number): void;

/**
 * @since 6.0
 * @deprecated 12.0
 */
declare function glFlushMappedBufferRangeEXTFunction(target: number, offset: number, length: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glFogf(pname: number, param: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glFogfv(pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glFogx(pname: number, param: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glFogxv(pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glFramebufferRenderbuffer(target: number, attachment: number, renderbuffertarget: number, renderbuffer: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glFramebufferRenderbufferFunction(target: number, attachment: number, renderbuffertarget: number, renderbuffer: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glFramebufferRenderbufferOES(target: number, attachment: number, renderbuffertarget: number, renderbuffer: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glFramebufferTexture2D(target: number, attachment: number, textarget: number, texture: number, level: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glFramebufferTexture2DFunction(target: number, attachment: number, textarget: number, texture: number, level: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glFramebufferTexture2DOES(target: number, attachment: number, textarget: number, texture: number, level: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glFramebufferTextureLayer(target: number, attachment: number, texture: number, level: number, layer: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glFrontFace(mode: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glFrontFaceFunction(mode: number): void;

declare function glFrontFaceFunction2(mode: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glFrustumf(left: number, right: number, bottom: number, top: number, zNear: number, zFar: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glFrustumx(left: number, right: number, bottom: number, top: number, zNear: number, zFar: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGenBuffers(n: number, buffers: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGenBuffersFunction(n: number, buffers: interop.Pointer | interop.Reference<number>): void;

declare function glGenBuffersFunction2(n: number, buffers: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGenFramebuffers(n: number, framebuffers: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGenFramebuffersFunction(n: number, framebuffers: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glGenFramebuffersOES(n: number, framebuffers: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glGenProgramPipelinesEXT(n: number, pipelines: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glGenProgramPipelinesEXTFunction(n: number, pipelines: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGenQueries(n: number, ids: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glGenQueriesEXT(n: number, ids: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGenRenderbuffers(n: number, renderbuffers: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGenRenderbuffersFunction(n: number, renderbuffers: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glGenRenderbuffersOES(n: number, renderbuffers: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGenSamplers(count: number, samplers: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGenTextures(n: number, textures: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGenTexturesFunction(n: number, textures: interop.Pointer | interop.Reference<number>): void;

declare function glGenTexturesFunction2(n: number, textures: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGenTransformFeedbacks(n: number, ids: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGenVertexArrays(n: number, arrays: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 4.0
 * @deprecated 12.0
 */
declare function glGenVertexArraysOES(n: number, arrays: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 4.0
 * @deprecated 12.0
 */
declare function glGenVertexArraysOESFunction(n: number, arrays: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGenerateMipmap(target: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGenerateMipmapFunction(target: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glGenerateMipmapOES(target: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetActiveAttrib(program: number, index: number, bufsize: number, length: interop.Pointer | interop.Reference<number>, size: interop.Pointer | interop.Reference<number>, type: interop.Pointer | interop.Reference<number>, name: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetActiveAttribFunction(program: number, index: number, bufsize: number, length: interop.Pointer | interop.Reference<number>, size: interop.Pointer | interop.Reference<number>, type: interop.Pointer | interop.Reference<number>, name: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetActiveUniform(program: number, index: number, bufsize: number, length: interop.Pointer | interop.Reference<number>, size: interop.Pointer | interop.Reference<number>, type: interop.Pointer | interop.Reference<number>, name: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetActiveUniformBlockName(program: number, uniformBlockIndex: number, bufSize: number, length: interop.Pointer | interop.Reference<number>, uniformBlockName: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetActiveUniformBlockiv(program: number, uniformBlockIndex: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetActiveUniformFunction(program: number, index: number, bufsize: number, length: interop.Pointer | interop.Reference<number>, size: interop.Pointer | interop.Reference<number>, type: interop.Pointer | interop.Reference<number>, name: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetActiveUniformsiv(program: number, uniformCount: number, uniformIndices: interop.Pointer | interop.Reference<number>, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetAttachedShaders(program: number, maxcount: number, count: interop.Pointer | interop.Reference<number>, shaders: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetAttachedShadersFunction(program: number, maxcount: number, count: interop.Pointer | interop.Reference<number>, shaders: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetAttribLocation(program: number, name: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetAttribLocationFunction(program: number, name: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetBooleanv(pname: number, params: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetBooleanvFunction(pname: number, params: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetBooleanvFunction2(pname: number, params: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetBufferParameteri64v(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetBufferParameteriv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetBufferParameterivFunction(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetBufferParameterivFunction2(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetBufferPointerv(target: number, pname: number, params: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetBufferPointervOES(target: number, pname: number, params: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

declare function glGetBufferPointervOESFunction(target: number, pname: number, params: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glGetClipPlanef(pname: number, equation: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glGetClipPlanex(pname: number, eqn: interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetError(): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetErrorFunction(): number;

declare function glGetErrorFunction2(): number;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glGetFixedv(pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetFloatv(pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetFloatvFunction(pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetFloatvFunction2(pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetFragDataLocation(program: number, name: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetFramebufferAttachmentParameteriv(target: number, attachment: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetFramebufferAttachmentParameterivFunction(target: number, attachment: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glGetFramebufferAttachmentParameterivOES(target: number, attachment: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetInteger64i_v(target: number, index: number, data: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetInteger64v(pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 6.0
 * @deprecated 12.0
 */
declare function glGetInteger64vAPPLE(pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetIntegeri_v(target: number, index: number, data: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetIntegerv(pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetIntegervFunction(pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetIntegervFunction2(pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetInternalformativ(target: number, internalformat: number, pname: number, bufSize: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glGetLightfv(light: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glGetLightxv(light: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glGetMaterialfv(face: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glGetMaterialxv(face: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glGetObjectLabelEXT(type: number, object: number, bufSize: number, length: interop.Pointer | interop.Reference<number>, label: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glGetObjectLabelEXTFunction(type: number, object: number, bufSize: number, length: interop.Pointer | interop.Reference<number>, label: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glGetObjectLabelEXTFunction2(type: number, object: number, bufSize: number, length: interop.Pointer | interop.Reference<number>, label: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glGetPointerv(pname: number, params: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetProgramBinary(program: number, bufSize: number, length: interop.Pointer | interop.Reference<number>, binaryFormat: interop.Pointer | interop.Reference<number>, binary: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetProgramInfoLog(program: number, bufsize: number, length: interop.Pointer | interop.Reference<number>, infolog: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetProgramInfoLogFunction(program: number, bufsize: number, length: interop.Pointer | interop.Reference<number>, infolog: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glGetProgramPipelineInfoLogEXT(pipeline: number, bufSize: number, length: interop.Pointer | interop.Reference<number>, infoLog: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glGetProgramPipelineInfoLogEXTFunction(pipeline: number, bufSize: number, length: interop.Pointer | interop.Reference<number>, infoLog: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glGetProgramPipelineivEXT(pipeline: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glGetProgramPipelineivEXTFunction(pipeline: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetProgramiv(program: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetProgramivFunction(program: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetQueryObjectuiv(id: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glGetQueryObjectuivEXT(id: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetQueryiv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glGetQueryivEXT(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetRenderbufferParameteriv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetRenderbufferParameterivFunction(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glGetRenderbufferParameterivOES(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetSamplerParameterfv(sampler: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetSamplerParameteriv(sampler: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetShaderInfoLog(shader: number, bufsize: number, length: interop.Pointer | interop.Reference<number>, infolog: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetShaderInfoLogFunction(shader: number, bufsize: number, length: interop.Pointer | interop.Reference<number>, infolog: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetShaderPrecisionFormat(shadertype: number, precisiontype: number, range: interop.Pointer | interop.Reference<number>, precision: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetShaderPrecisionFormatFunction(shadertype: number, precisiontype: number, range: interop.Pointer | interop.Reference<number>, precision: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetShaderSource(shader: number, bufsize: number, length: interop.Pointer | interop.Reference<number>, source: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetShaderSourceFunction(shader: number, bufsize: number, length: interop.Pointer | interop.Reference<number>, source: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetShaderiv(shader: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetShaderivFunction(shader: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetString(name: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetStringFunction(name: number): interop.Pointer | interop.Reference<any>;

declare function glGetStringFunction2(name: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetStringi(name: number, index: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetSynciv(sync: interop.Pointer | interop.Reference<any>, pname: number, bufSize: number, length: interop.Pointer | interop.Reference<number>, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 6.0
 * @deprecated 12.0
 */
declare function glGetSyncivAPPLE(sync: interop.Pointer | interop.Reference<any>, pname: number, bufSize: number, length: interop.Pointer | interop.Reference<number>, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glGetTexEnvfv(env: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glGetTexEnviv(env: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glGetTexEnvxv(env: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetTexParameterfv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetTexParameterfvFunction(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetTexParameterfvFunction2(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetTexParameteriv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetTexParameterivFunction(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetTexParameterivFunction2(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glGetTexParameterxv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetTransformFeedbackVarying(program: number, index: number, bufSize: number, length: interop.Pointer | interop.Reference<number>, size: interop.Pointer | interop.Reference<number>, type: interop.Pointer | interop.Reference<number>, name: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetUniformBlockIndex(program: number, uniformBlockName: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetUniformIndices(program: number, uniformCount: number, uniformNames: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, uniformIndices: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetUniformLocation(program: number, name: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetUniformLocationFunction(program: number, name: string | interop.Pointer | interop.Reference<any>): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetUniformfv(program: number, location: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetUniformfvFunction(program: number, location: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetUniformiv(program: number, location: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetUniformivFunction(program: number, location: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetUniformuiv(program: number, location: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetVertexAttribIiv(index: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glGetVertexAttribIuiv(index: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetVertexAttribPointerv(index: number, pname: number, pointer: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetVertexAttribPointervFunction(index: number, pname: number, pointer: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetVertexAttribfv(index: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetVertexAttribfvFunction(index: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetVertexAttribiv(index: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glGetVertexAttribivFunction(index: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glHint(target: number, mode: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glHintFunction(target: number, mode: number): void;

declare function glHintFunction2(target: number, mode: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glInsertEventMarkerEXT(length: number, marker: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glInsertEventMarkerEXTFunction(length: number, marker: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glInsertEventMarkerEXTFunction2(length: number, marker: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glInvalidateFramebuffer(target: number, numAttachments: number, attachments: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glInvalidateSubFramebuffer(target: number, numAttachments: number, attachments: interop.Pointer | interop.Reference<number>, x: number, y: number, width: number, height: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glIsBuffer(buffer: number): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glIsBufferFunction(buffer: number): number;

declare function glIsBufferFunction2(buffer: number): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glIsEnabled(cap: number): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glIsEnabledFunction(cap: number): number;

declare function glIsEnabledFunction2(cap: number): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glIsFramebuffer(framebuffer: number): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glIsFramebufferFunction(framebuffer: number): number;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glIsFramebufferOES(framebuffer: number): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glIsProgram(program: number): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glIsProgramFunction(program: number): number;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glIsProgramPipelineEXT(pipeline: number): number;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glIsProgramPipelineEXTFunction(pipeline: number): number;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glIsQuery(id: number): number;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glIsQueryEXT(id: number): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glIsRenderbuffer(renderbuffer: number): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glIsRenderbufferFunction(renderbuffer: number): number;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glIsRenderbufferOES(renderbuffer: number): number;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glIsSampler(sampler: number): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glIsShader(shader: number): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glIsShaderFunction(shader: number): number;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glIsSync(sync: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 6.0
 * @deprecated 12.0
 */
declare function glIsSyncAPPLE(sync: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glIsTexture(texture: number): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glIsTextureFunction(texture: number): number;

declare function glIsTextureFunction2(texture: number): number;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glIsTransformFeedback(id: number): number;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glIsVertexArray(array: number): number;

/**
 * @since 4.0
 * @deprecated 12.0
 */
declare function glIsVertexArrayOES(array: number): number;

/**
 * @since 4.0
 * @deprecated 12.0
 */
declare function glIsVertexArrayOESFunction(array: number): number;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glLabelObjectEXT(type: number, object: number, length: number, label: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glLabelObjectEXTFunction(type: number, object: number, length: number, label: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glLabelObjectEXTFunction2(type: number, object: number, length: number, label: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glLightModelf(pname: number, param: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glLightModelfv(pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glLightModelx(pname: number, param: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glLightModelxv(pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glLightf(light: number, pname: number, param: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glLightfv(light: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glLightx(light: number, pname: number, param: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glLightxv(light: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glLineWidth(width: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glLineWidthFunction(width: number): void;

declare function glLineWidthFunction2(width: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glLineWidthx(width: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glLinkProgram(program: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glLinkProgramFunction(program: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glLoadIdentity(): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glLoadMatrixf(m: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glLoadMatrixx(m: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glLoadPaletteFromModelViewMatrixOES(): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glLogicOp(opcode: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glMapBufferOES(target: number, access: number): interop.Pointer | interop.Reference<any>;

declare function glMapBufferOESFunction(target: number, access: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glMapBufferRange(target: number, offset: number, length: number, access: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 6.0
 * @deprecated 12.0
 */
declare function glMapBufferRangeEXT(target: number, offset: number, length: number, access: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 6.0
 * @deprecated 12.0
 */
declare function glMapBufferRangeEXTFunction(target: number, offset: number, length: number, access: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glMaterialf(face: number, pname: number, param: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glMaterialfv(face: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glMaterialx(face: number, pname: number, param: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glMaterialxv(face: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glMatrixIndexPointerOES(size: number, type: number, stride: number, pointer: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glMatrixMode(mode: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glMultMatrixf(m: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glMultMatrixx(m: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glMultiTexCoord4f(target: number, s: number, t: number, r: number, q: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glMultiTexCoord4x(target: number, s: number, t: number, r: number, q: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glNormal3f(nx: number, ny: number, nz: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glNormal3x(nx: number, ny: number, nz: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glNormalPointer(type: number, stride: number, pointer: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glOrthof(left: number, right: number, bottom: number, top: number, zNear: number, zFar: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glOrthox(left: number, right: number, bottom: number, top: number, zNear: number, zFar: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glPauseTransformFeedback(): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glPixelStorei(pname: number, param: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glPixelStoreiFunction(pname: number, param: number): void;

declare function glPixelStoreiFunction2(pname: number, param: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glPointParameterf(pname: number, param: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glPointParameterfv(pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glPointParameterx(pname: number, param: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glPointParameterxv(pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glPointSize(size: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glPointSizePointerOES(type: number, stride: number, pointer: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glPointSizex(size: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glPolygonOffset(factor: number, units: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glPolygonOffsetFunction(factor: number, units: number): void;

declare function glPolygonOffsetFunction2(factor: number, units: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glPolygonOffsetx(factor: number, units: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glPopGroupMarkerEXT(): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glPopGroupMarkerEXTFunction(): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glPopGroupMarkerEXTFunction2(): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glPopMatrix(): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glProgramBinary(program: number, binaryFormat: number, binary: interop.Pointer | interop.Reference<any>, length: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glProgramParameteri(program: number, pname: number, value: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramParameteriEXT(program: number, pname: number, value: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramParameteriEXTFunction(program: number, pname: number, value: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform1fEXT(program: number, location: number, x: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform1fEXTFunction(program: number, location: number, x: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform1fvEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform1fvEXTFunction(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform1iEXT(program: number, location: number, x: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform1iEXTFunction(program: number, location: number, x: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform1ivEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform1ivEXTFunction(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glProgramUniform1uiEXT(program: number, location: number, x: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glProgramUniform1uivEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform2fEXT(program: number, location: number, x: number, y: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform2fEXTFunction(program: number, location: number, x: number, y: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform2fvEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform2fvEXTFunction(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform2iEXT(program: number, location: number, x: number, y: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform2iEXTFunction(program: number, location: number, x: number, y: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform2ivEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform2ivEXTFunction(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glProgramUniform2uiEXT(program: number, location: number, x: number, y: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glProgramUniform2uivEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform3fEXT(program: number, location: number, x: number, y: number, z: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform3fEXTFunction(program: number, location: number, x: number, y: number, z: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform3fvEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform3fvEXTFunction(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform3iEXT(program: number, location: number, x: number, y: number, z: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform3iEXTFunction(program: number, location: number, x: number, y: number, z: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform3ivEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform3ivEXTFunction(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glProgramUniform3uiEXT(program: number, location: number, x: number, y: number, z: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glProgramUniform3uivEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform4fEXT(program: number, location: number, x: number, y: number, z: number, w: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform4fEXTFunction(program: number, location: number, x: number, y: number, z: number, w: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform4fvEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform4fvEXTFunction(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform4iEXT(program: number, location: number, x: number, y: number, z: number, w: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform4iEXTFunction(program: number, location: number, x: number, y: number, z: number, w: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform4ivEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniform4ivEXTFunction(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glProgramUniform4uiEXT(program: number, location: number, x: number, y: number, z: number, w: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glProgramUniform4uivEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniformMatrix2fvEXT(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniformMatrix2fvEXTFunction(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glProgramUniformMatrix2x3fvEXT(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glProgramUniformMatrix2x4fvEXT(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniformMatrix3fvEXT(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniformMatrix3fvEXTFunction(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glProgramUniformMatrix3x2fvEXT(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glProgramUniformMatrix3x4fvEXT(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniformMatrix4fvEXT(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glProgramUniformMatrix4fvEXTFunction(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glProgramUniformMatrix4x2fvEXT(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glProgramUniformMatrix4x3fvEXT(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glPushGroupMarkerEXT(length: number, marker: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glPushGroupMarkerEXTFunction(length: number, marker: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glPushGroupMarkerEXTFunction2(length: number, marker: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glPushMatrix(): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glReadBuffer(mode: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glReadPixels(x: number, y: number, width: number, height: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glReadPixelsFunction(x: number, y: number, width: number, height: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

declare function glReadPixelsFunction2(x: number, y: number, width: number, height: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glReleaseShaderCompiler(): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glReleaseShaderCompilerFunction(): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glRenderbufferStorage(target: number, internalformat: number, width: number, height: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glRenderbufferStorageFunction(target: number, internalformat: number, width: number, height: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glRenderbufferStorageMultisample(target: number, samples: number, internalformat: number, width: number, height: number): void;

/**
 * @since 4.0
 * @deprecated 12.0
 */
declare function glRenderbufferStorageMultisampleAPPLE(target: number, samples: number, internalformat: number, width: number, height: number): void;

/**
 * @since 4.0
 * @deprecated 12.0
 */
declare function glRenderbufferStorageMultisampleAPPLEFunction(target: number, samples: number, internalformat: number, width: number, height: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glRenderbufferStorageOES(target: number, internalformat: number, width: number, height: number): void;

/**
 * @since 4.0
 * @deprecated 12.0
 */
declare function glResolveMultisampleFramebufferAPPLE(): void;

/**
 * @since 4.0
 * @deprecated 12.0
 */
declare function glResolveMultisampleFramebufferAPPLEFunction(): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glResumeTransformFeedback(): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glRotatef(angle: number, x: number, y: number, z: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glRotatex(angle: number, x: number, y: number, z: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glSampleCoverage(value: number, invert: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glSampleCoverageFunction(value: number, invert: number): void;

declare function glSampleCoverageFunction2(value: number, invert: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glSampleCoveragex(value: number, invert: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glSamplerParameterf(sampler: number, pname: number, param: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glSamplerParameterfv(sampler: number, pname: number, param: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glSamplerParameteri(sampler: number, pname: number, param: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glSamplerParameteriv(sampler: number, pname: number, param: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glScalef(x: number, y: number, z: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glScalex(x: number, y: number, z: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glScissor(x: number, y: number, width: number, height: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glScissorFunction(x: number, y: number, width: number, height: number): void;

declare function glScissorFunction2(x: number, y: number, width: number, height: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glShadeModel(mode: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glShaderBinary(n: number, shaders: interop.Pointer | interop.Reference<number>, binaryformat: number, binary: interop.Pointer | interop.Reference<any>, length: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glShaderBinaryFunction(n: number, shaders: interop.Pointer | interop.Reference<number>, binaryformat: number, binary: interop.Pointer | interop.Reference<any>, length: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glShaderSource(shader: number, count: number, string: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, length: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glShaderSourceFunction(shader: number, count: number, string: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, length: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glStencilFunc(func: number, ref: number, mask: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glStencilFuncFunction(func: number, ref: number, mask: number): void;

declare function glStencilFuncFunction2(func: number, ref: number, mask: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glStencilFuncSeparate(face: number, func: number, ref: number, mask: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glStencilFuncSeparateFunction(face: number, func: number, ref: number, mask: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glStencilMask(mask: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glStencilMaskFunction(mask: number): void;

declare function glStencilMaskFunction2(mask: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glStencilMaskSeparate(face: number, mask: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glStencilMaskSeparateFunction(face: number, mask: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glStencilOp(fail: number, zfail: number, zpass: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glStencilOpFunction(fail: number, zfail: number, zpass: number): void;

declare function glStencilOpFunction2(fail: number, zfail: number, zpass: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glStencilOpSeparate(face: number, fail: number, zfail: number, zpass: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glStencilOpSeparateFunction(face: number, fail: number, zfail: number, zpass: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glTexCoordPointer(size: number, type: number, stride: number, pointer: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glTexEnvf(target: number, pname: number, param: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glTexEnvfv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glTexEnvi(target: number, pname: number, param: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glTexEnviv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glTexEnvx(target: number, pname: number, param: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glTexEnvxv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glTexImage2D(target: number, level: number, internalformat: number, width: number, height: number, border: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glTexImage2DFunction(target: number, level: number, internalformat: number, width: number, height: number, border: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

declare function glTexImage2DFunction2(target: number, level: number, internalformat: number, width: number, height: number, border: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glTexImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glTexParameterf(target: number, pname: number, param: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glTexParameterfFunction(target: number, pname: number, param: number): void;

declare function glTexParameterfFunction2(target: number, pname: number, param: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glTexParameterfv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glTexParameterfvFunction(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glTexParameterfvFunction2(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glTexParameteri(target: number, pname: number, param: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glTexParameteriFunction(target: number, pname: number, param: number): void;

declare function glTexParameteriFunction2(target: number, pname: number, param: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glTexParameteriv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glTexParameterivFunction(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glTexParameterivFunction2(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glTexParameterx(target: number, pname: number, param: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glTexParameterxv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glTexStorage2D(target: number, levels: number, internalformat: number, width: number, height: number): void;

/**
 * @since 6.0
 * @deprecated 12.0
 */
declare function glTexStorage2DEXT(target: number, levels: number, internalformat: number, width: number, height: number): void;

/**
 * @since 6.0
 * @deprecated 12.0
 */
declare function glTexStorage2DEXTFunction(target: number, levels: number, internalformat: number, width: number, height: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glTexStorage3D(target: number, levels: number, internalformat: number, width: number, height: number, depth: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glTexSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glTexSubImage2DFunction(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

declare function glTexSubImage2DFunction2(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glTexSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, width: number, height: number, depth: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glTransformFeedbackVaryings(program: number, count: number, varyings: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, bufferMode: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glTranslatef(x: number, y: number, z: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glTranslatex(x: number, y: number, z: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform1f(location: number, x: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform1fFunction(location: number, x: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform1fv(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform1fvFunction(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform1i(location: number, x: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform1iFunction(location: number, x: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform1iv(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform1ivFunction(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glUniform1ui(location: number, v0: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glUniform1uiv(location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform2f(location: number, x: number, y: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform2fFunction(location: number, x: number, y: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform2fv(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform2fvFunction(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform2i(location: number, x: number, y: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform2iFunction(location: number, x: number, y: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform2iv(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform2ivFunction(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glUniform2ui(location: number, v0: number, v1: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glUniform2uiv(location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform3f(location: number, x: number, y: number, z: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform3fFunction(location: number, x: number, y: number, z: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform3fv(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform3fvFunction(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform3i(location: number, x: number, y: number, z: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform3iFunction(location: number, x: number, y: number, z: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform3iv(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform3ivFunction(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glUniform3ui(location: number, v0: number, v1: number, v2: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glUniform3uiv(location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform4f(location: number, x: number, y: number, z: number, w: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform4fFunction(location: number, x: number, y: number, z: number, w: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform4fv(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform4fvFunction(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform4i(location: number, x: number, y: number, z: number, w: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform4iFunction(location: number, x: number, y: number, z: number, w: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform4iv(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniform4ivFunction(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glUniform4ui(location: number, v0: number, v1: number, v2: number, v3: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glUniform4uiv(location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glUniformBlockBinding(program: number, uniformBlockIndex: number, uniformBlockBinding: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniformMatrix2fv(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniformMatrix2fvFunction(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glUniformMatrix2x3fv(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glUniformMatrix2x4fv(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniformMatrix3fv(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniformMatrix3fvFunction(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glUniformMatrix3x2fv(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glUniformMatrix3x4fv(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniformMatrix4fv(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUniformMatrix4fvFunction(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glUniformMatrix4x2fv(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glUniformMatrix4x3fv(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glUnmapBuffer(target: number): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUnmapBufferOES(target: number): number;

declare function glUnmapBufferOESFunction(target: number): number;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUseProgram(program: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glUseProgramFunction(program: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glUseProgramStagesEXT(pipeline: number, stages: number, program: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glUseProgramStagesEXTFunction(pipeline: number, stages: number, program: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glValidateProgram(program: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glValidateProgramFunction(program: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glValidateProgramPipelineEXT(pipeline: number): void;

/**
 * @since 5.0
 * @deprecated 12.0
 */
declare function glValidateProgramPipelineEXTFunction(pipeline: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glVertexAttrib1f(indx: number, x: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glVertexAttrib1fFunction(indx: number, x: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glVertexAttrib1fv(indx: number, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glVertexAttrib1fvFunction(indx: number, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glVertexAttrib2f(indx: number, x: number, y: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glVertexAttrib2fFunction(indx: number, x: number, y: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glVertexAttrib2fv(indx: number, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glVertexAttrib2fvFunction(indx: number, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glVertexAttrib3f(indx: number, x: number, y: number, z: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glVertexAttrib3fFunction(indx: number, x: number, y: number, z: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glVertexAttrib3fv(indx: number, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glVertexAttrib3fvFunction(indx: number, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glVertexAttrib4f(indx: number, x: number, y: number, z: number, w: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glVertexAttrib4fFunction(indx: number, x: number, y: number, z: number, w: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glVertexAttrib4fv(indx: number, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glVertexAttrib4fvFunction(indx: number, values: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glVertexAttribDivisor(index: number, divisor: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glVertexAttribDivisorEXT(index: number, divisor: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glVertexAttribI4i(index: number, x: number, y: number, z: number, w: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glVertexAttribI4iv(index: number, v: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glVertexAttribI4ui(index: number, x: number, y: number, z: number, w: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glVertexAttribI4uiv(index: number, v: interop.Pointer | interop.Reference<number>): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glVertexAttribIPointer(index: number, size: number, type: number, stride: number, pointer: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glVertexAttribPointer(indx: number, size: number, type: number, normalized: number, stride: number, ptr: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glVertexAttribPointerFunction(indx: number, size: number, type: number, normalized: number, stride: number, ptr: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glVertexPointer(size: number, type: number, stride: number, pointer: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glViewport(x: number, y: number, width: number, height: number): void;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare function glViewportFunction(x: number, y: number, width: number, height: number): void;

declare function glViewportFunction2(x: number, y: number, width: number, height: number): void;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare function glWaitSync(sync: interop.Pointer | interop.Reference<any>, flags: number, timeout: number): void;

/**
 * @since 6.0
 * @deprecated 12.0
 */
declare function glWaitSyncAPPLE(sync: interop.Pointer | interop.Reference<any>, flags: number, timeout: number): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare function glWeightPointerOES(size: number, type: number, stride: number, pointer: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare var kEAGLColorFormatRGB565: string;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare var kEAGLColorFormatRGBA8: string;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare var kEAGLColorFormatSRGBA8: string;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare var kEAGLDrawablePropertyColorFormat: string;

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare var kEAGLDrawablePropertyRetainedBacking: string;
