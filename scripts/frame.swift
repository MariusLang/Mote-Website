// usage: frame <bezel.png> <shot.png> <out.png> <x> <y> <w> <h> <rTL> <rTR> <rBR> <rBL> [backdrop hex] [top inset]
// Draws the screenshot into the screen rect (clipped to rounded corners), then the bezel on top.
// The top inset (px) leaves the backdrop showing above the shot, as the Mac's menu bar around the notch.
import AppKit
import CoreGraphics
import ImageIO

let a = CommandLine.arguments
func load(_ p: String) -> CGImage {
    let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: p) as CFURL, nil)!
    return CGImageSourceCreateImageAtIndex(src, 0, nil)!
}
let bezel = load(a[1]), shot = load(a[2])
let n = a[4...11].map { CGFloat(Double($0)!) }
let W = bezel.width, H = bezel.height
let ctx = CGContext(data: nil, width: W, height: H, bitsPerComponent: 8, bytesPerRow: 0,
                    space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
// Flip to top-left origin.
ctx.translateBy(x: 0, y: CGFloat(H)); ctx.scaleBy(x: 1, y: -1)
let r = CGRect(x: n[0], y: n[1], width: n[2], height: n[3])
let (tl, tr, br, bl) = (n[4] + 2, n[5] + 2, n[6] + 2, n[7] + 2)
let path = CGMutablePath()
path.move(to: CGPoint(x: r.minX + tl, y: r.minY))
path.addLine(to: CGPoint(x: r.maxX - tr, y: r.minY))
path.addArc(tangent1End: CGPoint(x: r.maxX, y: r.minY), tangent2End: CGPoint(x: r.maxX, y: r.minY + tr), radius: tr)
path.addLine(to: CGPoint(x: r.maxX, y: r.maxY - br))
path.addArc(tangent1End: CGPoint(x: r.maxX, y: r.maxY), tangent2End: CGPoint(x: r.maxX - br, y: r.maxY), radius: br)
path.addLine(to: CGPoint(x: r.minX + bl, y: r.maxY))
path.addArc(tangent1End: CGPoint(x: r.minX, y: r.maxY), tangent2End: CGPoint(x: r.minX, y: r.maxY - bl), radius: bl)
path.addLine(to: CGPoint(x: r.minX, y: r.minY + tl))
path.addArc(tangent1End: CGPoint(x: r.minX, y: r.minY), tangent2End: CGPoint(x: r.minX + tl, y: r.minY), radius: tl)
path.closeSubpath()
ctx.saveGState()
ctx.addPath(path); ctx.clip()
if a.count > 12 {
    let h = UInt32(a[12], radix: 16)!
    ctx.setFillColor(CGColor(srgbRed: CGFloat((h >> 16) & 255) / 255, green: CGFloat((h >> 8) & 255) / 255, blue: CGFloat(h & 255) / 255, alpha: 1))
    ctx.fill(r)
}
// Draw unflipped: CGContext.draw expects bottom-left origin within the rect.
func draw(_ img: CGImage, in rect: CGRect) {
    ctx.saveGState()
    ctx.translateBy(x: rect.minX, y: rect.maxY); ctx.scaleBy(x: 1, y: -1)
    ctx.draw(img, in: CGRect(x: 0, y: 0, width: rect.width, height: rect.height))
    ctx.restoreGState()
}
// The shot fills the screen width, top aligned below the inset (a Mac window may be shorter than the screen).
let inset = a.count > 13 ? CGFloat(Double(a[13])!) : 0
let scale = r.width / CGFloat(shot.width)
draw(shot, in: CGRect(x: r.minX, y: r.minY + inset, width: r.width, height: CGFloat(shot.height) * scale))
ctx.restoreGState()
draw(bezel, in: CGRect(x: 0, y: 0, width: W, height: H))
let out = ctx.makeImage()!
let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: a[3]) as CFURL, "public.png" as CFString, 1, nil)!
CGImageDestinationAddImage(dest, out, nil); CGImageDestinationFinalize(dest)
