package org.nativescript.kit.canvas

import android.os.Handler
import android.os.Looper
import java.nio.ByteBuffer
import org.nativescript.canvas.NSCCanvas
import org.nativescript.kit.*

/** libcanvaskit's WebGPU layer (jni/webgpu_kit.c), native pointers as Long; descriptors flattened as its comments say. */
object GPUNative {
    /** What an asynchronous request completes with, on the thread the native side completes it on. */
    fun interface Callback {
        fun done(error: String?, pointer: Long)
    }

    @JvmStatic external fun instanceCreate(): Long
    @JvmStatic external fun instancePointer(instance: Long): Long
    @JvmStatic external fun requestAdapter(instance: Long, power: Int, fallback: Boolean, callback: Callback)
    @JvmStatic external fun requestDevice(adapter: Long, label: String?, callback: Callback)
    @JvmStatic external fun deviceLogErrors(device: Long)
    @JvmStatic external fun deviceQueue(device: Long): Long

    @JvmStatic external fun createShaderModule(device: Long, label: String?, code: String): Long
    @JvmStatic external fun createBuffer(device: Long, label: String?, size: Long, usage: Int, mapped: Boolean): Long
    @JvmStatic external fun createBindGroupLayout(device: Long, label: String?, entries: IntArray, minSizes: LongArray): Long
    @JvmStatic external fun createPipelineLayout(device: Long, label: String?, layouts: LongArray): Long
    @JvmStatic external fun createBindGroup(device: Long, label: String?, layout: Long, entries: IntArray, resources: LongArray): Long
    @JvmStatic external fun createRenderPipeline(
        device: Long, label: String?, layout: Long, stages: LongArray, vertexEntry: String?, fragmentEntry: String?,
        formats: Array<String>, targets: IntArray, primitive: IntArray, sampleCount: Int, buffers: LongArray, attributes: LongArray,
    ): Long
    @JvmStatic external fun createCommandEncoder(device: Long, label: String?): Long
    @JvmStatic external fun bufferDestroy(buffer: Long)

    @JvmStatic external fun writeBufferDirect(queue: Long, buffer: Long, offset: Long, data: ByteBuffer, position: Int, length: Int, dataOffset: Long, size: Long)
    @JvmStatic external fun writeBufferArray(queue: Long, buffer: Long, offset: Long, data: ByteArray, position: Int, length: Int, dataOffset: Long, size: Long)
    @JvmStatic external fun submit(queue: Long, commandBuffers: LongArray)

    @JvmStatic external fun beginRenderPass(encoder: Long, label: String?, views: LongArray, clears: DoubleArray, ops: IntArray): Long
    @JvmStatic external fun finish(encoder: Long, label: String?): Long
    @JvmStatic external fun setPipeline(pass: Long, pipeline: Long)
    @JvmStatic external fun setBindGroup(pass: Long, index: Int, group: Long, offsets: IntArray)
    @JvmStatic external fun setVertexBuffer(pass: Long, slot: Int, buffer: Long, offset: Long, size: Long)
    @JvmStatic external fun setIndexBuffer(pass: Long, buffer: Long, format: Int, offset: Long, size: Long)
    @JvmStatic external fun setViewport(pass: Long, x: Float, y: Float, width: Float, height: Float, minDepth: Float, maxDepth: Float)
    @JvmStatic external fun setScissorRect(pass: Long, x: Int, y: Int, width: Int, height: Int)
    @JvmStatic external fun draw(pass: Long, vertexCount: Int, instanceCount: Int, firstVertex: Int, firstInstance: Int)
    @JvmStatic external fun drawIndexed(pass: Long, indexCount: Int, instanceCount: Int, firstIndex: Int, baseVertex: Int, firstInstance: Int)
    @JvmStatic external fun end(pass: Long)

