
declare class EAGLContext extends NSObject {

	static alloc(): EAGLContext; // inherited from NSObject

	static currentContext(): EAGLContext;

	static new(): EAGLContext; // inherited from NSObject

	static setCurrentContext(context: EAGLContext): boolean;

	readonly API: EAGLRenderingAPI;

	debugLabel: string;

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

interface EAGLDrawable {

	drawableProperties: NSDictionary<string, any>;
}
declare var EAGLDrawable: {

	prototype: EAGLDrawable;
};

declare function EAGLGetVersion(major: interop.Pointer | interop.Reference<number>, minor: interop.Pointer | interop.Reference<number>): void;

declare const enum EAGLRenderingAPI {

	kEAGLRenderingAPIOpenGLES1 = 1,

	kEAGLRenderingAPIOpenGLES2 = 2,

	kEAGLRenderingAPIOpenGLES3 = 3
}

declare class EAGLSharegroup extends NSObject {

	static alloc(): EAGLSharegroup; // inherited from NSObject

	static new(): EAGLSharegroup; // inherited from NSObject

	debugLabel: string;
}

declare function glActiveShaderProgramEXT(pipeline: number, program: number): void;

declare function glActiveShaderProgramEXTFunction(pipeline: number, program: number): void;

declare function glActiveTexture(texture: number): void;

declare function glActiveTextureFunction(texture: number): void;

declare function glActiveTextureFunction2(texture: number): void;

declare function glAlphaFunc(func: number, ref: number): void;

declare function glAlphaFuncx(func: number, ref: number): void;

declare function glAttachShader(program: number, shader: number): void;

declare function glAttachShaderFunction(program: number, shader: number): void;

declare function glBeginQuery(target: number, id: number): void;

declare function glBeginQueryEXT(target: number, id: number): void;

declare function glBeginTransformFeedback(primitiveMode: number): void;

declare function glBindAttribLocation(program: number, index: number, name: string | interop.Pointer | interop.Reference<any>): void;

declare function glBindAttribLocationFunction(program: number, index: number, name: string | interop.Pointer | interop.Reference<any>): void;

declare function glBindBuffer(target: number, buffer: number): void;

declare function glBindBufferBase(target: number, index: number, buffer: number): void;

declare function glBindBufferFunction(target: number, buffer: number): void;

declare function glBindBufferFunction2(target: number, buffer: number): void;

declare function glBindBufferRange(target: number, index: number, buffer: number, offset: number, size: number): void;

declare function glBindFramebuffer(target: number, framebuffer: number): void;

declare function glBindFramebufferFunction(target: number, framebuffer: number): void;

declare function glBindFramebufferOES(target: number, framebuffer: number): void;

declare function glBindProgramPipelineEXT(pipeline: number): void;

declare function glBindProgramPipelineEXTFunction(pipeline: number): void;

declare function glBindRenderbuffer(target: number, renderbuffer: number): void;

declare function glBindRenderbufferFunction(target: number, renderbuffer: number): void;

declare function glBindRenderbufferOES(target: number, renderbuffer: number): void;

declare function glBindSampler(unit: number, sampler: number): void;

declare function glBindTexture(target: number, texture: number): void;

declare function glBindTextureFunction(target: number, texture: number): void;

declare function glBindTextureFunction2(target: number, texture: number): void;

declare function glBindTransformFeedback(target: number, id: number): void;

declare function glBindVertexArray(array: number): void;

declare function glBindVertexArrayOES(array: number): void;

declare function glBindVertexArrayOESFunction(array: number): void;

declare function glBlendColor(red: number, green: number, blue: number, alpha: number): void;

declare function glBlendColorFunction(red: number, green: number, blue: number, alpha: number): void;

declare function glBlendEquation(mode: number): void;

declare function glBlendEquationFunction(mode: number): void;

declare function glBlendEquationOES(mode: number): void;

declare function glBlendEquationSeparate(modeRGB: number, modeAlpha: number): void;

declare function glBlendEquationSeparateFunction(modeRGB: number, modeAlpha: number): void;

declare function glBlendEquationSeparateOES(modeRGB: number, modeAlpha: number): void;

declare function glBlendFunc(sfactor: number, dfactor: number): void;

declare function glBlendFuncFunction(sfactor: number, dfactor: number): void;

declare function glBlendFuncFunction2(sfactor: number, dfactor: number): void;

declare function glBlendFuncSeparate(srcRGB: number, dstRGB: number, srcAlpha: number, dstAlpha: number): void;

declare function glBlendFuncSeparateFunction(srcRGB: number, dstRGB: number, srcAlpha: number, dstAlpha: number): void;

declare function glBlendFuncSeparateOES(srcRGB: number, dstRGB: number, srcAlpha: number, dstAlpha: number): void;

declare function glBlitFramebuffer(srcX0: number, srcY0: number, srcX1: number, srcY1: number, dstX0: number, dstY0: number, dstX1: number, dstY1: number, mask: number, filter: number): void;

declare function glBufferData(target: number, size: number, data: interop.Pointer | interop.Reference<any>, usage: number): void;

declare function glBufferDataFunction(target: number, size: number, data: interop.Pointer | interop.Reference<any>, usage: number): void;

declare function glBufferDataFunction2(target: number, size: number, data: interop.Pointer | interop.Reference<any>, usage: number): void;

declare function glBufferSubData(target: number, offset: number, size: number, data: interop.Pointer | interop.Reference<any>): void;

declare function glBufferSubDataFunction(target: number, offset: number, size: number, data: interop.Pointer | interop.Reference<any>): void;

declare function glBufferSubDataFunction2(target: number, offset: number, size: number, data: interop.Pointer | interop.Reference<any>): void;

declare function glCheckFramebufferStatus(target: number): number;

declare function glCheckFramebufferStatusFunction(target: number): number;

declare function glCheckFramebufferStatusOES(target: number): number;

declare function glClear(mask: number): void;

declare function glClearBufferfi(buffer: number, drawbuffer: number, depth: number, stencil: number): void;

declare function glClearBufferfv(buffer: number, drawbuffer: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glClearBufferiv(buffer: number, drawbuffer: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glClearBufferuiv(buffer: number, drawbuffer: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glClearColor(red: number, green: number, blue: number, alpha: number): void;

declare function glClearColorFunction(red: number, green: number, blue: number, alpha: number): void;

declare function glClearColorFunction2(red: number, green: number, blue: number, alpha: number): void;

declare function glClearColorx(red: number, green: number, blue: number, alpha: number): void;

declare function glClearDepthf(depth: number): void;

declare function glClearDepthfFunction(depth: number): void;

declare function glClearDepthfFunction2(depth: number): void;

declare function glClearDepthx(depth: number): void;

declare function glClearFunction(mask: number): void;

declare function glClearFunction2(mask: number): void;

declare function glClearStencil(s: number): void;

declare function glClearStencilFunction(s: number): void;

declare function glClearStencilFunction2(s: number): void;

declare function glClientActiveTexture(texture: number): void;

declare function glClientWaitSync(sync: interop.Pointer | interop.Reference<any>, flags: number, timeout: number): number;

declare function glClientWaitSyncAPPLE(sync: interop.Pointer | interop.Reference<any>, flags: number, timeout: number): number;

declare function glClipPlanef(plane: number, equation: interop.Pointer | interop.Reference<number>): void;

declare function glClipPlanex(plane: number, equation: interop.Pointer | interop.Reference<number>): void;

declare function glColor4f(red: number, green: number, blue: number, alpha: number): void;

declare function glColor4ub(red: number, green: number, blue: number, alpha: number): void;

declare function glColor4x(red: number, green: number, blue: number, alpha: number): void;

declare function glColorMask(red: number, green: number, blue: number, alpha: number): void;

declare function glColorMaskFunction(red: number, green: number, blue: number, alpha: number): void;

declare function glColorMaskFunction2(red: number, green: number, blue: number, alpha: number): void;

declare function glColorPointer(size: number, type: number, stride: number, pointer: interop.Pointer | interop.Reference<any>): void;

declare function glCompileShader(shader: number): void;

declare function glCompileShaderFunction(shader: number): void;

declare function glCompressedTexImage2D(target: number, level: number, internalformat: number, width: number, height: number, border: number, imageSize: number, data: interop.Pointer | interop.Reference<any>): void;

declare function glCompressedTexImage2DFunction(target: number, level: number, internalformat: number, width: number, height: number, border: number, imageSize: number, data: interop.Pointer | interop.Reference<any>): void;

declare function glCompressedTexImage2DFunction2(target: number, level: number, internalformat: number, width: number, height: number, border: number, imageSize: number, data: interop.Pointer | interop.Reference<any>): void;

declare function glCompressedTexImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, imageSize: number, data: interop.Pointer | interop.Reference<any>): void;

declare function glCompressedTexSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, imageSize: number, data: interop.Pointer | interop.Reference<any>): void;

declare function glCompressedTexSubImage2DFunction(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, imageSize: number, data: interop.Pointer | interop.Reference<any>): void;

declare function glCompressedTexSubImage2DFunction2(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, imageSize: number, data: interop.Pointer | interop.Reference<any>): void;

declare function glCompressedTexSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, width: number, height: number, depth: number, format: number, imageSize: number, data: interop.Pointer | interop.Reference<any>): void;

declare function glCopyBufferSubData(readTarget: number, writeTarget: number, readOffset: number, writeOffset: number, size: number): void;

declare function glCopyTexImage2D(target: number, level: number, internalformat: number, x: number, y: number, width: number, height: number, border: number): void;

declare function glCopyTexImage2DFunction(target: number, level: number, internalformat: number, x: number, y: number, width: number, height: number, border: number): void;

declare function glCopyTexImage2DFunction2(target: number, level: number, internalformat: number, x: number, y: number, width: number, height: number, border: number): void;

declare function glCopyTexSubImage2D(target: number, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number): void;

declare function glCopyTexSubImage2DFunction(target: number, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number): void;

declare function glCopyTexSubImage2DFunction2(target: number, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number): void;

declare function glCopyTexSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, x: number, y: number, width: number, height: number): void;

