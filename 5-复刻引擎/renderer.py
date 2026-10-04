"""
Curses-based Terminal Renderer
Renders game tiles, sprites, and UI using ANSI colors and block characters
"""
import curses
import struct
import zlib
from typing import Dict, List, Tuple, Optional
import os
import json

# Terminal display settings
TILE_SIZE = 2  # Each tile takes 2 terminal cells (width x height) for better resolution
VIEWPORT_W = 55  # Terminal width in characters
VIEWPORT_H = 30  # Terminal height in characters


class TerminalRenderer:
    """Renders game to terminal using curses"""

    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        self.tile_cache: Dict[str, Dict[str, Tuple[int, int, List[Tuple[int,int,int,int]]]]] = {}
        self.sprite_cache: Dict[str, Tuple[int, int, List[Tuple[int,int,int,int]]]] = {}
        self.palette: Dict[int, Tuple[int, int, int]] = {}

    def load_png(self, path: str) -> Optional[Tuple[int, int, List[Tuple[int,int,int,int]]]]:
        """Load and decode a PNG file"""
        try:
            with open(path, 'rb') as f:
                data = f.read()

            if data[:8] != b'\x89PNG\r\n\x1a\n':
                return None

            pos = 8
            width = height = bit_depth = color_type = 0
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

            raw = zlib.decompress(idat_data)
            bpp = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}.get(color_type, 3)
            row_bytes = width if color_type == 3 else (width * bpp + 7) // 8

            rows = []
            prev_row = bytearray(row_bytes)
            i = 0
            for y in range(height):
                filt_byte = raw[i]; i += 1
                row = bytearray(raw[i:i+row_bytes]); i += row_bytes
                for x in range(len(row)):
                    a = row[x-bpp] if x >= bpp else 0
                    b = prev_row[x]
                    c = prev_row[x-bpp] if x >= bpp else 0
                    if filt_byte == 1: row[x] = (row[x] + a) & 255
                    elif filt_byte == 2: row[x] = (row[x] + b) & 255
                    elif filt_byte == 3: row[x] = (row[x] + ((a+b)//2)) & 255
                    elif filt_byte == 4:
                        p = a + b - c
                        pa,pb,pc = abs(p-a),abs(p-b),abs(p-c)
                        pr = a if pa<=pb and pa<=pc else (b if pb<=pc else c)
                        row[x] = (row[x] + pr) & 255
                rows.append(bytes(row))
                prev_row = row

            pixels = []
            for y in range(height):
                for x in range(width):
                    idx = x * bpp
                    if color_type == 0:
                        r=g=b=rows[y][idx]; a=255
                    elif color_type == 2:
                        r=rows[y][idx]; g=rows[y][idx+1]; b=rows[y][idx+2]; a=255
                    elif color_type == 3:
                        pi = rows[y][x]
                        r,g,b = palette[pi] if pi < len(palette) else (0,0,0)
                        a=255
                    elif color_type in (4, 6):
                        r=rows[y][idx]; g=rows[y][idx+1]; b=rows[y][idx+2]; a=rows[y][idx+3]
                    else:
                        r=g=b=0; a=255
                    pixels.append((r, g, b, a))

            return width, height, pixels

        except Exception as e:
            print(f"Error loading PNG {path}: {e}")
            return None

    def load_tile_bin(self, bin_name: str) -> Dict[str, Tuple[int, int, List[Tuple[int,int,int,int]]]]:
        """Load all tiles from a BIN directory"""
        bin_path = os.path.join(self.base_dir, '1-解包产物', '图片', bin_name)
        if not os.path.exists(bin_path):
            return {}

        tiles = {}
        for fname in sorted(os.listdir(bin_path)):
            if fname.lower().endswith('.png'):
                name = os.path.splitext(fname)[0]
                result = self.load_png(os.path.join(bin_path, fname))
                if result:
                    tiles[name] = result
        return tiles

    def get_tile_color(self, tile_name: str, bin_name: str) -> Tuple[int, int, int]:
        """Get dominant color of a tile for rendering"""
        key = f"{bin_name}/{tile_name}"
        if key not in self.tile_cache:
            tiles = self.load_tile_bin(bin_name)
            if tile_name in tiles:
                self.tile_cache[key] = tiles[tile_name]
            else:
                self.tile_cache[key] = (16, 16, [(0,0,0,0)] * 256)

        w, h, pixels = self.tile_cache[key]
        colored = [(r,g,b) for r,g,b,a in pixels if a > 128]
        if not colored:
            return (50, 50, 50)  # Default gray for empty tiles

        avg_r = sum(c[0] for c in colored) // len(colored)
        avg_g = sum(c[1] for c in colored) // len(colored)
        avg_b = sum(c[2] for c in colored) // len(colored)
        return (avg_r, avg_g, avg_b)

    def rgb_to_curses(self, r: int, g: int, b: int) -> int:
        """Convert RGB to nearest curses color pair"""
        # Use curses color pairs (1-255)
        # Simple mapping: map to closest standard color
        colors = [
            (0,0,0),          # 1: black
            (128,0,0),        # 2: dark red
            (0,128,0),        # 3: dark green
            (128,128,0),      # 4: dark yellow
            (0,0,128),        # 5: dark blue
            (128,0,128),      # 6: dark magenta
            (0,128,128),      # 7: dark cyan
            (192,192,192),    # 8: light gray
            (128,128,128),    # 9: dark gray
            (255,0,0),        # 10: bright red
            (0,255,0),        # 11: bright green
            (255,255,0),      # 12: bright yellow
            (0,0,255),        # 13: bright blue
            (255,0,255),      # 14: bright magenta
            (0,255,255),      # 15: bright cyan
            (255,255,255),    # 16: white
        ]

        min_dist = float('inf')
        best = 1
        for i, (cr, cg, cb) in enumerate(colors):
            dist = (r-cr)**2 + (g-cg)**2 + (b-cb)**2
            if dist < min_dist:
                min_dist = dist
                best = i + 1
        return best

    def render_map(self, stdscr, map_data, player_x: int, player_y: int,
                   tile_bin: str = "ms.bin", viewport_w: int = VIEWPORT_W,
                   viewport_h: int = VIEWPORT_H):
        """Render a map to the terminal"""
        stdscr.clear()

        # Calculate camera position (center on player)
        cam_x = player_x - viewport_w // 2
        cam_y = player_y - viewport_h // 2

        # Render tiles
        for vy in range(viewport_h):
            for vx in range(viewport_w):
                tx = cam_x + vx
                ty = cam_y + vy

                # Get tile color
                r, g, b = self.get_tile_color(f"m_{tx % 31 + 1}", tile_bin)

                # Set color
                color_id = self.rgb_to_curses(r, g, b)
                try:
                    stdscr.attron(curses.color_pair(color_id))
                except:
                    pass

                # Render tile as block character
                brightness = (r * 299 + g * 587 + b * 114) // 1000
                if brightness < 50:
                    ch = '█'
                elif brightness < 100:
                    ch = '▓'
                elif brightness < 150:
                    ch = '▒'
                else:
                    ch = '░'

                try:
                    stdscr.addch(vy, vx, ch)
                except curses.error:
                    pass

                try:
                    stdscr.attroff(curses.color_pair(color_id))
                except:
                    pass

        # Render player
        px = player_x - cam_x
        py = player_y - cam_y
        if 0 <= px < viewport_w and 0 <= py < viewport_h:
            try:
                stdscr.attron(curses.color_pair(10))  # Green for player
                stdscr.addch(py, px, '@')
                stdscr.attroff(curses.color_pair(10))
            except curses.error:
                pass

        # Render border
        try:
            stdscr.attron(curses.color_pair(8))
            for x in range(viewport_w):
                stdscr.addch(0, x, '─')
                stdscr.addch(viewport_h-1, x, '─')
            for y in range(viewport_h):
                stdscr.addch(y, 0, '│')
                stdscr.addch(y, viewport_w-1, '│')
            stdscr.addch(0, 0, '┌'); stdscr.addch(0, viewport_w-1, '┐')
            stdscr.addch(viewport_h-1, 0, '└'); stdscr.addch(viewport_h-1, viewport_w-1, '┘')
            stdscr.attroff(curses.color_pair(8))
        except curses.error:
            pass

        # Render map name
        try:
            stdscr.attron(curses.color_pair(16))
            stdscr.addstr(0, 2, f" {map_data.name} ")
            stdscr.attroff(curses.color_pair(16))
        except curses.error:
            pass

        # Render HUD
        try:
            stdscr.addstr(viewport_h, 0, f" 坐标:({player_x},{player_y})  方向键移动  ESC退出  H帮助")
        except curses.error:
            pass

        stdscr.refresh()

    def render_dialog(self, stdscr, text: str, speaker: str = "",
                      viewport_w: int = VIEWPORT_W, viewport_h: int = VIEWPORT_H):
        """Render a dialog box"""
        stdscr.clear()

        # Background
        try:
            stdscr.attron(curses.color_pair(9))
            for y in range(viewport_h):
                for x in range(viewport_w):
                    stdscr.addch(y, x, ' ')
            stdscr.attroff(curses.color_pair(9))
        except:
            pass

        # Border
        try:
            stdscr.attron(curses.color_pair(15))
            for x in range(viewport_w):
                stdscr.addch(viewport_h-4, x, '─')
            for y in range(viewport_h-3, viewport_h-1):
                stdscr.addch(y, 0, '│')
                stdscr.addch(y, viewport_w-1, '│')
            stdscr.addch(viewport_h-4, 0, '┌')
            stdscr.addch(viewport_h-4, viewport_w-1, '┐')
            stdscr.addch(viewport_h-1, 0, '└')
            stdscr.addch(viewport_h-1, viewport_w-1, '┘')
            stdscr.attroff(curses.color_pair(15))
        except:
            pass

        # Speaker name
        if speaker:
            try:
                stdscr.attron(curses.color_pair(12))
                stdscr.addstr(viewport_h-3, 2, f"【{speaker}】")
                stdscr.attroff(curses.color_pair(12))
            except:
                pass

        # Dialog text (wrap)
        max_line_len = viewport_w - 4
        lines = []
        current_line = ""
        for char in text:
            if char == '\n':
                lines.append(current_line)
                current_line = ""
            elif len(current_line) >= max_line_len:
                lines.append(current_line)
                current_line = char
            else:
                current_line += char
        if current_line:
            lines.append(current_line)

        for i, line in enumerate(lines[:3]):
            try:
                stdscr.addstr(viewport_h-3 + i, 2, line[:max_line_len])
            except:
                pass

        # Prompt
        try:
            stdscr.attron(curses.color_pair(8))
            stdscr.addstr(viewport_h-1, 2, " [空格]继续  [ESC]退出")
            stdscr.attroff(curses.color_pair(8))
        except:
            pass

        stdscr.refresh()

    def render_combat(self, stdscr, combat_state: dict, viewport_w: int = VIEWPORT_W,
                      viewport_h: int = VIEWPORT_H):
        """Render turn-based combat screen"""
        stdscr.clear()

        # Background
        try:
            stdscr.attron(curses.color_pair(9))
            for y in range(viewport_h):
                for x in range(viewport_w):
                    stdscr.addch(y, x, ' ')
            stdscr.attroff(curses.color_pair(9))
        except:
            pass

        # Title
        try:
            stdscr.attron(curses.color_pair(10))
            stdscr.addstr(0, 0, " ⚔ 战斗 ⚔ ")
            stdscr.attroff(curses.color_pair(10))
        except:
            pass

        # Enemy info
        enemies = combat_state.get('enemies', [])
        try:
            stdscr.attron(curses.color_pair(9))
            for i, enemy in enumerate(enemies):
                name = enemy.get('name', '敌人')
                hp = enemy.get('hp', 0)
                max_hp = enemy.get('max_hp', 100)
                hp_bar = '█' * (hp * 20 // max_hp) + '░' * (20 - hp * 20 // max_hp)
                stdscr.addstr(2 + i * 2, 2, f" {name}: [{hp_bar}] {hp}/{max_hp}")
            stdscr.attroff(curses.color_pair(9))
        except:
            pass

        # Player info
        players = combat_state.get('players', [])
        try:
            stdscr.attron(curses.color_pair(12))
            for i, player in enumerate(players):
                name = player.get('name', '角色')
                hp = player.get('hp', 0)
                max_hp = player.get('max_hp', 100)
                sp = player.get('sp', 0)
                max_sp = player.get('max_sp', 50)
                hp_bar = '█' * (hp * 15 // max_hp) + '░' * (15 - hp * 15 // max_hp)
                sp_bar = '▓' * (sp * 15 // max_sp) + '░' * (15 - sp * 15 // max_sp)
                stdscr.addstr(2 + i * 2, 30, f" {name}: HP[{hp_bar}] SP[{sp_bar}]")
            stdscr.attroff(curses.color_pair(12))
        except:
            pass

        # Combat log
        log = combat_state.get('log', [])
        try:
            for i, entry in enumerate(log[-5:]):
                stdscr.addstr(viewport_h - 3 + i, 2, f" > {entry}")
        except:
            pass

        # Actions
        try:
            stdscr.attron(curses.color_pair(14))
            stdscr.addstr(viewport_h - 1, 2, " [1]攻击 [2]仙术 [3]物品 [4]逃跑")
            stdscr.attroff(curses.color_pair(14))
        except:
            pass

        stdscr.refresh()

    def render_title(self, stdscr):
        """Render game title screen"""
        stdscr.clear()
        try:
            # Title
            stdscr.attron(curses.color_pair(14))
            stdscr.addstr(10, 15, " 仙剑奇侠传")
            stdscr.addstr(11, 17, "  忘情篇")
            stdscr.attroff(curses.color_pair(14))

            stdscr.attron(curses.color_pair(8))
            stdscr.addstr(14, 15, "    [复刻版]    ")
            stdscr.attroff(curses.color_pair(8))

            stdscr.addstr(17, 15, "  [Enter] 开始游戏")
            stdscr.addstr(18, 15, "  [H]    操作说明")
            stdscr.addstr(19, 15, "  [ESC]  退出")
            stdscr.attroff(curses.color_pair(8))
        except:
            pass
        stdscr.refresh()

    def init_colors(self):
        """Initialize curses colors"""
        curses.start_color()
        curses.use_default_colors()

        pairs = [
            (1, -1, -1),    # black
            (128, 0, 0),    # dark red
            (0, 128, 0),    # dark green
            (128, 128, 0),  # dark yellow
            (0, 0, 128),    # dark blue
            (128, 0, 128),  # dark magenta
            (0, 128, 128),  # dark cyan
            (192, 192, 192),# light gray
            (128, 128, 128),# dark gray
            (255, 0, 0),    # bright red
            (0, 255, 0),    # bright green
            (255, 255, 0),  # bright yellow
            (0, 0, 255),    # bright blue
            (255, 0, 255),  # bright magenta
            (0, 255, 255),  # bright cyan
            (255, 255, 255),# white
        ]

        for i, (r, g, b) in enumerate(pairs, 1):
            try:
                curses.init_pair(i, r, g if g >= 0 else -1)
                # Simple approach: use foreground color, black background
                curses.init_pair(i, i, -1)
            except:
                pass


if __name__ == '__main__':
    # Test renderer
    renderer = TerminalRenderer('/mnt/shared/仙剑奇侠传忘情篇-逆向工程')
    renderer.init_colors()

    print("Renderer initialized. Use curses in terminal for full display.")
    print("Test: Loading tiles...")

    tiles = renderer.load_tile_bin("ms.bin")
    print(f"Loaded {len(tiles)} tiles from ms.bin")
    for name in list(tiles.keys())[:3]:
        w, h, px = tiles[name]
        colored = sum(1 for r,g,b,a in px if a > 128)
        print(f"  {name}: {w}x{h}, {colored} colored pixels")