    @JvmStatic external fun windowOf(surface: android.view.Surface): Long
    @JvmStatic external fun windowRelease(window: Long)
    @JvmStatic external fun contextCreate(instance: Long, window: Long, width: Int, height: Int): Long
    @JvmStatic external fun contextResize(context: Long, window: Long, width: Int, height: Int)
    @JvmStatic external fun configure(context: Long, device: Long, format: String, usage: Int, presentMode: Int, alphaMode: Int, width: Int, height: Int)
    @JvmStatic external fun unconfigure(context: Long)
    @JvmStatic external fun currentTexture(context: Long): Long
    @JvmStatic external fun present(context: Long)
    @JvmStatic external fun createView(texture: Long): Long
    @JvmStatic external fun textureWidth(texture: Long): Int
    @JvmStatic external fun textureHeight(texture: Long): Int
    @JvmStatic external fun textureRelease(texture: Long)
    @JvmStatic external fun viewRelease(view: Long)
}

// Reading script's descriptors

private fun member(o: Any?, key: String): Any? = if (jsIsNullish(o)) null else jsBox(jsGet(o, key)).takeUnless { it === JSNull }
private fun Any?.int(fallback: Int = 0): Int = if (this is Number) toDouble().toLong().toInt() else fallback
private fun Any?.long(fallback: Long = 0): Long = if (this is Number) toDouble().toLong() else fallback
private fun Any?.string(): String? = this as? String
private fun Any?.list(): List<Any?> = (this as? JSArray<*>)?.storage?.map { jsBox(it) } ?: emptyList()
private fun label(o: Any?): String? = member(o, "label").string()
private fun named(names: List<String>, value: Any?, fallback: Int): Int = names.indexOf(value.string()).takeIf { it >= 0 } ?: (value as? Number)?.toInt() ?: fallback
private fun Array<out Any?>.arg(i: Int): Any? = jsBox(getOrNull(i)).takeUnless { it === JSNull }
private fun settled(): Pair<JSPromise<Any?>, (Any?) -> Unit> {
    val (promise, resolvers) = JSPromise.pending<Any?>()
    val main = Handler(Looper.getMainLooper())
    return promise to { value -> main.post { resolvers.resolve(value) } }
}

private val BLEND_FACTORS = listOf(
    "zero", "one", "src", "one-minus-src", "src-alpha", "one-minus-src-alpha", "dst", "one-minus-dst", "dst-alpha", "one-minus-dst-alpha",
    "src-alpha-saturated", "constant", "one-minus-constant", "src1", "one-minus-src1", "src1-alpha", "one-minus-src1-alpha",
)
private val BLEND_OPERATIONS = listOf("add", "subtract", "reverse-subtract", "min", "max")
private val TOPOLOGIES = listOf("point-list", "line-list", "line-strip", "triangle-list", "triangle-strip")
private val INDEX_FORMATS = listOf("uint16", "uint32")
private val CULL_MODES = listOf("none", "front", "back")
private val BUFFER_BINDINGS = listOf("uniform", "storage", "read-only-storage")
private val SAMPLER_BINDINGS = listOf("filtering", "non-filtering", "comparison")
private val SAMPLE_TYPES = listOf("float", "unfilterable-float", "depth", "sint", "uint")
private val VIEW_DIMENSIONS = listOf("1d", "2d", "2d-array", "cube", "cube-array", "3d")
private val PRESENT_MODES = listOf("autoVsync", "autoNoVsync", "fifo", "fifoRelaxed", "immediate", "mailbox")
private val ALPHA_MODES = listOf("auto", "opaque", "premultiplied", "postmultiplied", "inherit")
private val VERTEX_FORMATS = listOf(
    "uint8", "uint8x2", "uint8x4", "sint8", "sint8x2", "sint8x4", "unorm8", "unorm8x2", "unorm8x4", "snorm8", "snorm8x2", "snorm8x4",
    "uint16", "uint16x2", "uint16x4", "sint16", "sint16x2", "sint16x4", "unorm16", "unorm16x2", "unorm16x4", "snorm16", "snorm16x2", "snorm16x4",
    "float16", "float16x2", "float16x4", "float32", "float32x2", "float32x3", "float32x4", "uint32", "uint32x2", "uint32x3", "uint32x4",
    "sint32", "sint32x2", "sint32x3", "sint32x4", "float64", "float64x2", "float64x3", "float64x4", "unorm10-10-10-2", "unorm8x4-bgra",
)

