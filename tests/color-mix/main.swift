import Foundation
@main enum Main { static func main() { while let line = readLine() { if let v = ColorMix.argb(line) { print(v) } else { print("nil") } } } }