declare function glCopyTextureLevelsAPPLE(destinationTexture: number, sourceTexture: number, sourceBaseLevel: number, sourceLevelCount: number): void;

declare function glCopyTextureLevelsAPPLEFunction(destinationTexture: number, sourceTexture: number, sourceBaseLevel: number, sourceLevelCount: number): void;

declare function glCopyTextureLevelsAPPLEFunction2(destinationTexture: number, sourceTexture: number, sourceBaseLevel: number, sourceLevelCount: number): void;

declare function glCreateProgram(): number;

declare function glCreateProgramFunction(): number;

declare function glCreateShader(type: number): number;

declare function glCreateShaderFunction(type: number): number;

declare function glCreateShaderProgramvEXT(type: number, count: number, strings: interop.Pointer | interop.Reference<string>): number;

declare function glCreateShaderProgramvEXTFunction(type: number, count: number, strings: interop.Pointer | interop.Reference<string>): number;

declare function glCullFace(mode: number): void;

declare function glCullFaceFunction(mode: number): void;

declare function glCullFaceFunction2(mode: number): void;

declare function glCurrentPaletteMatrixOES(matrixpaletteindex: number): void;

declare function glDeleteBuffers(n: number, buffers: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteBuffersFunction(n: number, buffers: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteBuffersFunction2(n: number, buffers: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteFramebuffers(n: number, framebuffers: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteFramebuffersFunction(n: number, framebuffers: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteFramebuffersOES(n: number, framebuffers: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteProgram(program: number): void;

declare function glDeleteProgramFunction(program: number): void;

declare function glDeleteProgramPipelinesEXT(n: number, pipelines: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteProgramPipelinesEXTFunction(n: number, pipelines: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteQueries(n: number, ids: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteQueriesEXT(n: number, ids: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteRenderbuffers(n: number, renderbuffers: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteRenderbuffersFunction(n: number, renderbuffers: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteRenderbuffersOES(n: number, renderbuffers: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteSamplers(count: number, samplers: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteShader(shader: number): void;

declare function glDeleteShaderFunction(shader: number): void;

declare function glDeleteSync(sync: interop.Pointer | interop.Reference<any>): void;

declare function glDeleteSyncAPPLE(sync: interop.Pointer | interop.Reference<any>): void;

declare function glDeleteTextures(n: number, textures: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteTexturesFunction(n: number, textures: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteTexturesFunction2(n: number, textures: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteTransformFeedbacks(n: number, ids: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteVertexArrays(n: number, arrays: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteVertexArraysOES(n: number, arrays: interop.Pointer | interop.Reference<number>): void;

declare function glDeleteVertexArraysOESFunction(n: number, arrays: interop.Pointer | interop.Reference<number>): void;

declare function glDepthFunc(func: number): void;

declare function glDepthFuncFunction(func: number): void;

declare function glDepthFuncFunction2(func: number): void;

declare function glDepthMask(flag: number): void;

declare function glDepthMaskFunction(flag: number): void;

declare function glDepthMaskFunction2(flag: number): void;

declare function glDepthRangef(zNear: number, zFar: number): void;

declare function glDepthRangefFunction(zNear: number, zFar: number): void;

declare function glDepthRangefFunction2(zNear: number, zFar: number): void;

declare function glDepthRangex(zNear: number, zFar: number): void;

declare function glDetachShader(program: number, shader: number): void;

declare function glDetachShaderFunction(program: number, shader: number): void;

declare function glDisable(cap: number): void;

declare function glDisableClientState(array: number): void;

declare function glDisableFunction(cap: number): void;

declare function glDisableFunction2(cap: number): void;

declare function glDisableVertexAttribArray(index: number): void;

declare function glDisableVertexAttribArrayFunction(index: number): void;

declare function glDiscardFramebufferEXT(target: number, numAttachments: number, attachments: interop.Pointer | interop.Reference<number>): void;

declare function glDiscardFramebufferEXTFunction(target: number, numAttachments: number, attachments: interop.Pointer | interop.Reference<number>): void;

declare function glDrawArrays(mode: number, first: number, count: number): void;

declare function glDrawArraysFunction(mode: number, first: number, count: number): void;

declare function glDrawArraysFunction2(mode: number, first: number, count: number): void;

declare function glDrawArraysInstanced(mode: number, first: number, count: number, instancecount: number): void;

declare function glDrawArraysInstancedEXT(mode: number, first: number, count: number, instanceCount: number): void;

declare function glDrawBuffers(n: number, bufs: interop.Pointer | interop.Reference<number>): void;

declare function glDrawElements(mode: number, count: number, type: number, indices: interop.Pointer | interop.Reference<any>): void;

declare function glDrawElementsFunction(mode: number, count: number, type: number, indices: interop.Pointer | interop.Reference<any>): void;

declare function glDrawElementsFunction2(mode: number, count: number, type: number, indices: interop.Pointer | interop.Reference<any>): void;

declare function glDrawElementsInstanced(mode: number, count: number, type: number, indices: interop.Pointer | interop.Reference<any>, instancecount: number): void;

declare function glDrawElementsInstancedEXT(mode: number, count: number, type: number, indices: interop.Pointer | interop.Reference<any>, instanceCount: number): void;

declare function glDrawRangeElements(mode: number, start: number, end: number, count: number, type: number, indices: interop.Pointer | interop.Reference<any>): void;

declare function glDrawTexfOES(x: number, y: number, z: number, width: number, height: number): void;

declare function glDrawTexfvOES(coords: interop.Pointer | interop.Reference<number>): void;

declare function glDrawTexiOES(x: number, y: number, z: number, width: number, height: number): void;

declare function glDrawTexivOES(coords: interop.Pointer | interop.Reference<number>): void;

declare function glDrawTexsOES(x: number, y: number, z: number, width: number, height: number): void;

declare function glDrawTexsvOES(coords: interop.Pointer | interop.Reference<number>): void;

declare function glDrawTexxOES(x: number, y: number, z: number, width: number, height: number): void;

declare function glDrawTexxvOES(coords: interop.Pointer | interop.Reference<number>): void;

declare function glEnable(cap: number): void;

declare function glEnableClientState(array: number): void;

declare function glEnableFunction(cap: number): void;

declare function glEnableFunction2(cap: number): void;

declare function glEnableVertexAttribArray(index: number): void;

declare function glEnableVertexAttribArrayFunction(index: number): void;

declare function glEndQuery(target: number): void;

declare function glEndQueryEXT(target: number): void;

declare function glEndTransformFeedback(): void;

declare function glFenceSync(condition: number, flags: number): interop.Pointer | interop.Reference<any>;

declare function glFenceSyncAPPLE(condition: number, flags: number): interop.Pointer | interop.Reference<any>;

declare function glFinish(): void;

declare function glFinishFunction(): void;

declare function glFinishFunction2(): void;

declare function glFlush(): void;

declare function glFlushFunction(): void;

declare function glFlushFunction2(): void;

declare function glFlushMappedBufferRange(target: number, offset: number, length: number): void;

declare function glFlushMappedBufferRangeEXT(target: number, offset: number, length: number): void;

declare function glFlushMappedBufferRangeEXTFunction(target: number, offset: number, length: number): void;

declare function glFogf(pname: number, param: number): void;

declare function glFogfv(pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glFogx(pname: number, param: number): void;

declare function glFogxv(pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glFramebufferRenderbuffer(target: number, attachment: number, renderbuffertarget: number, renderbuffer: number): void;

declare function glFramebufferRenderbufferFunction(target: number, attachment: number, renderbuffertarget: number, renderbuffer: number): void;

declare function glFramebufferRenderbufferOES(target: number, attachment: number, renderbuffertarget: number, renderbuffer: number): void;

declare function glFramebufferTexture2D(target: number, attachment: number, textarget: number, texture: number, level: number): void;

declare function glFramebufferTexture2DFunction(target: number, attachment: number, textarget: number, texture: number, level: number): void;

declare function glFramebufferTexture2DOES(target: number, attachment: number, textarget: number, texture: number, level: number): void;

declare function glFramebufferTextureLayer(target: number, attachment: number, texture: number, level: number, layer: number): void;

declare function glFrontFace(mode: number): void;

declare function glFrontFaceFunction(mode: number): void;

declare function glFrontFaceFunction2(mode: number): void;

declare function glFrustumf(left: number, right: number, bottom: number, top: number, zNear: number, zFar: number): void;

declare function glFrustumx(left: number, right: number, bottom: number, top: number, zNear: number, zFar: number): void;

declare function glGenBuffers(n: number, buffers: interop.Pointer | interop.Reference<number>): void;

declare function glGenBuffersFunction(n: number, buffers: interop.Pointer | interop.Reference<number>): void;

declare function glGenBuffersFunction2(n: number, buffers: interop.Pointer | interop.Reference<number>): void;

declare function glGenFramebuffers(n: number, framebuffers: interop.Pointer | interop.Reference<number>): void;

declare function glGenFramebuffersFunction(n: number, framebuffers: interop.Pointer | interop.Reference<number>): void;

declare function glGenFramebuffersOES(n: number, framebuffers: interop.Pointer | interop.Reference<number>): void;

declare function glGenProgramPipelinesEXT(n: number, pipelines: interop.Pointer | interop.Reference<number>): void;

declare function glGenProgramPipelinesEXTFunction(n: number, pipelines: interop.Pointer | interop.Reference<number>): void;

declare function glGenQueries(n: number, ids: interop.Pointer | interop.Reference<number>): void;

declare function glGenQueriesEXT(n: number, ids: interop.Pointer | interop.Reference<number>): void;

declare function glGenRenderbuffers(n: number, renderbuffers: interop.Pointer | interop.Reference<number>): void;

declare function glGenRenderbuffersFunction(n: number, renderbuffers: interop.Pointer | interop.Reference<number>): void;

declare function glGenRenderbuffersOES(n: number, renderbuffers: interop.Pointer | interop.Reference<number>): void;

declare function glGenSamplers(count: number, samplers: interop.Pointer | interop.Reference<number>): void;

declare function glGenTextures(n: number, textures: interop.Pointer | interop.Reference<number>): void;

declare function glGenTexturesFunction(n: number, textures: interop.Pointer | interop.Reference<number>): void;

declare function glGenTexturesFunction2(n: number, textures: interop.Pointer | interop.Reference<number>): void;

declare function glGenTransformFeedbacks(n: number, ids: interop.Pointer | interop.Reference<number>): void;

declare function glGenVertexArrays(n: number, arrays: interop.Pointer | interop.Reference<number>): void;

declare function glGenVertexArraysOES(n: number, arrays: interop.Pointer | interop.Reference<number>): void;

declare function glGenVertexArraysOESFunction(n: number, arrays: interop.Pointer | interop.Reference<number>): void;

declare function glGenerateMipmap(target: number): void;

declare function glGenerateMipmapFunction(target: number): void;

declare function glGenerateMipmapOES(target: number): void;

declare function glGetActiveAttrib(program: number, index: number, bufsize: number, length: interop.Pointer | interop.Reference<number>, size: interop.Pointer | interop.Reference<number>, type: interop.Pointer | interop.Reference<number>, name: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetActiveAttribFunction(program: number, index: number, bufsize: number, length: interop.Pointer | interop.Reference<number>, size: interop.Pointer | interop.Reference<number>, type: interop.Pointer | interop.Reference<number>, name: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetActiveUniform(program: number, index: number, bufsize: number, length: interop.Pointer | interop.Reference<number>, size: interop.Pointer | interop.Reference<number>, type: interop.Pointer | interop.Reference<number>, name: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetActiveUniformBlockName(program: number, uniformBlockIndex: number, bufSize: number, length: interop.Pointer | interop.Reference<number>, uniformBlockName: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetActiveUniformBlockiv(program: number, uniformBlockIndex: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetActiveUniformFunction(program: number, index: number, bufsize: number, length: interop.Pointer | interop.Reference<number>, size: interop.Pointer | interop.Reference<number>, type: interop.Pointer | interop.Reference<number>, name: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetActiveUniformsiv(program: number, uniformCount: number, uniformIndices: interop.Pointer | interop.Reference<number>, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetAttachedShaders(program: number, maxcount: number, count: interop.Pointer | interop.Reference<number>, shaders: interop.Pointer | interop.Reference<number>): void;

declare function glGetAttachedShadersFunction(program: number, maxcount: number, count: interop.Pointer | interop.Reference<number>, shaders: interop.Pointer | interop.Reference<number>): void;

declare function glGetAttribLocation(program: number, name: string | interop.Pointer | interop.Reference<any>): number;

declare function glGetAttribLocationFunction(program: number, name: string | interop.Pointer | interop.Reference<any>): number;

declare function glGetBooleanv(pname: number, params: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetBooleanvFunction(pname: number, params: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetBooleanvFunction2(pname: number, params: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetBufferParameteri64v(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetBufferParameteriv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetBufferParameterivFunction(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetBufferParameterivFunction2(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetBufferPointerv(target: number, pname: number, params: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

declare function glGetBufferPointervOES(target: number, pname: number, params: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

declare function glGetBufferPointervOESFunction(target: number, pname: number, params: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

declare function glGetClipPlanef(pname: number, equation: interop.Pointer | interop.Reference<number>): void;

declare function glGetClipPlanex(pname: number, eqn: interop.Reference<number>): void;

declare function glGetError(): number;

declare function glGetErrorFunction(): number;

declare function glGetErrorFunction2(): number;

declare function glGetFixedv(pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetFloatv(pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetFloatvFunction(pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetFloatvFunction2(pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetFragDataLocation(program: number, name: string | interop.Pointer | interop.Reference<any>): number;

declare function glGetFramebufferAttachmentParameteriv(target: number, attachment: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetFramebufferAttachmentParameterivFunction(target: number, attachment: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetFramebufferAttachmentParameterivOES(target: number, attachment: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetInteger64i_v(target: number, index: number, data: interop.Pointer | interop.Reference<number>): void;

declare function glGetInteger64v(pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetInteger64vAPPLE(pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetIntegeri_v(target: number, index: number, data: interop.Pointer | interop.Reference<number>): void;

declare function glGetIntegerv(pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetIntegervFunction(pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetIntegervFunction2(pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetInternalformativ(target: number, internalformat: number, pname: number, bufSize: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetLightfv(light: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetLightxv(light: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetMaterialfv(face: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetMaterialxv(face: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetObjectLabelEXT(type: number, object: number, bufSize: number, length: interop.Pointer | interop.Reference<number>, label: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetObjectLabelEXTFunction(type: number, object: number, bufSize: number, length: interop.Pointer | interop.Reference<number>, label: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetObjectLabelEXTFunction2(type: number, object: number, bufSize: number, length: interop.Pointer | interop.Reference<number>, label: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetPointerv(pname: number, params: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

declare function glGetProgramBinary(program: number, bufSize: number, length: interop.Pointer | interop.Reference<number>, binaryFormat: interop.Pointer | interop.Reference<number>, binary: interop.Pointer | interop.Reference<any>): void;

declare function glGetProgramInfoLog(program: number, bufsize: number, length: interop.Pointer | interop.Reference<number>, infolog: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetProgramInfoLogFunction(program: number, bufsize: number, length: interop.Pointer | interop.Reference<number>, infolog: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetProgramPipelineInfoLogEXT(pipeline: number, bufSize: number, length: interop.Pointer | interop.Reference<number>, infoLog: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetProgramPipelineInfoLogEXTFunction(pipeline: number, bufSize: number, length: interop.Pointer | interop.Reference<number>, infoLog: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetProgramPipelineivEXT(pipeline: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetProgramPipelineivEXTFunction(pipeline: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetProgramiv(program: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetProgramivFunction(program: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetQueryObjectuiv(id: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetQueryObjectuivEXT(id: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetQueryiv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetQueryivEXT(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetRenderbufferParameteriv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetRenderbufferParameterivFunction(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetRenderbufferParameterivOES(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetSamplerParameterfv(sampler: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetSamplerParameteriv(sampler: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetShaderInfoLog(shader: number, bufsize: number, length: interop.Pointer | interop.Reference<number>, infolog: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetShaderInfoLogFunction(shader: number, bufsize: number, length: interop.Pointer | interop.Reference<number>, infolog: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetShaderPrecisionFormat(shadertype: number, precisiontype: number, range: interop.Pointer | interop.Reference<number>, precision: interop.Pointer | interop.Reference<number>): void;

declare function glGetShaderPrecisionFormatFunction(shadertype: number, precisiontype: number, range: interop.Pointer | interop.Reference<number>, precision: interop.Pointer | interop.Reference<number>): void;

declare function glGetShaderSource(shader: number, bufsize: number, length: interop.Pointer | interop.Reference<number>, source: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetShaderSourceFunction(shader: number, bufsize: number, length: interop.Pointer | interop.Reference<number>, source: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetShaderiv(shader: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetShaderivFunction(shader: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetString(name: number): string;

declare function glGetStringFunction(name: number): string;

declare function glGetStringFunction2(name: number): string;

declare function glGetStringi(name: number, index: number): string;

declare function glGetSynciv(sync: interop.Pointer | interop.Reference<any>, pname: number, bufSize: number, length: interop.Pointer | interop.Reference<number>, values: interop.Pointer | interop.Reference<number>): void;

declare function glGetSyncivAPPLE(sync: interop.Pointer | interop.Reference<any>, pname: number, bufSize: number, length: interop.Pointer | interop.Reference<number>, values: interop.Pointer | interop.Reference<number>): void;

declare function glGetTexEnvfv(env: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetTexEnviv(env: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetTexEnvxv(env: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetTexParameterfv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetTexParameterfvFunction(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetTexParameterfvFunction2(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetTexParameteriv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetTexParameterivFunction(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetTexParameterivFunction2(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetTexParameterxv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetTransformFeedbackVarying(program: number, index: number, bufSize: number, length: interop.Pointer | interop.Reference<number>, size: interop.Pointer | interop.Reference<number>, type: interop.Pointer | interop.Reference<number>, name: string | interop.Pointer | interop.Reference<any>): void;

declare function glGetUniformBlockIndex(program: number, uniformBlockName: string | interop.Pointer | interop.Reference<any>): number;

declare function glGetUniformIndices(program: number, uniformCount: number, uniformNames: interop.Pointer | interop.Reference<string>, uniformIndices: interop.Pointer | interop.Reference<number>): void;

declare function glGetUniformLocation(program: number, name: string | interop.Pointer | interop.Reference<any>): number;

declare function glGetUniformLocationFunction(program: number, name: string | interop.Pointer | interop.Reference<any>): number;

declare function glGetUniformfv(program: number, location: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetUniformfvFunction(program: number, location: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetUniformiv(program: number, location: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetUniformivFunction(program: number, location: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetUniformuiv(program: number, location: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetVertexAttribIiv(index: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetVertexAttribIuiv(index: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetVertexAttribPointerv(index: number, pname: number, pointer: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

declare function glGetVertexAttribPointervFunction(index: number, pname: number, pointer: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

declare function glGetVertexAttribfv(index: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetVertexAttribfvFunction(index: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetVertexAttribiv(index: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glGetVertexAttribivFunction(index: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glHint(target: number, mode: number): void;

declare function glHintFunction(target: number, mode: number): void;

declare function glHintFunction2(target: number, mode: number): void;

declare function glInsertEventMarkerEXT(length: number, marker: string | interop.Pointer | interop.Reference<any>): void;

declare function glInsertEventMarkerEXTFunction(length: number, marker: string | interop.Pointer | interop.Reference<any>): void;

declare function glInsertEventMarkerEXTFunction2(length: number, marker: string | interop.Pointer | interop.Reference<any>): void;

declare function glInvalidateFramebuffer(target: number, numAttachments: number, attachments: interop.Pointer | interop.Reference<number>): void;

declare function glInvalidateSubFramebuffer(target: number, numAttachments: number, attachments: interop.Pointer | interop.Reference<number>, x: number, y: number, width: number, height: number): void;

declare function glIsBuffer(buffer: number): number;

declare function glIsBufferFunction(buffer: number): number;

declare function glIsBufferFunction2(buffer: number): number;

declare function glIsEnabled(cap: number): number;

declare function glIsEnabledFunction(cap: number): number;

declare function glIsEnabledFunction2(cap: number): number;

declare function glIsFramebuffer(framebuffer: number): number;

declare function glIsFramebufferFunction(framebuffer: number): number;

declare function glIsFramebufferOES(framebuffer: number): number;

declare function glIsProgram(program: number): number;

declare function glIsProgramFunction(program: number): number;

declare function glIsProgramPipelineEXT(pipeline: number): number;

declare function glIsProgramPipelineEXTFunction(pipeline: number): number;

declare function glIsQuery(id: number): number;

declare function glIsQueryEXT(id: number): number;

declare function glIsRenderbuffer(renderbuffer: number): number;

declare function glIsRenderbufferFunction(renderbuffer: number): number;

declare function glIsRenderbufferOES(renderbuffer: number): number;

declare function glIsSampler(sampler: number): number;

declare function glIsShader(shader: number): number;

declare function glIsShaderFunction(shader: number): number;

declare function glIsSync(sync: interop.Pointer | interop.Reference<any>): number;

declare function glIsSyncAPPLE(sync: interop.Pointer | interop.Reference<any>): number;

declare function glIsTexture(texture: number): number;

declare function glIsTextureFunction(texture: number): number;

declare function glIsTextureFunction2(texture: number): number;

declare function glIsTransformFeedback(id: number): number;

declare function glIsVertexArray(array: number): number;

declare function glIsVertexArrayOES(array: number): number;

declare function glIsVertexArrayOESFunction(array: number): number;

declare function glLabelObjectEXT(type: number, object: number, length: number, label: string | interop.Pointer | interop.Reference<any>): void;

declare function glLabelObjectEXTFunction(type: number, object: number, length: number, label: string | interop.Pointer | interop.Reference<any>): void;

declare function glLabelObjectEXTFunction2(type: number, object: number, length: number, label: string | interop.Pointer | interop.Reference<any>): void;

declare function glLightModelf(pname: number, param: number): void;

declare function glLightModelfv(pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glLightModelx(pname: number, param: number): void;

declare function glLightModelxv(pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glLightf(light: number, pname: number, param: number): void;

declare function glLightfv(light: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glLightx(light: number, pname: number, param: number): void;

declare function glLightxv(light: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glLineWidth(width: number): void;

declare function glLineWidthFunction(width: number): void;

declare function glLineWidthFunction2(width: number): void;

declare function glLineWidthx(width: number): void;

declare function glLinkProgram(program: number): void;

declare function glLinkProgramFunction(program: number): void;

declare function glLoadIdentity(): void;

declare function glLoadMatrixf(m: interop.Pointer | interop.Reference<number>): void;

declare function glLoadMatrixx(m: interop.Pointer | interop.Reference<number>): void;

declare function glLoadPaletteFromModelViewMatrixOES(): void;

declare function glLogicOp(opcode: number): void;

declare function glMapBufferOES(target: number, access: number): interop.Pointer | interop.Reference<any>;

declare function glMapBufferOESFunction(target: number, access: number): interop.Pointer | interop.Reference<any>;

declare function glMapBufferRange(target: number, offset: number, length: number, access: number): interop.Pointer | interop.Reference<any>;

declare function glMapBufferRangeEXT(target: number, offset: number, length: number, access: number): interop.Pointer | interop.Reference<any>;

declare function glMapBufferRangeEXTFunction(target: number, offset: number, length: number, access: number): interop.Pointer | interop.Reference<any>;

declare function glMaterialf(face: number, pname: number, param: number): void;

declare function glMaterialfv(face: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glMaterialx(face: number, pname: number, param: number): void;

declare function glMaterialxv(face: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glMatrixIndexPointerOES(size: number, type: number, stride: number, pointer: interop.Pointer | interop.Reference<any>): void;

declare function glMatrixMode(mode: number): void;

declare function glMultMatrixf(m: interop.Pointer | interop.Reference<number>): void;

declare function glMultMatrixx(m: interop.Pointer | interop.Reference<number>): void;

declare function glMultiTexCoord4f(target: number, s: number, t: number, r: number, q: number): void;

declare function glMultiTexCoord4x(target: number, s: number, t: number, r: number, q: number): void;

declare function glNormal3f(nx: number, ny: number, nz: number): void;

declare function glNormal3x(nx: number, ny: number, nz: number): void;

declare function glNormalPointer(type: number, stride: number, pointer: interop.Pointer | interop.Reference<any>): void;

declare function glOrthof(left: number, right: number, bottom: number, top: number, zNear: number, zFar: number): void;

declare function glOrthox(left: number, right: number, bottom: number, top: number, zNear: number, zFar: number): void;

declare function glPauseTransformFeedback(): void;

declare function glPixelStorei(pname: number, param: number): void;

declare function glPixelStoreiFunction(pname: number, param: number): void;

declare function glPixelStoreiFunction2(pname: number, param: number): void;

declare function glPointParameterf(pname: number, param: number): void;

declare function glPointParameterfv(pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glPointParameterx(pname: number, param: number): void;

declare function glPointParameterxv(pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glPointSize(size: number): void;

declare function glPointSizePointerOES(type: number, stride: number, pointer: interop.Pointer | interop.Reference<any>): void;

declare function glPointSizex(size: number): void;

declare function glPolygonOffset(factor: number, units: number): void;

declare function glPolygonOffsetFunction(factor: number, units: number): void;

declare function glPolygonOffsetFunction2(factor: number, units: number): void;

declare function glPolygonOffsetx(factor: number, units: number): void;

declare function glPopGroupMarkerEXT(): void;

declare function glPopGroupMarkerEXTFunction(): void;

declare function glPopGroupMarkerEXTFunction2(): void;

declare function glPopMatrix(): void;

declare function glProgramBinary(program: number, binaryFormat: number, binary: interop.Pointer | interop.Reference<any>, length: number): void;

declare function glProgramParameteri(program: number, pname: number, value: number): void;

declare function glProgramParameteriEXT(program: number, pname: number, value: number): void;

declare function glProgramParameteriEXTFunction(program: number, pname: number, value: number): void;

declare function glProgramUniform1fEXT(program: number, location: number, x: number): void;

declare function glProgramUniform1fEXTFunction(program: number, location: number, x: number): void;

declare function glProgramUniform1fvEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniform1fvEXTFunction(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniform1iEXT(program: number, location: number, x: number): void;

declare function glProgramUniform1iEXTFunction(program: number, location: number, x: number): void;

declare function glProgramUniform1ivEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniform1ivEXTFunction(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniform1uiEXT(program: number, location: number, x: number): void;

declare function glProgramUniform1uivEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniform2fEXT(program: number, location: number, x: number, y: number): void;

declare function glProgramUniform2fEXTFunction(program: number, location: number, x: number, y: number): void;

declare function glProgramUniform2fvEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniform2fvEXTFunction(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniform2iEXT(program: number, location: number, x: number, y: number): void;

declare function glProgramUniform2iEXTFunction(program: number, location: number, x: number, y: number): void;

declare function glProgramUniform2ivEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniform2ivEXTFunction(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniform2uiEXT(program: number, location: number, x: number, y: number): void;

declare function glProgramUniform2uivEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniform3fEXT(program: number, location: number, x: number, y: number, z: number): void;

declare function glProgramUniform3fEXTFunction(program: number, location: number, x: number, y: number, z: number): void;

declare function glProgramUniform3fvEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniform3fvEXTFunction(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniform3iEXT(program: number, location: number, x: number, y: number, z: number): void;

declare function glProgramUniform3iEXTFunction(program: number, location: number, x: number, y: number, z: number): void;

declare function glProgramUniform3ivEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniform3ivEXTFunction(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniform3uiEXT(program: number, location: number, x: number, y: number, z: number): void;

declare function glProgramUniform3uivEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniform4fEXT(program: number, location: number, x: number, y: number, z: number, w: number): void;

declare function glProgramUniform4fEXTFunction(program: number, location: number, x: number, y: number, z: number, w: number): void;

declare function glProgramUniform4fvEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniform4fvEXTFunction(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniform4iEXT(program: number, location: number, x: number, y: number, z: number, w: number): void;

declare function glProgramUniform4iEXTFunction(program: number, location: number, x: number, y: number, z: number, w: number): void;

declare function glProgramUniform4ivEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniform4ivEXTFunction(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniform4uiEXT(program: number, location: number, x: number, y: number, z: number, w: number): void;

declare function glProgramUniform4uivEXT(program: number, location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniformMatrix2fvEXT(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniformMatrix2fvEXTFunction(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniformMatrix2x3fvEXT(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniformMatrix2x4fvEXT(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniformMatrix3fvEXT(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniformMatrix3fvEXTFunction(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniformMatrix3x2fvEXT(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniformMatrix3x4fvEXT(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniformMatrix4fvEXT(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniformMatrix4fvEXTFunction(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniformMatrix4x2fvEXT(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glProgramUniformMatrix4x3fvEXT(program: number, location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glPushGroupMarkerEXT(length: number, marker: string | interop.Pointer | interop.Reference<any>): void;

declare function glPushGroupMarkerEXTFunction(length: number, marker: string | interop.Pointer | interop.Reference<any>): void;

declare function glPushGroupMarkerEXTFunction2(length: number, marker: string | interop.Pointer | interop.Reference<any>): void;

declare function glPushMatrix(): void;

declare function glReadBuffer(mode: number): void;

declare function glReadPixels(x: number, y: number, width: number, height: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

declare function glReadPixelsFunction(x: number, y: number, width: number, height: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

declare function glReadPixelsFunction2(x: number, y: number, width: number, height: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

declare function glReleaseShaderCompiler(): void;

declare function glReleaseShaderCompilerFunction(): void;

declare function glRenderbufferStorage(target: number, internalformat: number, width: number, height: number): void;

declare function glRenderbufferStorageFunction(target: number, internalformat: number, width: number, height: number): void;

declare function glRenderbufferStorageMultisample(target: number, samples: number, internalformat: number, width: number, height: number): void;

declare function glRenderbufferStorageMultisampleAPPLE(target: number, samples: number, internalformat: number, width: number, height: number): void;

declare function glRenderbufferStorageMultisampleAPPLEFunction(target: number, samples: number, internalformat: number, width: number, height: number): void;

declare function glRenderbufferStorageOES(target: number, internalformat: number, width: number, height: number): void;

declare function glResolveMultisampleFramebufferAPPLE(): void;

declare function glResolveMultisampleFramebufferAPPLEFunction(): void;

declare function glResumeTransformFeedback(): void;

declare function glRotatef(angle: number, x: number, y: number, z: number): void;

declare function glRotatex(angle: number, x: number, y: number, z: number): void;

declare function glSampleCoverage(value: number, invert: number): void;

declare function glSampleCoverageFunction(value: number, invert: number): void;

declare function glSampleCoverageFunction2(value: number, invert: number): void;

declare function glSampleCoveragex(value: number, invert: number): void;

declare function glSamplerParameterf(sampler: number, pname: number, param: number): void;

declare function glSamplerParameterfv(sampler: number, pname: number, param: interop.Pointer | interop.Reference<number>): void;

declare function glSamplerParameteri(sampler: number, pname: number, param: number): void;

declare function glSamplerParameteriv(sampler: number, pname: number, param: interop.Pointer | interop.Reference<number>): void;

declare function glScalef(x: number, y: number, z: number): void;

declare function glScalex(x: number, y: number, z: number): void;

declare function glScissor(x: number, y: number, width: number, height: number): void;

declare function glScissorFunction(x: number, y: number, width: number, height: number): void;

declare function glScissorFunction2(x: number, y: number, width: number, height: number): void;

declare function glShadeModel(mode: number): void;

declare function glShaderBinary(n: number, shaders: interop.Pointer | interop.Reference<number>, binaryformat: number, binary: interop.Pointer | interop.Reference<any>, length: number): void;

declare function glShaderBinaryFunction(n: number, shaders: interop.Pointer | interop.Reference<number>, binaryformat: number, binary: interop.Pointer | interop.Reference<any>, length: number): void;

declare function glShaderSource(shader: number, count: number, string: interop.Pointer | interop.Reference<string>, length: interop.Pointer | interop.Reference<number>): void;

declare function glShaderSourceFunction(shader: number, count: number, string: interop.Pointer | interop.Reference<string>, length: interop.Pointer | interop.Reference<number>): void;

declare function glStencilFunc(func: number, ref: number, mask: number): void;

declare function glStencilFuncFunction(func: number, ref: number, mask: number): void;

declare function glStencilFuncFunction2(func: number, ref: number, mask: number): void;

declare function glStencilFuncSeparate(face: number, func: number, ref: number, mask: number): void;

declare function glStencilFuncSeparateFunction(face: number, func: number, ref: number, mask: number): void;

declare function glStencilMask(mask: number): void;

declare function glStencilMaskFunction(mask: number): void;

declare function glStencilMaskFunction2(mask: number): void;

declare function glStencilMaskSeparate(face: number, mask: number): void;

declare function glStencilMaskSeparateFunction(face: number, mask: number): void;

declare function glStencilOp(fail: number, zfail: number, zpass: number): void;

declare function glStencilOpFunction(fail: number, zfail: number, zpass: number): void;

declare function glStencilOpFunction2(fail: number, zfail: number, zpass: number): void;

declare function glStencilOpSeparate(face: number, fail: number, zfail: number, zpass: number): void;

declare function glStencilOpSeparateFunction(face: number, fail: number, zfail: number, zpass: number): void;

declare function glTexCoordPointer(size: number, type: number, stride: number, pointer: interop.Pointer | interop.Reference<any>): void;

declare function glTexEnvf(target: number, pname: number, param: number): void;

declare function glTexEnvfv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glTexEnvi(target: number, pname: number, param: number): void;

declare function glTexEnviv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glTexEnvx(target: number, pname: number, param: number): void;

declare function glTexEnvxv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glTexImage2D(target: number, level: number, internalformat: number, width: number, height: number, border: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

declare function glTexImage2DFunction(target: number, level: number, internalformat: number, width: number, height: number, border: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

declare function glTexImage2DFunction2(target: number, level: number, internalformat: number, width: number, height: number, border: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

declare function glTexImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

declare function glTexParameterf(target: number, pname: number, param: number): void;

declare function glTexParameterfFunction(target: number, pname: number, param: number): void;

declare function glTexParameterfFunction2(target: number, pname: number, param: number): void;

declare function glTexParameterfv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glTexParameterfvFunction(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glTexParameterfvFunction2(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glTexParameteri(target: number, pname: number, param: number): void;

declare function glTexParameteriFunction(target: number, pname: number, param: number): void;

declare function glTexParameteriFunction2(target: number, pname: number, param: number): void;

declare function glTexParameteriv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glTexParameterivFunction(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glTexParameterivFunction2(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glTexParameterx(target: number, pname: number, param: number): void;

declare function glTexParameterxv(target: number, pname: number, params: interop.Pointer | interop.Reference<number>): void;

declare function glTexStorage2D(target: number, levels: number, internalformat: number, width: number, height: number): void;

declare function glTexStorage2DEXT(target: number, levels: number, internalformat: number, width: number, height: number): void;

declare function glTexStorage2DEXTFunction(target: number, levels: number, internalformat: number, width: number, height: number): void;

declare function glTexStorage3D(target: number, levels: number, internalformat: number, width: number, height: number, depth: number): void;

declare function glTexSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

declare function glTexSubImage2DFunction(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

declare function glTexSubImage2DFunction2(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

declare function glTexSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, width: number, height: number, depth: number, format: number, type: number, pixels: interop.Pointer | interop.Reference<any>): void;

declare function glTransformFeedbackVaryings(program: number, count: number, varyings: interop.Pointer | interop.Reference<string>, bufferMode: number): void;

declare function glTranslatef(x: number, y: number, z: number): void;

declare function glTranslatex(x: number, y: number, z: number): void;

declare function glUniform1f(location: number, x: number): void;

declare function glUniform1fFunction(location: number, x: number): void;

declare function glUniform1fv(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

declare function glUniform1fvFunction(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

declare function glUniform1i(location: number, x: number): void;

declare function glUniform1iFunction(location: number, x: number): void;

declare function glUniform1iv(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

declare function glUniform1ivFunction(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

declare function glUniform1ui(location: number, v0: number): void;

declare function glUniform1uiv(location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glUniform2f(location: number, x: number, y: number): void;

declare function glUniform2fFunction(location: number, x: number, y: number): void;

declare function glUniform2fv(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

declare function glUniform2fvFunction(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

declare function glUniform2i(location: number, x: number, y: number): void;

declare function glUniform2iFunction(location: number, x: number, y: number): void;

declare function glUniform2iv(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

declare function glUniform2ivFunction(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

declare function glUniform2ui(location: number, v0: number, v1: number): void;

declare function glUniform2uiv(location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glUniform3f(location: number, x: number, y: number, z: number): void;

declare function glUniform3fFunction(location: number, x: number, y: number, z: number): void;

declare function glUniform3fv(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

declare function glUniform3fvFunction(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

declare function glUniform3i(location: number, x: number, y: number, z: number): void;

declare function glUniform3iFunction(location: number, x: number, y: number, z: number): void;

declare function glUniform3iv(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

declare function glUniform3ivFunction(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

declare function glUniform3ui(location: number, v0: number, v1: number, v2: number): void;

declare function glUniform3uiv(location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glUniform4f(location: number, x: number, y: number, z: number, w: number): void;

declare function glUniform4fFunction(location: number, x: number, y: number, z: number, w: number): void;

declare function glUniform4fv(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

declare function glUniform4fvFunction(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

declare function glUniform4i(location: number, x: number, y: number, z: number, w: number): void;

declare function glUniform4iFunction(location: number, x: number, y: number, z: number, w: number): void;

declare function glUniform4iv(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

declare function glUniform4ivFunction(location: number, count: number, v: interop.Pointer | interop.Reference<number>): void;

declare function glUniform4ui(location: number, v0: number, v1: number, v2: number, v3: number): void;

declare function glUniform4uiv(location: number, count: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glUniformBlockBinding(program: number, uniformBlockIndex: number, uniformBlockBinding: number): void;

declare function glUniformMatrix2fv(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glUniformMatrix2fvFunction(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glUniformMatrix2x3fv(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glUniformMatrix2x4fv(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glUniformMatrix3fv(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glUniformMatrix3fvFunction(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glUniformMatrix3x2fv(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glUniformMatrix3x4fv(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glUniformMatrix4fv(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glUniformMatrix4fvFunction(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glUniformMatrix4x2fv(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glUniformMatrix4x3fv(location: number, count: number, transpose: number, value: interop.Pointer | interop.Reference<number>): void;

declare function glUnmapBuffer(target: number): number;

declare function glUnmapBufferOES(target: number): number;

declare function glUnmapBufferOESFunction(target: number): number;

declare function glUseProgram(program: number): void;

declare function glUseProgramFunction(program: number): void;

declare function glUseProgramStagesEXT(pipeline: number, stages: number, program: number): void;

declare function glUseProgramStagesEXTFunction(pipeline: number, stages: number, program: number): void;

declare function glValidateProgram(program: number): void;

declare function glValidateProgramFunction(program: number): void;

declare function glValidateProgramPipelineEXT(pipeline: number): void;

declare function glValidateProgramPipelineEXTFunction(pipeline: number): void;

declare function glVertexAttrib1f(indx: number, x: number): void;

declare function glVertexAttrib1fFunction(indx: number, x: number): void;

declare function glVertexAttrib1fv(indx: number, values: interop.Pointer | interop.Reference<number>): void;

declare function glVertexAttrib1fvFunction(indx: number, values: interop.Pointer | interop.Reference<number>): void;

declare function glVertexAttrib2f(indx: number, x: number, y: number): void;

declare function glVertexAttrib2fFunction(indx: number, x: number, y: number): void;

declare function glVertexAttrib2fv(indx: number, values: interop.Pointer | interop.Reference<number>): void;

declare function glVertexAttrib2fvFunction(indx: number, values: interop.Pointer | interop.Reference<number>): void;

declare function glVertexAttrib3f(indx: number, x: number, y: number, z: number): void;

declare function glVertexAttrib3fFunction(indx: number, x: number, y: number, z: number): void;

declare function glVertexAttrib3fv(indx: number, values: interop.Pointer | interop.Reference<number>): void;

declare function glVertexAttrib3fvFunction(indx: number, values: interop.Pointer | interop.Reference<number>): void;

declare function glVertexAttrib4f(indx: number, x: number, y: number, z: number, w: number): void;

declare function glVertexAttrib4fFunction(indx: number, x: number, y: number, z: number, w: number): void;

declare function glVertexAttrib4fv(indx: number, values: interop.Pointer | interop.Reference<number>): void;

declare function glVertexAttrib4fvFunction(indx: number, values: interop.Pointer | interop.Reference<number>): void;

declare function glVertexAttribDivisor(index: number, divisor: number): void;

declare function glVertexAttribDivisorEXT(index: number, divisor: number): void;

declare function glVertexAttribI4i(index: number, x: number, y: number, z: number, w: number): void;

declare function glVertexAttribI4iv(index: number, v: interop.Pointer | interop.Reference<number>): void;

declare function glVertexAttribI4ui(index: number, x: number, y: number, z: number, w: number): void;

declare function glVertexAttribI4uiv(index: number, v: interop.Pointer | interop.Reference<number>): void;

declare function glVertexAttribIPointer(index: number, size: number, type: number, stride: number, pointer: interop.Pointer | interop.Reference<any>): void;

declare function glVertexAttribPointer(indx: number, size: number, type: number, normalized: number, stride: number, ptr: interop.Pointer | interop.Reference<any>): void;

declare function glVertexAttribPointerFunction(indx: number, size: number, type: number, normalized: number, stride: number, ptr: interop.Pointer | interop.Reference<any>): void;

declare function glVertexPointer(size: number, type: number, stride: number, pointer: interop.Pointer | interop.Reference<any>): void;

declare function glViewport(x: number, y: number, width: number, height: number): void;

declare function glViewportFunction(x: number, y: number, width: number, height: number): void;

declare function glViewportFunction2(x: number, y: number, width: number, height: number): void;

declare function glWaitSync(sync: interop.Pointer | interop.Reference<any>, flags: number, timeout: number): void;

declare function glWaitSyncAPPLE(sync: interop.Pointer | interop.Reference<any>, flags: number, timeout: number): void;

declare function glWeightPointerOES(size: number, type: number, stride: number, pointer: interop.Pointer | interop.Reference<any>): void;

declare var kEAGLColorFormatRGB565: string;

declare var kEAGLColorFormatRGBA8: string;

declare var kEAGLColorFormatSRGBA8: string;

declare var kEAGLDrawablePropertyColorFormat: string;

declare var kEAGLDrawablePropertyRetainedBacking: string;