/** A WebGPU object script only passes back (a pipeline, a bind group): its pointer and its class's name. */
open class GPUHandleHost(val pointer: Long, private val className: String) : JSHostObject() {
    override val jsClassName: String get() = className
}

/** `GPU`, `navigator.gpu`: the WebGPU instance. */
class GPUHost : JSHostObject() {
    val instance: Long = GPUNative.instanceCreate()

    override val jsClassName: String get() = "GPU"
    override val methods: Set<String> get() = setOf("requestAdapter", "getPreferredCanvasFormat", "__getPointer")

    override fun invoke(key: String, args: Array<out Any?>): Any? = when (key) {
        "requestAdapter" -> {
            val options = args.arg(0)
            val power = when (member(options, "powerPreference")) { "low-power" -> 1; "high-performance" -> 2; else -> 0 }
            val (promise, resolve) = settled()
            GPUNative.requestAdapter(instance, power, jsTruthy(member(options, "forceFallbackAdapter"))) { _, adapter ->
                resolve(if (adapter == 0L) null else GPUAdapterHost(adapter))
            }
            promise
        }
        "getPreferredCanvasFormat" -> "rgba8unorm"
        "__getPointer" -> GPUNative.instancePointer(instance).toString()
        else -> ABSENT
    }
}

class GPUAdapterHost(val adapter: Long) : JSHostObject() {
    override val jsClassName: String get() = "GPUAdapter"
    override val methods: Set<String> get() = setOf("requestDevice")

    override fun get(key: String): Any? = when (key) {
        "isFallbackAdapter" -> false
        "features" -> JSSet<Any?>()
        else -> ABSENT
    }

    override fun invoke(key: String, args: Array<out Any?>): Any? = when (key) {
        "requestDevice" -> {
            val (promise, resolve) = settled()
            GPUNative.requestDevice(adapter, label(args.arg(0))) { error, device ->
                resolve(if (error != null || device == 0L) null else GPUDeviceHost(device, this))
            }
            promise
        }
        else -> ABSENT
    }
}

class GPUDeviceHost(val device: Long, val adapter: GPUAdapterHost) : JSHostObject() {
    private val queue by lazy { GPUQueueHost(GPUNative.deviceQueue(device)) }

    init {
        GPUNative.deviceLogErrors(device)
    }

    override val jsClassName: String get() = "GPUDevice"
    override val methods: Set<String> get() = METHODS

    override fun get(key: String): Any? = when (key) {
        "queue" -> queue
        "features" -> JSSet<Any?>()
        "lost" -> JSPromise.pending<Any?>().first
        else -> ABSENT
    }

    override fun invoke(key: String, args: Array<out Any?>): Any? {
        val d = args.arg(0)
        return when (key) {
            "createShaderModule" -> GPUHandleHost(GPUNative.createShaderModule(device, label(d), member(d, "code").string() ?: ""), "GPUShaderModule")
            "createBuffer" -> GPUBufferHost(
                GPUNative.createBuffer(device, label(d), member(d, "size").long(), member(d, "usage").int(), jsTruthy(member(d, "mappedAtCreation"))),
                member(d, "size").long(), member(d, "usage").int(),
            )
            "createBindGroupLayout" -> bindGroupLayout(d)
            "createPipelineLayout" -> GPUHandleHost(
                GPUNative.createPipelineLayout(device, label(d), member(d, "bindGroupLayouts").list().map { (it as GPUHandleHost).pointer }.toLongArray()),
                "GPUPipelineLayout",
            )
            "createBindGroup" -> bindGroup(d)
            "createRenderPipeline" -> renderPipeline(d)
            "createCommandEncoder" -> GPUCommandEncoderHost(GPUNative.createCommandEncoder(device, label(d)))
            "destroy", "pushErrorScope" -> null
            "popErrorScope" -> JSPromise.resolve<Any?>(null)
            else -> ABSENT
        }
    }

