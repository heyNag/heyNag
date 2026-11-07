import Foundation
import CoreGraphics
import CoreText
import ImageIO
import UniformTypeIdentifiers

// Rebuild the retained V2 header study from the repository root on macOS:
// swift brand/source/build.swift brand/fonts/SchibstedGrotesk-Regular.ttf assets/brand/heynag-moth-v2.png assets/brand
//
// The source font is outlined into dependency-free SVG lettering. Headers embed the supplied
// mascot's original PNG bytes; PNG exports compose the same paths and an unedited, scaled image.
// Font license: ../fonts/OFL.txt. The generator neither installs fonts nor modifies its inputs.

enum BuildError: Error, CustomStringConvertible {
    case message(String)
    var description: String { switch self { case let .message(message): return message } }
}

func number(_ value: CGFloat) -> String {
    String(format: "%.3f", locale: Locale(identifier: "en_US_POSIX"), Double(value))
        .replacingOccurrences(of: #"\.?0+$"#, with: "", options: .regularExpression)
}

func svgPath(_ path: CGPath) -> String {
    var commands: [String] = []
    func pair(_ p: CGPoint) -> String { "\(number(p.x)) \(number(p.y))" }
    path.applyWithBlock { pointer in
        let element = pointer.pointee
        switch element.type {
        case .moveToPoint: commands.append("M\(pair(element.points[0]))")
        case .addLineToPoint: commands.append("L\(pair(element.points[0]))")
        case .addQuadCurveToPoint: commands.append("Q\(pair(element.points[0])) \(pair(element.points[1]))")
        case .addCurveToPoint: commands.append("C\(pair(element.points[0])) \(pair(element.points[1])) \(pair(element.points[2]))")
        case .closeSubpath: commands.append("Z")
        @unknown default: fatalError("Unsupported path element")
        }
    }
    return commands.joined(separator: " ")
}

func outline(_ text: String, font: CTFont, tracking: CGFloat) throws -> CGPath {
    let attributes: [NSAttributedString.Key: Any] = [
        .init(kCTFontAttributeName as String): font,
        .init(kCTKernAttributeName as String): tracking
    ]
    let line = CTLineCreateWithAttributedString(NSAttributedString(string: text, attributes: attributes))
    let path = CGMutablePath()
    for run in CTLineGetGlyphRuns(line) as! [CTRun] {
        let count = CTRunGetGlyphCount(run)
        var glyphs = [CGGlyph](repeating: 0, count: count)
        var positions = [CGPoint](repeating: .zero, count: count)
        CTRunGetGlyphs(run, CFRange(location: 0, length: 0), &glyphs)
        CTRunGetPositions(run, CFRange(location: 0, length: 0), &positions)
        let runAttributes = CTRunGetAttributes(run) as NSDictionary
        let runFont = runAttributes[kCTFontAttributeName] as! CTFont
        for i in 0..<count {
            guard let glyph = CTFontCreatePathForGlyph(runFont, glyphs[i], nil) else { continue }
            path.addPath(glyph, transform: CGAffineTransform(a: 1, b: 0, c: 0, d: -1,
                tx: positions[i].x, ty: -positions[i].y))
        }
    }
    guard !path.isEmpty else { throw BuildError.message("No glyph outlines were produced.") }
    return path
}

func translated(_ path: CGPath, x: CGFloat, y: CGFloat) -> CGPath {
    var transform = CGAffineTransform(translationX: x, y: y)
    return path.copy(using: &transform)!
}

func color(_ hex: String) -> CGColor {
    let value = UInt32(hex.replacingOccurrences(of: "#", with: ""), radix: 16)!
    let components: [CGFloat] = [CGFloat((value >> 16) & 255) / 255, CGFloat((value >> 8) & 255) / 255, CGFloat(value & 255) / 255, 1]
    return CGColor(colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!, components: components)!
}

struct Shape { let path: CGPath; let fill: String }
struct Raster { let image: CGImage; let data: Data; let rect: CGRect }

func writePNG(_ image: CGImage, to url: URL) throws {
    guard let destination = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil) else {
        throw BuildError.message("Could not prepare PNG export at \(url.lastPathComponent).")
    }
    CGImageDestinationAddImage(destination, image, nil)
    guard CGImageDestinationFinalize(destination) else { throw BuildError.message("PNG export failed.") }
}

