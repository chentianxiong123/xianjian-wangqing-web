"""
PNG Decoder - Pure Python implementation using zlib
Supports all PNG color types including indexed color (ctype=3) with palettes
"""
import struct
import zlib
import os
from typing import Tuple, List, Optional, Dict


def decode_png(path: str) -> Tuple[int, int, List[Tuple[int, int, int, int]]]:
    """
    Decode a PNG file and return (width, height, pixels)
    pixels is a list of (r, g, b, a) tuples, left-to-right, top-to-bottom
    """
    with open(path, 'rb') as f:
        data = f.read()

    # PNG signature check
    if data[:8] != b'\x89PNG\r\n\x1a\n':
        raise ValueError(f"Not a valid PNG file: {path}")

    pos = 8
    width = height = bit_depth = color_type = interlace = 0
    palette = []
    idat_data = b''

    while pos < len(data):
        length = struct.unpack('>I', data[pos:pos+4])[0]
        chunk_type = data[pos+4:pos+8]
        chunk_data = data[pos+8:pos+8+length]
        pos += 12 + length

        if chunk_type == b'IHDR':
            width, height, bit_depth, color_type, comp, filt, interlace = \
                struct.unpack('>IIBBBBB', chunk_data)
        elif chunk_type == b'PLTE':
            palette = [tuple(chunk_data[i:i+3]) for i in range(0, len(chunk_data), 3)]
        elif chunk_type == b'IDAT':
            idat_data += chunk_data
        elif chunk_type == b'IEND':
            break

    # Decompress image data
    raw = zlib.decompress(idat_data)

    # Calculate bytes per pixel
    bpp_map = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}
    bpp = bpp_map.get(color_type, 3)

    # For indexed color (ctype=3), each pixel is 1 byte (8-bit index)
    if color_type == 3:
        row_bytes = width
    else:
        row_bytes = (width * bpp + 7) // 8

    # Inverse filter
    rows = []
    prev_row = bytearray(row_bytes)
    i = 0
    for y in range(height):
        filt_byte = raw[i]
        i += 1
        row = bytearray(raw[i:i+row_bytes])
        i += row_bytes

        for x in range(len(row)):
            a = row[x-bpp] if x >= bpp else 0
            b = prev_row[x]
            c = prev_row[x-bpp] if x >= bpp else 0

            if filt_byte == 1:
                row[x] = (row[x] + a) & 255
            elif filt_byte == 2:
                row[x] = (row[x] + b) & 255
            elif filt_byte == 3:
                row[x] = (row[x] + ((a + b) // 2)) & 255
            elif filt_byte == 4:
                p = a + b - c
                pa, pb, pc = abs(p-a), abs(p-b), abs(p-c)
                pr = a if pa <= pb and pa <= pc else (b if pb <= pc else c)
                row[x] = (row[x] + pr) & 255
            elif filt_byte == 5:
                row[x] = prev_row[x]
            elif filt_byte == 6:
                row[x] = row[x-bpp] if x >= bpp else 0

        rows.append(bytes(row))
        prev_row = row

    # Convert to RGBA
    pixels = []
    for y in range(height):
        for x in range(width):
            idx = x * bpp
            if color_type == 0:  # Grayscale
                r = g = b = rows[y][idx]
                a = 255
            elif color_type == 2:  # RGB
                r = rows[y][idx]
                g = rows[y][idx+1]
                b = rows[y][idx+2]
                a = 255
            elif color_type == 3:  # Indexed color
                pixel_idx = rows[y][x]
                if pixel_idx < len(palette):
                    r, g, b = palette[pixel_idx]
                else:
                    r = g = b = 0
                a = 255
            elif color_type == 4:  # RGBA
                r = rows[y][idx]
                g = rows[y][idx+1]
                b = rows[y][idx+2]
                a = rows[y][idx+3]
            elif color_type == 6:  # RGBA (same as 4)
                r = rows[y][idx]
                g = rows[y][idx+1]
                b = rows[y][idx+2]
                a = rows[y][idx+3]
            else:
                r = g = b = 0
                a = 255
            pixels.append((r, g, b, a))

    return width, height, pixels


def load_tile_images(tile_dir: str) -> Dict[str, Tuple[int, int, List[Tuple[int, int, int, int]]]]:
    """Load all PNG tiles from a directory, return dict of name -> (w, h, pixels)"""
    tiles = {}
    if not os.path.exists(tile_dir):
        return tiles

    for fname in sorted(os.listdir(tile_dir)):
        if fname.lower().endswith('.png'):
            path = os.path.join(tile_dir, fname)
            try:
                w, h, px = decode_png(path)
                name = os.path.splitext(fname)[0]
                tiles[name] = (w, h, px)
            except Exception as e:
                print(f"Warning: Failed to decode {fname}: {e}")

    return tiles


def get_pixel(pixels: List[Tuple[int, int, int, int]], w: int, h: int, x: int, y: int) -> Tuple[int, int, int, int]:
    """Get a single pixel from pixel list, returning transparent black if out of bounds"""
    if 0 <= x < w and 0 <= y < h:
        return pixels[y * w + x]
    return (0, 0, 0, 0)


def blend_pixels(bg: Tuple[int, int, int, int], fg: Tuple[int, int, int, int]) -> Tuple[int, int, int, int]:
    """Alpha-blend foreground over background"""
    if fg[3] == 0:
        return bg
    if fg[3] == 255:
        return fg
    a = fg[3] / 255.0
    r = int(fg[0] * a + bg[0] * (1 - a))
    g = int(fg[1] * a + bg[1] * (1 - a))
    b = int(fg[2] * a + bg[2] * (1 - a))
    return (r, g, b, 255)


def compute_tile_ascii(tile_pixels: List[Tuple[int, int, int, int]], tw: int, th: int) -> str:
    """Convert a tile to a single ASCII character based on dominant color"""
    # Count non-transparent pixels
    colored = [(r, g, b) for r, g, b, a in tile_pixels if a > 128]
    if not colored:
        return ' '

    # Average color
    avg_r = sum(c[0] for c in colored) // len(colored)
    avg_g = sum(c[1] for c in colored) // len(colored)
    avg_b = sum(c[2] for c in colored) // len(colored)

    # Determine brightness
    brightness = (avg_r * 299 + avg_g * 587 + avg_b * 114) / 1000

    # Character based on brightness and color
    if brightness < 50:
        return '█'
    elif brightness < 100:
        return '▓'
    elif brightness < 150:
        return '▒'
    else:
        return '░'


def color_code(r: int, g: int, b: int) -> int:
    """Convert RGB to nearest ANSI color (1-256)"""
    # Map to nearest palette color
    # Simple heuristic: use the dominant channel
    if r > 128 and g > 128 and b > 128:
        return 7  # White/light gray
    if r < 64 and g < 64 and b < 64:
        return 0  # Black
    if r > g and r > b:
        if r > 180: return 9   # Red
        return 1   # Dark red
    if g > r and g > b:
        if g > 180: return 10  # Green
        return 2   # Dark green
    if b > r and b > g:
        if b > 180: return 12  # Blue
        return 4   # Dark blue
    if r > g and r > b and g > b:
        return 3   # Yellow/brown
    return 7


if __name__ == '__main__':
    # Test PNG decoder
    test_dir = '/mnt/shared/仙剑奇侠传忘情篇-逆向工程/1-解包产物/图片/ms.bin'
    tiles = load_tile_images(test_dir)
    print(f"Loaded {len(tiles)} tiles from ms.bin")

    # Show first few tiles
    for name in list(tiles.keys())[:5]:
        w, h, px = tiles[name]
        non_trans = sum(1 for r,g,b,a in px if a > 128)
        print(f"  {name}: {w}x{h}, {non_trans} colored pixels")

    # Test with a larger sprite
    char_dir = '/mnt/shared/仙剑奇侠传忘情篇-逆向工程/1-解包产物/图片/chonglou.bin'
    char_tiles = load_tile_images(char_dir)
    print(f"\nLoaded {len(char_tiles)} sprites from chonglou.bin")
    for name in char_tiles:
        w, h, px = char_tiles[name]
        print(f"  {name}: {w}x{h}")