    private fun bindGroupLayout(d: Any?): Any {
        val entries = member(d, "entries").list()
        val fields = IntArray(entries.size * 6)
        val sizes = LongArray(entries.size)
        entries.forEachIndexed { i, e ->
            val f = i * 6
            fields[f] = member(e, "binding").int()
            fields[f + 1] = member(e, "visibility").int()
            val sampler = member(e, "sampler")
            val texture = member(e, "texture")
            when {
                sampler != null -> { fields[f + 2] = 1; fields[f + 3] = named(SAMPLER_BINDINGS, member(sampler, "type"), 0) }
                texture != null -> {
                    fields[f + 2] = 2
                    fields[f + 3] = named(SAMPLE_TYPES, member(texture, "sampleType"), 0)
                    fields[f + 4] = named(VIEW_DIMENSIONS, member(texture, "viewDimension"), 1)
                    fields[f + 5] = if (jsTruthy(member(texture, "multisampled"))) 1 else 0
                }
                else -> {
                    val buffer = member(e, "buffer")
                    fields[f + 3] = named(BUFFER_BINDINGS, member(buffer, "type"), 0)
                    fields[f + 4] = if (jsTruthy(member(buffer, "hasDynamicOffset"))) 1 else 0
                    sizes[i] = member(buffer, "minBindingSize").long()
                }
            }
        }
        return GPUHandleHost(GPUNative.createBindGroupLayout(device, label(d), fields, sizes), "GPUBindGroupLayout")
    }

    private fun bindGroup(d: Any?): Any {
        val entries = member(d, "entries").list()
        val kinds = IntArray(entries.size * 2)
        val resources = LongArray(entries.size * 3)
        entries.forEachIndexed { i, e ->
            kinds[i * 2] = member(e, "binding").int()
            when (val resource = member(e, "resource")) {
                is GPUTextureViewHost -> { kinds[i * 2 + 1] = 2; resources[i * 3] = resource.view }
                is GPUHandleHost -> { kinds[i * 2 + 1] = 1; resources[i * 3] = resource.pointer }
                else -> {
                    val buffer = member(resource, "buffer") as GPUBufferHost
                    resources[i * 3] = buffer.buffer
                    resources[i * 3 + 1] = member(resource, "offset").long()
                    resources[i * 3 + 2] = member(resource, "size").long(-1)
                }
            }
        }
        val layout = member(d, "layout") as GPUHandleHost
        return GPUHandleHost(GPUNative.createBindGroup(device, label(d), layout.pointer, kinds, resources), "GPUBindGroup")
    }

    private fun renderPipeline(d: Any?): Any {
        val vertex = member(d, "vertex")
        val fragment = member(d, "fragment")
        val layout = (member(d, "layout") as? GPUHandleHost)?.pointer ?: 0L
        val stages = longArrayOf((member(vertex, "module") as GPUHandleHost).pointer, (member(fragment, "module") as? GPUHandleHost)?.pointer ?: 0L)

        val targets = member(fragment, "targets").list()
        val formats = targets.map { member(it, "format").string() ?: "rgba8unorm" }.toTypedArray()
        val fields = IntArray(targets.size * 8)
        targets.forEachIndexed { i, t ->
            val f = i * 8
            val blend = member(t, "blend")
            if (blend != null) {
                val color = member(blend, "color")
                val alpha = member(blend, "alpha")
                fields[f] = 1
                fields[f + 1] = named(BLEND_FACTORS, member(color, "srcFactor"), 1)
                fields[f + 2] = named(BLEND_FACTORS, member(color, "dstFactor"), 0)
                fields[f + 3] = named(BLEND_OPERATIONS, member(color, "operation"), 0)
                fields[f + 4] = named(BLEND_FACTORS, member(alpha, "srcFactor"), 1)
                fields[f + 5] = named(BLEND_FACTORS, member(alpha, "dstFactor"), 0)
                fields[f + 6] = named(BLEND_OPERATIONS, member(alpha, "operation"), 0)
            }
            fields[f + 7] = member(t, "writeMask").int(0xF)
        }

        val primitive = member(d, "primitive")
        val prim = intArrayOf(
            named(TOPOLOGIES, member(primitive, "topology"), 3),
            member(primitive, "stripIndexFormat")?.let { named(INDEX_FORMATS, it, -1) } ?: -1,
            if (member(primitive, "frontFace") == "cw") 1 else 0,
            named(CULL_MODES, member(primitive, "cullMode"), 0),
        )

        val layouts = member(vertex, "buffers").list()
        val buffers = LongArray(layouts.size * 2)
        val attributes = ArrayList<Long>()
        layouts.forEachIndexed { i, b ->
            val attrs = member(b, "attributes").list()
            buffers[i * 2] = member(b, "arrayStride").long()
            buffers[i * 2 + 1] = ((if (member(b, "stepMode") == "instance") 1L else 0L) shl 32) or attrs.size.toLong()
            for (a in attrs) {
                attributes += named(VERTEX_FORMATS, member(a, "format"), 27).toLong()
                attributes += member(a, "offset").long()
                attributes += member(a, "shaderLocation").long()
            }
        }

        val pipeline = GPUNative.createRenderPipeline(
            device, label(d), layout, stages, member(vertex, "entryPoint").string(), member(fragment, "entryPoint").string(),
            formats, fields, prim, member(member(d, "multisample"), "count").int(1), buffers, attributes.toLongArray(),
        )
        return GPUHandleHost(pipeline, "GPURenderPipeline")
    }

