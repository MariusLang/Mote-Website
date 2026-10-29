// usage: menubar <in.png> <out.png> <x> <y> <w> <h> <light|dark>
// Draws a clean macOS menu bar into the band (x, y, w, h) above a framed Mac shot: the Apple menu and Mote's
// menus on the left, Wi-Fi, battery, Control Center and "9:41" on the right (as on the iPhone shots).
// The band is the one frame.swift leaves free; the notch in the middle stays as the bezel drew it.
import AppKit

let a = CommandLine.arguments
let n = a[3...6].map { CGFloat(Double($0)!) }
let band = CGRect(x: n[0], y: n[1], width: n[2], height: n[3])
let dark = a[7] == "dark"
let src = NSImage(contentsOfFile: a[1])!
let rep = NSBitmapImageRep(data: src.tiffRepresentation!)!
let W = rep.pixelsWide, H = rep.pixelsHigh
let out = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: W, pixelsHigh: H, bitsPerSample: 8, samplesPerPixel: 4,
                           hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
let ctx = NSGraphicsContext(bitmapImageRep: out)!
NSGraphicsContext.current = ctx
rep.draw(in: NSRect(x: 0, y: 0, width: W, height: H))
// Top-left origin from here on.
let flipped = NSGraphicsContext(cgContext: ctx.cgContext, flipped: true)
ctx.cgContext.translateBy(x: 0, y: CGFloat(H)); ctx.cgContext.scaleBy(x: 1, y: -1)
NSGraphicsContext.current = flipped

// One menu bar point in pixels: the band is the 37 pt menu bar of a notched MacBook.
let pt = band.height / 37
let ink = dark ? NSColor.white : NSColor.black
let mid = band.midY

func text(_ s: String, at x: CGFloat, bold: Bool = false) -> CGFloat {
    let font = NSFont.systemFont(ofSize: 13 * pt, weight: bold ? .bold : .medium)
    let str = NSAttributedString(string: s, attributes: [.font: font, .foregroundColor: ink.withAlphaComponent(0.88)])
    let size = str.size()
    str.draw(at: CGPoint(x: x, y: mid - size.height / 2))
    return size.width
}
func symbol(_ name: String, at x: CGFloat, size: CGFloat = 14) -> CGFloat {
    let config = NSImage.SymbolConfiguration(pointSize: size * pt, weight: .medium)
        .applying(.init(paletteColors: [ink.withAlphaComponent(0.88)]))
    let img = NSImage(systemSymbolName: name, accessibilityDescription: nil)!.withSymbolConfiguration(config)!
    img.draw(in: CGRect(x: x, y: mid - img.size.height / 2, width: img.size.width, height: img.size.height),
             from: .zero, operation: .sourceOver, fraction: 1, respectFlipped: true, hints: nil)
    return img.size.width
}

var x = band.minX + 20 * pt
x += symbol("apple.logo", at: x, size: 15) + 20 * pt
x += text("Mote", at: x, bold: true) + 20 * pt
for m in ["File", "Edit", "View", "Block", "Window", "Help"] { x += text(m, at: x) + 20 * pt }

// The right side is laid out from the edge inwards.
func width(_ s: String) -> CGFloat {
    NSAttributedString(string: s, attributes: [.font: NSFont.systemFont(ofSize: 13 * pt, weight: .medium)]).size().width
}
func symbolWidth(_ name: String, size: CGFloat = 14) -> CGFloat {
    NSImage(systemSymbolName: name, accessibilityDescription: nil)!
        .withSymbolConfiguration(.init(pointSize: size * pt, weight: .medium))!.size.width
}
var r = band.maxX - 18 * pt
let clock = "Mon Jun 9  9:41 AM"
r -= width(clock); _ = text(clock, at: r)
for (name, size) in [("switch.2", 13.0), ("magnifyingglass", 13.0), ("wifi", 14.0), ("battery.100percent", 16.0)] {
    r -= 18 * pt + symbolWidth(name, size: size); _ = symbol(name, at: r, size: size)
}

NSGraphicsContext.current = nil
try! out.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: a[2]))