func writeAsset(name: String, width: CGFloat, height: CGFloat, background: String?, shapes: [Shape], raster: Raster? = nil,
                title: String, description: String, exportHeaderPNG: Bool = false, output: URL) throws {
    let backgroundMarkup = background.map { "  <rect width=\"\(number(width))\" height=\"\(number(height))\" fill=\"\($0)\"/>\n" } ?? ""
    let paths = shapes.map { "  <path fill=\"\($0.fill)\" d=\"\(svgPath($0.path))\"/>" }.joined(separator: "\n")
    let imageMarkup = raster.map {
        "\n  <image x=\"\(number($0.rect.minX))\" y=\"\(number($0.rect.minY))\" width=\"\(number($0.rect.width))\" height=\"\(number($0.rect.height))\" href=\"data:image/png;base64,\($0.data.base64EncodedString())\"/>"
    } ?? ""
    let svg = """
    <svg xmlns="http://www.w3.org/2000/svg" width="\(number(width))" height="\(number(height))" viewBox="0 0 \(number(width)) \(number(height))" role="img" aria-labelledby="title description">
      <title id="title">\(title)</title>
      <desc id="description">\(description)</desc>
    \(backgroundMarkup)\(paths)\(imageMarkup)
    </svg>

    """
    try svg.write(to: output.appendingPathComponent(name + ".svg"), atomically: true, encoding: .utf8)

    guard let context = CGContext(data: nil, width: Int(ceil(width)), height: Int(ceil(height)), bitsPerComponent: 8, bytesPerRow: 0,
        space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
        throw BuildError.message("Could not create PNG graphics context.")
    }
    // Vector paths use SVG's top-left origin, with y increasing down the canvas.
    context.translateBy(x: 0, y: height)
    context.scaleBy(x: 1, y: -1)
    if let background {
        context.setFillColor(color(background))
        context.fill(CGRect(x: 0, y: 0, width: width, height: height))
    }
    for shape in shapes {
        context.setFillColor(color(shape.fill))
        context.addPath(shape.path)
        context.fillPath()
    }
    if let raster {
        // CGImage drawing is y-up. Flip only the image's local coordinate system so its
        // pixels remain upright inside our SVG-like top-down canvas.
        context.saveGState()
        context.translateBy(x: raster.rect.minX, y: raster.rect.maxY)
        context.scaleBy(x: 1, y: -1)
        context.interpolationQuality = .high
        context.draw(raster.image, in: CGRect(origin: .zero, size: raster.rect.size))
        context.restoreGState()
    }
    guard let image = context.makeImage() else { throw BuildError.message("Could not create PNG image.") }
    let preview = output.appendingPathComponent("preview", isDirectory: true)
    try FileManager.default.createDirectory(at: preview, withIntermediateDirectories: true)
    try writePNG(image, to: preview.appendingPathComponent(name + ".png"))
    if exportHeaderPNG { try writePNG(image, to: output.appendingPathComponent(name + ".png")) }
    print("Created \(name) (\(number(width)) × \(number(height)))")
}

do {
    guard CommandLine.arguments.count == 4 else {
        throw BuildError.message("Usage: swift build.swift FONT_TTF MASCOT_PNG OUTPUT_DIRECTORY")
    }
    let fontURL = URL(fileURLWithPath: CommandLine.arguments[1])
    let mascotURL = URL(fileURLWithPath: CommandLine.arguments[2])
    let output = URL(fileURLWithPath: CommandLine.arguments[3], isDirectory: true)
    guard let descriptors = CTFontManagerCreateFontDescriptorsFromURL(fontURL as CFURL) as? [CTFontDescriptor], let descriptor = descriptors.first else {
        throw BuildError.message("Could not read the supplied font file.")
    }
    let mascotData = try Data(contentsOf: mascotURL)
    guard let source = CGImageSourceCreateWithData(mascotData as CFData, nil),
          CGImageSourceGetType(source) as String? == UTType.png.identifier,
          let mascotImage = CGImageSourceCreateImageAtIndex(source, 0, nil),
          mascotImage.width == mascotImage.height else {
        throw BuildError.message("The supplied mascot must be a square PNG.")
    }
    try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
    let font = CTFontCreateWithFontDescriptor(descriptor, 190, nil)
    let original = try outline("heyNag", font: font, tracking: -7.98)
    let bounds = original.boundingBoxOfPath
    let tight = translated(original, x: 12 - bounds.minX, y: 12 - bounds.minY)
    let wordmarkWidth = ceil(bounds.width + 24)
    let wordmarkHeight = ceil(bounds.height + 24)
    guard wordmarkWidth == 633 && wordmarkHeight == 202 else {
        throw BuildError.message("Unexpected wordmark metrics; use the bundled Schibsted Grotesk Regular font.")
    }
    // The V2 study pose opens its hand toward viewer-right. Put it first so the
    // gesture introduces Nag's name. The shared composition is unchanged by theme.
    // A larger name and tighter grouping carry the identity at GitHub phone widths.
    var headerTransform = CGAffineTransform(a: 1.12, b: 0, c: 0, d: 1.12, tx: 408, ty: 67)
    let headerWordmark = tight.copy(using: &headerTransform)!
    let mascot = Raster(image: mascotImage, data: mascotData,
                        rect: CGRect(x: 32, y: 0, width: 360, height: 360))
    for dark in [false, true] {
        let name = dark ? "header-dark" : "header-light"
        try writeAsset(name: name, width: 1200, height: 360, background: dark ? "#1c1c1c" : "#a8c84b",
            shapes: [Shape(path: headerWordmark, fill: dark ? "#a8c84b" : "#1c1c1c")],
            raster: mascot, title: "heyNag", description: "Nag's curious moth opens a welcoming hand toward the heyNag name.",
            exportHeaderPNG: true, output: output)
    }
    for (name, fill) in [("wordmark-ink", "#1c1c1c"), ("wordmark-paper", "#f1f1ef")] {
        try writeAsset(name: name, width: wordmarkWidth, height: wordmarkHeight, background: nil,
            shapes: [Shape(path: tight, fill: fill)], title: "heyNag",
            description: "Nag's personal wordmark, in outlined Schibsted Grotesk Regular.", output: output)
    }
    print("Font: \(CTFontCopyPostScriptName(font)); mascot: \(mascotImage.width) × \(mascotImage.height), input preserved")
} catch {
    fputs("Brand asset generation failed: \(error)\n", stderr)
    exit(1)
}