    private companion object {
        val METHODS = setOf(
            "createShaderModule", "createBuffer", "createBindGroupLayout", "createPipelineLayout", "createBindGroup", "createRenderPipeline",
            "createCommandEncoder", "destroy", "pushErrorScope", "popErrorScope",
        )
    }
}

class GPUBufferHost(val buffer: Long, private val size: Long, private val usage: Int) : JSHostObject() {
    override val jsClassName: String get() = "GPUBuffer"
    override val methods: Set<String> get() = setOf("destroy")

    override fun get(key: String): Any? = when (key) {
        "size" -> size.toDouble()
        "usage" -> usage.toDouble()
        else -> ABSENT
    }

    override fun invoke(key: String, args: Array<out Any?>): Any? = when (key) {
        "destroy" -> { GPUNative.bufferDestroy(buffer); null }
        else -> ABSENT
    }
}

class GPUQueueHost(val queue: Long) : JSHostObject() {
    override val jsClassName: String get() = "GPUQueue"
    override val methods: Set<String> get() = setOf("writeBuffer", "submit", "onSubmittedWorkDone")

    override fun invoke(key: String, args: Array<out Any?>): Any? = when (key) {
        "writeBuffer" -> { writeBuffer(args); null }
        "submit" -> {
            val buffers = args.arg(0).list().mapNotNull { (it as? GPUCommandBufferHost)?.take() }
            GPUNative.submit(queue, buffers.toLongArray())
            null
        }
        "onSubmittedWorkDone" -> JSPromise.resolve<Any?>(null)
        else -> ABSENT
    }

    /** `writeBuffer(buffer, bufferOffset, data, dataOffset?, size?)`; offsets and size in bytes. */
    private fun writeBuffer(args: Array<out Any?>) {
        val buffer = args.arg(0) as? GPUBufferHost ?: return
        val bytes = (args.arg(2) as? JSBufferSource)?.jsBytes ?: return
        val offset = args.arg(1).long()
        val dataOffset = args.arg(3).long()
        val size = (args.arg(4) as? Number)?.toLong() ?: -1L
        if (bytes.isDirect) GPUNative.writeBufferDirect(queue, buffer.buffer, offset, bytes, bytes.position(), bytes.remaining(), dataOffset, size)
        else GPUNative.writeBufferArray(queue, buffer.buffer, offset, bytes.array(), bytes.arrayOffset() + bytes.position(), bytes.remaining(), dataOffset, size)
    }
}

/** A command buffer, given up to the queue that submits it. */
class GPUCommandBufferHost(private var buffer: Long) : JSHostObject() {
    override val jsClassName: String get() = "GPUCommandBuffer"
    fun take(): Long? = buffer.takeIf { it != 0L }?.also { buffer = 0L }
}

class GPUCommandEncoderHost(private val encoder: Long) : JSHostObject() {
    override val jsClassName: String get() = "GPUCommandEncoder"
    override val methods: Set<String> get() = setOf("beginRenderPass", "finish")

