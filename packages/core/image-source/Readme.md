Contains the ImageSource class, which encapsulates the common abstraction behind a platform specific object (typically a Bitmap) that is used as a source for images.

## API reference

All sizes are pixels. Every method that returns an `ImageSource` returns a NEW instance and never mutates its input. EXIF orientation is baked into pixels before any geometry work, so callers never reason about orientation flags after loading. Every method has an automated test in `apps/automated/src/image-source` that runs the same assertion on iOS and Android.

### Loading (static)

| Method | iOS implementation | Android implementation | What it does | Example use |
| --- | --- | --- | --- | --- |
| `fromFileSync(path, { maxSize? })` / `fromFile(path, { maxSize? })` | Without `maxSize`: `UIImage.imageWithContentsOfFile` / TNSWidgets background decode. With `maxSize`: `CGImageSourceCreateThumbnailAtIndex` with `kCGImageSourceThumbnailMaxPixelSize` + `CreateThumbnailWithTransform` | `ImageUtils.decodeFile`: `BitmapFactory` bounds pass + `inSampleSize`, then androidx `ExifInterface` orientation baked in (was: full decode + framework `ExifInterface`, rotation left pending) | Loads an image from disk. With `maxSize` it shrinks while decoding so the result is never bigger than that many pixels on its long edge. The async form rejects instead of hanging when the file cannot be decoded. Returns a new `ImageSource`. | Load each photo in a list at 200 px to fill a thumbnail grid |
| `fromDataSync(data, { maxSize? })` / `fromData(data, { maxSize? })` | `NSData` from `ArrayBuffer`/typed array, then `UIImage.imageWithData` or ImageIO thumbnail | `ImageUtils.decodeBuffer` from `java.nio.ByteBuffer` with EXIF orientation read from the bytes and baked in, or legacy `BitmapFactory.decodeStream` for an `InputStream` | Turns raw image bytes into an image. Accepts an `ArrayBuffer` or typed array on both platforms as well as the legacy native types. Returns a new `ImageSource`. | Show an image received from a fetch response or a plugin |
| `fromBase64Sync(source, { maxSize? })` / `fromBase64(source, { maxSize? })` | Base64 → `NSData` → same path as `fromData` | `ImageUtils.decodeBase64` on a worker thread (was: synchronous inside the Promise) | Decodes a base64 string into an image. Rejects on invalid input. Returns a new `ImageSource`. | Display an inline image from an API payload |
| `fromResourceSync(name)` / `fromResource(name)` | `UIImage.imageNamed` via TNSWidgets | `Resources.getDrawable` | Loads a bundled app resource by name. The async form now rejects when the resource is missing. | Load an icon from App_Resources |
| `fromFileOrResourceSync(path)` | Routes to file, `res://` or `sys://` loaders | Routes to file or `res://` loaders | Loads from whichever source the prefix names. | Resolve a `src` string the way `<Image>` does |
| `fromSystemImageSync(name)` / `fromSystemImage(name)` | `UIImage.systemImageNamed` (SF Symbols) | Falls back to `fromResource` | Loads a platform system icon. | Show an SF Symbol on iOS |
| `fromUrl(url)` | `http` module then `UIImage.imageWithData` | `http` module then `BitmapFactory` | Downloads and decodes a remote image. | Fetch a profile picture |
| `fromAsset(asset)` | `PHImageManager` request via `ImageAsset` | `Utils.loadImageAsync` via `ImageAsset` | Decodes a picker `ImageAsset` at the asset's requested size. | Load a photo the user picked |
| `fromFontIconCodeSync(code, font, color)` | `NSAttributedString` drawn through `UIGraphicsImageRenderer` (was: deprecated `UIGraphicsBeginImageContext`) | `Canvas.drawText` | Renders a font glyph into an image. | Use an icon font glyph as a tab icon |
| `getMetadataSync(path)` / `getMetadata(path)` | `CGImageSourceCopyPropertiesAtIndex` | androidx `ExifInterface` + `BitmapFactory` bounds pass | Reads the information stored inside an image file, such as its pixel size, which way the camera was held, when it was taken and where, without decoding the picture itself. Returns `{ width, height, orientation, mimeType, hasAlpha, colorSpace, dpi, dateTaken, gps }`. | Sort photos by date taken, or skip ones smaller than 1000 px |
| `fromView(view, scale?)` | `UIGraphicsImageRenderer` + `drawViewHierarchyInRect` | `Utils.getBitmapFromView` (`View.draw(Canvas)`) | Takes a picture of any NativeScript view exactly as it is drawn on screen. Returns a new `ImageSource`. | Share a screenshot of a trip summary card |

### Properties