    override fun invoke(key: String, args: Array<out Any?>): Any? = when (key) {
        "beginRenderPass" -> beginRenderPass(args.arg(0))
        "finish" -> GPUCommandBufferHost(GPUNative.finish(encoder, label(args.arg(0))))
        else -> ABSENT
    }

    private fun beginRenderPass(d: Any?): Any {
        val attachments = member(d, "colorAttachments").list()
        val views = LongArray(attachments.size * 2)
        val clears = DoubleArray(attachments.size * 4)
        val ops = IntArray(attachments.size * 3)
        attachments.forEachIndexed { i, a ->
            views[i * 2] = (member(a, "view") as GPUTextureViewHost).view
            views[i * 2 + 1] = (member(a, "resolveTarget") as? GPUTextureViewHost)?.view ?: 0L
            val clear = member(a, "clearValue")
            if (clear != null) {
                ops[i * 3] = 1
                val channels = if (clear is JSArray<*>) clear.list() else listOf(member(clear, "r"), member(clear, "g"), member(clear, "b"), member(clear, "a"))
                for (c in 0 until 4) clears[i * 4 + c] = (channels.getOrNull(c) as? Number)?.toDouble() ?: 0.0
            }
            ops[i * 3 + 1] = if (member(a, "loadOp") == "load") 1 else 0
            ops[i * 3 + 2] = if (member(a, "storeOp") == "discard") 0 else 1
        }
        return GPURenderPassEncoderHost(GPUNative.beginRenderPass(encoder, label(d), views, clears, ops))
    }
}

class GPURenderPassEncoderHost(private val pass: Long) : JSHostObject() {
    override val jsClassName: String get() = "GPURenderPassEncoder"
    override val methods: Set<String> get() = METHODS

    override fun invoke(key: String, args: Array<out Any?>): Any? {
        fun i(k: Int, fallback: Int = 0) = args.arg(k).int(fallback)
        fun f(k: Int, fallback: Float = 0f) = (args.arg(k) as? Number)?.toFloat() ?: fallback
        when (key) {
            "setPipeline" -> GPUNative.setPipeline(pass, (args.arg(0) as GPUHandleHost).pointer)
            "setBindGroup" -> GPUNative.setBindGroup(pass, i(0), (args.arg(1) as? GPUHandleHost)?.pointer ?: 0L, args.arg(2).list().map { it.int() }.toIntArray())
            "setVertexBuffer" -> GPUNative.setVertexBuffer(pass, i(0), (args.arg(1) as GPUBufferHost).buffer, args.arg(2).long(), args.arg(3).long(-1))
            "setIndexBuffer" -> GPUNative.setIndexBuffer(pass, (args.arg(0) as GPUBufferHost).buffer, named(INDEX_FORMATS, args.arg(1), 0), args.arg(2).long(), args.arg(3).long(-1))
            "setViewport" -> GPUNative.setViewport(pass, f(0), f(1), f(2), f(3), f(4), f(5, 1f))
            "setScissorRect" -> GPUNative.setScissorRect(pass, i(0), i(1), i(2), i(3))
            "draw" -> GPUNative.draw(pass, i(0), i(1, 1), i(2), i(3))
            "drawIndexed" -> GPUNative.drawIndexed(pass, i(0), i(1, 1), i(2), i(3), i(4))
            "end" -> GPUNative.end(pass)
            else -> return ABSENT
        }
        return null
    }

    private companion object {
        val METHODS = setOf("setPipeline", "setBindGroup", "setVertexBuffer", "setIndexBuffer", "setViewport", "setScissorRect", "draw", "drawIndexed", "end")
    }
}

/** A surface texture of one frame; it and its views are let go when the frame is presented. */
class GPUTextureHost(val texture: Long) : JSHostObject() {
    val views = ArrayList<Long>()

    override val jsClassName: String get() = "GPUTexture"
    override val methods: Set<String> get() = setOf("createView", "destroy")

    override fun get(key: String): Any? = when (key) {
        "width" -> GPUNative.textureWidth(texture).toDouble()
        "height" -> GPUNative.textureHeight(texture).toDouble()
        else -> ABSENT
    }

    override fun invoke(key: String, args: Array<out Any?>): Any? = when (key) {
        "createView" -> GPUTextureViewHost(GPUNative.createView(texture).also { views += it })
        "destroy" -> null
        else -> ABSENT
    }

    fun release() {
        views.forEach(GPUNative::viewRelease)
        views.clear()
        GPUNative.textureRelease(texture)
    }
}

class GPUTextureViewHost(val view: Long) : JSHostObject() {
    override val jsClassName: String get() = "GPUTextureView"
}

/**
 * `GPUCanvasContext` over the canvas view's window. The binding makes the context itself rather than through
 * NSCCanvas.initWebGPUContext, after which the view resizes it on every layout by making another Vulkan surface for
 * the window its first surface holds (ERROR_NATIVE_WINDOW_IN_USE_KHR). Here a size change is the app's
 * `configure({ size })`, and only a new window, the SurfaceView's surface made again, gets a surface of its own.
 */
class GPUCanvasContextHost private constructor(private val context: Long, private var window: Long) : JSHostObject() {
    private var frame: GPUTextureHost? = null

    override val jsClassName: String get() = "GPUCanvasContext"
    override val methods: Set<String> get() = setOf("configure", "unconfigure", "getCurrentTexture", "presentSurface", "getCapabilities", "__attach")

    companion object {
        fun create(canvas: NSCCanvas, instance: Long): GPUCanvasContextHost? {
            val surface = canvas.surface ?: return null
            if (canvas.surfaceWidth <= 0 || canvas.surfaceHeight <= 0) return null
            val window = GPUNative.windowOf(surface).takeIf { it != 0L } ?: return null
            val context = GPUNative.contextCreate(instance, window, canvas.surfaceWidth, canvas.surfaceHeight)
            if (context == 0L) {
                GPUNative.windowRelease(window)
                return null
            }
            return GPUCanvasContextHost(context, window)
        }
    }

    /** The view's surface was created or resized: a new window gets a surface; the one the context draws to is left as configured. */
    private fun attach(canvas: NSCCanvas) {
        val surface = canvas.surface ?: return
        val next = GPUNative.windowOf(surface).takeIf { it != 0L } ?: return
        if (next == window) {
            GPUNative.windowRelease(next)
            return
        }
        frame?.release()
        frame = null
        GPUNative.contextResize(context, next, canvas.surfaceWidth, canvas.surfaceHeight)
        GPUNative.windowRelease(window)
        window = next
    }

    override fun invoke(key: String, args: Array<out Any?>): Any? = when (key) {
        "__attach" -> { attach(jsBox(args.getOrNull(0)) as NSCCanvas); null }
        "configure" -> { configure(args.arg(0)); null }
        "unconfigure" -> { GPUNative.unconfigure(context); null }
        "getCurrentTexture" -> GPUNative.currentTexture(context).takeIf { it != 0L }?.let { GPUTextureHost(it).also { t -> frame = t } }
        "presentSurface" -> {
            GPUNative.present(context)
            frame?.release()
            frame = null
            null
        }
        "getCapabilities" -> JSObject("format" to jsArrayOf<Any?>("rgba8unorm"), "presentModes" to jsArrayOf<Any?>("fifo"), "alphaModes" to jsArrayOf<Any?>("opaque"), "usages" to 31.0)
        else -> ABSENT
    }

    /** `configure({ device, format, usage?, presentMode?, alphaMode?, size? })`; the surface's textures can always be copied. */
    private fun configure(options: Any?) {
        val device = member(options, "device") as? GPUDeviceHost ?: return
        val usage = member(options, "usage").int(0x10) or 0x1 or 0x2
        val size = member(options, "size")
        val (width, height) = if (size is JSArray<*>) size.list().let { it.getOrNull(0).int() to it.getOrNull(1).int() } else member(size, "width").int() to member(size, "height").int()
        GPUNative.configure(
            context, device.device, member(options, "format").string() ?: "rgba8unorm", usage,
            named(PRESENT_MODES, member(options, "presentMode"), 2), named(ALPHA_MODES, member(options, "alphaMode"), 1), width, height,
        )
    }
}