| Property | iOS | Android | What it is |
| --- | --- | --- | --- |
| `width` / `height` | `UIImage.size` (points) | `Bitmap.getWidth/getHeight` (pixels) | Legacy size. Use `getPixelSize()` when you need pixels on both platforms. |
| `rotationAngle` | Always `NaN` | Pending rotation for bitmaps loaded before orientation was baked in | Kept for compatibility. New loaders bake orientation in, so this is 0. |
| `ios` / `android` | `UIImage` | `android.graphics.Bitmap` | The native image. |

### Saving and encoding

| Method | iOS implementation | Android implementation | What it does | Example use |
| --- | --- | --- | --- | --- |
| `saveToFile(path, format, quality?)` / `saveToFileAsync` | `NSData.writeToFile(atomically:)` (was: non-atomic `createFileAtPath`) | `ImageUtils.saveToFile`: temp file + rename (was: direct stream) | Writes the image to disk safely, so the file is either complete or not there. Default quality is now 100 on both platforms (was 90 on iOS). Encoding from pixels never carries EXIF, so no camera or GPS metadata is written. Returns `true` on success. | Persist a picked photo to the app's documents folder |
| `toBase64String(format, quality?)` / `toBase64StringAsync` | `NSData.base64EncodedStringWithOptions` | `Base64.encodeToString` (async: closes the Base64 stream before reading, fixing truncated output) | Encodes the image and returns it as a base64 string. | Embed an image in a JSON payload |
| `toData(format, quality?)` / `toDataAsync` | `UIImageJPEGRepresentation` / `UIImagePNGRepresentation` → `NSData` exposed as `ArrayBuffer` | `Bitmap.compress` → direct `ByteBuffer` exposed as `ArrayBuffer` | Encodes the image as JPEG or PNG and hands you the bytes in memory instead of writing a file. Returns an `ArrayBuffer`. | Put the bytes straight into an HTTP upload body |
| `compressToFit(maxBytes, format?)` / `compressToFitAsync` | Binary search over JPEG quality in `NativeScriptUtils` | Binary search over JPEG quality in `ImageUtils` | Keeps re-encoding the image at lower quality until it fits under a byte limit you give it. Returns `{ data, quality }`, or null when even the lowest quality is over budget (resize first). | Shrink a photo under 500 KB before uploading to an API with a size limit |

### Geometry

| Method | iOS implementation | Android implementation | What it does | Example use |
| --- | --- | --- | --- | --- |
| `getPixelSize()` | `UIImage.size * scale` | `Bitmap.getWidth/getHeight` (swapped when a rotation is pending) | Tells you the true size of the image in pixels, on both platforms. Returns `{ width, height }`. | Warn the user that a chosen cover image is too small |
| `resize(maxSize, options?)` / `resizeAsync` | `UIGraphicsImageRenderer`, scale 1, `preferredRange = .standard` (was: deprecated `UIGraphicsBeginImageContext` at the image's scale, which returned nil for wide-gamut photos and gave 2x/3x pixels) | `Canvas.drawBitmap` with `Paint(FILTER_BITMAP)`; filter now defaults to true (was: unfiltered `createScaledBitmap`, pending rotation dropped) | Scales the image so its longest edge is at most `maxSize` pixels, keeping the aspect ratio. Never upscales. Returns a new `ImageSource`. | Make a 1080 px copy for storage |
| `resizeTo(width, height, { mode?, background? })` | Renderer with fit/fill/stretch rect maths | `Canvas.drawBitmap` with fit/fill/stretch rect maths | Makes an exact width and height: `fit` letterboxes (padding with `background`, transparent by default), `fill` covers and centre-crops, `stretch` ignores aspect. Returns a new `ImageSource`. | A 400×300 card cover with `fill` |
| `normalizeOrientation()` | Redraw through the renderer when `imageOrientation != Up` | `Bitmap.createBitmap` with rotation `Matrix` from `rotationAngle` | Rotates the pixels so the picture is upright according to its EXIF orientation, then clears the flag. Returns a new `ImageSource`. | Run before `crop` or `saveToFile` so portrait shots don't come out sideways |
| `crop(x, y, width, height)` | Renderer draw with negative offset | `Bitmap.createBitmap(src, x, y, w, h)` | Keeps only the rectangle you specify. Throws when the rectangle is outside the image. Returns a new `ImageSource`. | Cut the user's selection out of a photo |
| `rotate(degrees)` | Renderer with `CGContextRotateCTM` | `Bitmap.createBitmap` with `Matrix.setRotate` | Turns the image clockwise by the given degrees. Returns a new `ImageSource`. | Rotate-left button in an editor |
| `flip(axis)` | Renderer with `CGContextScaleCTM(-1, 1)` | `Bitmap.createBitmap` with `Matrix.setScale(-1, 1)` | Mirrors the image left-right, top-bottom, or both. Returns a new `ImageSource`. | Un-mirror a selfie |
| `transform({ crop, rotate, flip, resize })` / `transformAsync` | One native pass, fixed order normalize → crop → rotate → flip → resize | Same order in `ImageUtils.transform` | Runs several edits in one native call, in a fixed order, without handing intermediate results back to JavaScript. Returns one new `ImageSource`. | Apply the user's crop, rotation and output size in one pass when they tap Done |

### Compositing

| Method | iOS implementation | Android implementation | What it does | Example use |
| --- | --- | --- | --- | --- |
| `roundCorners(radius)` / `circleCrop()` | `UIBezierPath` clip inside the renderer | `Canvas.drawRoundRect` / `drawCircle` with a `BitmapShader` | Makes the corners transparent with the radius you give, or masks the whole image to a circle. Returns a new `ImageSource` with alpha. | Render a round avatar |
| `overlay(other, { x?, y?, opacity? })` | `drawInRect:blendMode:alpha:` inside the renderer | `Canvas.drawBitmap` with `Paint.setAlpha` | Draws another image on top of this one at a position and opacity you choose. Returns a new combined `ImageSource`. | Stamp a logo or watermark on a photo before sharing |
| `drawText(text, { x, y, font?, fontSize?, color? })` | `NSString.drawAtPoint:withAttributes:` inside the renderer | `Canvas.drawText` with a `Paint` from `Font.getAndroidTypeface()` | Draws a string onto the image with its top-left corner at (x, y). Returns a new `ImageSource` with the text baked in. | Burn a date or trip name into a photo |
| `tint(color)` | `UIRectFillUsingBlendMode(SourceIn)` | `PorterDuffColorFilter(SRC_IN)` | Recolours every visible pixel to one colour while keeping transparency, the way template icons work. Returns a new `ImageSource`. | Recolour a monochrome icon to the current theme |

### Filters and analysis

| Method | iOS implementation | Android implementation | What it does | Example use |
| --- | --- | --- | --- | --- |
| `applyFilters([...])` / `applyFiltersAsync` — grayscale, sepia, invert, brightness, contrast, saturation | `CIColorControls`, `CISepiaTone`, `CIColorInvert` rendered via `CIContext` to `CGImage` | One `ColorMatrixColorFilter` built from the filter list | Applies colour adjustments in the order given: black-and-white, sepia (amount 0..1), invert, brightness (-1..1), contrast (0..2, 1 = unchanged), saturation (0..2, 1 = unchanged). Returns a new `ImageSource`. | Offer black-and-white, sepia, or brightness sliders in an editor |
| `applyFilters([{ type: 'blur', radius }])` | `CIGaussianBlur` with edge clamping | `ImageUtils.stackBlur` (CPU stack blur, a close gaussian approximation that gives identical output on every API level) | Softens the whole image with a blur of the radius you give. Returns a new `ImageSource`. | Soft blurred background behind a card, or hide a licence plate |
| `averageColor()` | 32 px downscale, pixels sampled in ObjC | 32 px downscale, pixels sampled in Java | Works out the single average colour of the image, ignoring transparent pixels. Returns a `Color`, or null when nothing is visible. | Pick a background colour that matches the photo |
| `dominantColors(count?)` | Same sample, 4-bit-per-channel buckets | Same sample, 4-bit-per-channel buckets | Finds the handful of colours that appear most, most common first. Returns `Color[]`. | Build a palette from a photo |
| `perceptualHash()` | 9×8 grayscale difference hash in ObjC | Same algorithm in Java | Computes a short fingerprint of what the picture looks like, so resized copies score nearly the same. Returns a 16-character hex string. | Store a fingerprint alongside each saved photo |
| `isSimilarTo(other, threshold?)` | Hamming distance of the two hashes | Same | True when the two images' fingerprints differ in at most `threshold` bits (default 10). | Skip a photo the user already added, even if it was resized |

### Deprecated instance loaders

`loadFromFile`, `loadFromResource`, `loadFromData`, `loadFromBase64`, `loadFromFontIconCode` and the instance forms of `fromFile`, `fromResource`, `fromData`, `fromBase64`, `fromAsset` remain for compatibility and forward to the static loaders above.

### Explicitly out of scope for core

Face / text detection, QR encode / decode (Android needs ML Kit or ZXing), and HEIC / AVIF output (Android has no `CompressFormat` for them; `androidx.heifwriter` is an extra dependency) belong in plugins.
