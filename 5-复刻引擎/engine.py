"""
Main Game Engine
Implements the game loop, world navigation, and state management
"""
import curses
import json
import os
import sys
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field

from map_parser import MapParser, MapData, NPC
from renderer import TerminalRenderer
from combat import CombatSystem, Character, create_starting_character


# Game constants
TILE_SIZE = 16  # pixels
VIEWPORT_TILES_W = 27  # tiles visible horizontally
VIEWPORT_TILES_H = 23  # tiles visible vertically
SCREEN_W = VIEWPORT_TILES_W * TILE_SIZE  # 432
SCREEN_H = VIEWPORT_TILES_H * TILE_SIZE  # 368


@dataclass
class GameState:
    """Current game state"""
    player: Character
    current_map: str = "ms_syt_1"
    player_x: int = 0
    player_y: int = 0
    player_direction: str = "down"
    in_combat: bool = False
    combat_state: Optional[Dict] = None
    dialog_queue: List[Dict] = field(default_factory=list)
    current_dialog: Optional[Dict] = None
    event_flags: Dict[str, bool] = field(default_factory=dict)
    game_phase: str = "title"  # title, explore, dialog, combat, menu
    maps: Dict[str, MapData] = field(default_factory=dict)


class GameEngine:
    """Main game engine"""

    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        self.parser = MapParser(base_dir)
        self.renderer = TerminalRenderer(base_dir)
        self.combat = CombatSystem(base_dir)
        self.state = GameState(player=create_starting_character())
        self.keys = {
            'up': 265 if sys.platform == 'darwin' else curses.KEY_UP,
            'down': 258 if sys.platform == 'darwin' else curses.KEY_DOWN,
            'left': 263 if sys.platform == 'darwin' else curses.KEY_LEFT,
            'right': 261 if sys.platform == 'darwin' else curses.KEY_RIGHT,
            'enter': 10,
            'space': 32,
            'esc': 27,
            'h': ord('h'),
            'H': ord('H'),
        }

    def load_maps(self):
        """Load all game maps"""
        self.state.maps = self.parser.load_all_maps()
        print(f"Loaded {len(self.state.maps)} maps")

    def start_game(self):
        """Start the game"""
        self.load_maps()
        curses.wrapper(self.game_loop)

    def game_loop(self, stdscr):
        """Main game loop"""
        # Setup curses
        self.renderer.init_colors()
        curses.curs_set(0)  # Hide cursor
        stdscr.nodelay(1)  # Non-blocking input
        stdscr.keypad(1)   # Enable special keys

        # Set initial map
        self.state.current_map = "ms_syt_1"
        self.state.game_phase = "title"

        while True:
            # Handle input
            key = stdscr.getch()

            if key == self.keys['esc']:
                break

            if self.state.game_phase == "title":
                self.handle_title_input(stdscr, key)
            elif self.state.game_phase == "explore":
                self.handle_explore_input(stdscr, key)
            elif self.state.game_phase == "dialog":
                self.handle_dialog_input(stdscr, key)
            elif self.state.game_phase == "combat":
                self.handle_combat_input(stdscr, key)
            elif self.state.game_phase == "help":
                self.handle_help_input(stdscr, key)

            # Render
            if self.state.game_phase == "title":
                self.renderer.render_title(stdscr)
            elif self.state.game_phase == "explore":
                self._render_explore(stdscr)
            elif self.state.game_phase == "dialog":
                self._render_dialog(stdscr)
            elif self.state.game_phase == "combat":
                self._render_combat(stdscr)
            elif self.state.game_phase == "help":
                self._render_help(stdscr)

    def handle_title_input(self, stdscr, key):
        """Handle title screen input"""
        if key == self.keys['enter']:
            self.state.game_phase = "explore"
            self._load_map(self.state.current_map)
        elif key == self.keys['h']:
            self.state.game_phase = "help"

    def handle_explore_input(self, stdscr, key):
        """Handle exploration input"""
        if key == self.keys['up'] or key == 56:  # 8 on numpad
            self._move_player(0, -1, stdscr)
        elif key == self.keys['down'] or key == 52:  # 2
            self._move_player(0, 1, stdscr)
        elif key == self.keys['left'] or key == 54:  # 4
            self._move_player(-1, 0, stdscr)
        elif key == self.keys['right'] or key == 54:  # 6
            self._move_player(1, 0, stdscr)
        elif key == self.keys['h']:
            self.state.game_phase = "help"
        elif key == ord('m') or key == ord('M'):
            self._show_menu(stdscr)

    def handle_dialog_input(self, stdscr, key):
        """Handle dialog input"""
        if key == self.keys['space'] or key == self.keys['enter']:
            self._advance_dialog()
        elif key == self.keys['esc']:
            self.state.game_phase = "explore"
            self.state.current_dialog = None

    def handle_combat_input(self, stdscr, key):
        """Handle combat input"""
        if key == ord('1'):
            self._combat_attack(stdscr)
        elif key == ord('2'):
            self._combat_skill(stdscr)
        elif key == ord('3'):
            self._combat_item(stdscr)
        elif key == ord('4'):
            self._combat_flee(stdscr)

    def _move_player(self, dx: int, dy: int, stdscr):
        """Move player and check for events"""
        new_x = self.state.player_x + dx
        new_y = self.state.player_y + dy

        # Check map boundaries and collisions
        map_data = self.state.maps.get(self.state.current_map)
        if map_data:
            # Simple boundary check
            if new_x < 0 or new_y < 0:
                return

            # Check NPC collision
            for npc in map_data.npcs.values():
                if npc.x == new_x and npc.y == new_y:
                    # Trigger dialog
                    self._start_dialog(npc)
                    return

            # Check transitions
            for t in map_data.transitions:
                if t.spawn_x == new_x and t.spawn_y == new_y:
                    self._change_map(t.target_map, t.spawn_x, t.spawn_y)
                    return

        # Check for random encounters
        if random.random() < 0.05:  # 5% chance
            self._start_combat(stdscr)
            return

        self.state.player_x = new_x
        self.state.player_y = new_y

        # Update direction
        if dx < 0: self.state.player_direction = "left"
        elif dx > 0: self.state.player_direction = "right"
        elif dy < 0: self.state.player_direction = "up"
        elif dy > 0: self.state.player_direction = "down"

    def _load_map(self, map_name: str):
        """Load a map and set player position"""
        map_data = self.state.maps.get(map_name)
        if not map_data:
            # Try loading on demand
            map_data = self.parser.parse_map_file(f"{map_name}.map.bin")
            if map_data:
                self.state.maps[map_name] = map_data

        if map_data:
            self.state.current_map = map_name
            self.state.player_x = map_data.npcs.get(0, NPC(id=0)).x if 0 in map_data.npcs else 10
            self.state.player_y = map_data.npcs.get(0, NPC(id=0)).y if 0 in map_data.npcs else 10
        else:
            print(f"Map not found: {map_name}")

    def _change_map(self, target_map: str, x: int, y: int):
        """Change to a different map"""
        self._load_map(target_map)
        self.state.player_x = x
        self.state.player_y = y

    def _start_dialog(self, npc: NPC):
        """Start a dialog with an NPC"""
        if npc.dialog:
            self.state.game_phase = "dialog"
            self.state.current_dialog = {
                'speaker': npc.name,
                'text': npc.dialog,
                'npc': npc
            }
        else:
            # Generate generic dialog
            self.state.game_phase = "dialog"
            self.state.current_dialog = {
                'speaker': npc.name or "NPC",
                'text': "这里似乎没有什么特别的...",
                'npc': npc
            }

    def _advance_dialog(self):
        """Advance to next dialog"""
        self.state.current_dialog = None
        self.state.game_phase = "explore"

    def _start_combat(self, stdscr):
        """Start a random combat encounter"""
        # Get random enemy IDs based on current map
        map_data = self.state.maps.get(self.state.current_map)
        if map_data:
            # Try to find fight events in map
            for event in map_data.events:
                if event.startswith('FIGHT:'):
                    args = event[6:].split(',')
                    enemy_ids = [int(x.strip()) for x in args[:3] if x.strip().isdigit()]
                    if enemy_ids:
                        bg = args[3].strip() if len(args) > 3 else "fight"
                        music = args[4].strip() if len(args) > 4 else "xg.mid"
                        self.state.combat_state = self.combat.start_combat(
                            self.state.player, enemy_ids, bg, music
                        )
                        self.state.game_phase = "combat"
                        return

        # Default combat
        enemy_ids = [1, 2]  # Default enemies
        self.state.combat_state = self.combat.start_combat(
            self.state.player, enemy_ids
        )
        self.state.game_phase = "combat"

    def _combat_attack(self, stdscr):
        """Player attacks in combat"""
        if not self.state.combat_state:
            return
        log = self.combat.player_attack(self.state.combat_state)
        print(log)

        if self.combat.check_victory(self.state.combat_state):
            self._combat_victory()
        elif self.combat.check_defeat(self.state.combat_state):
            self._combat_defeat()
        else:
            # Enemy turn
            enemy_logs = self.combat.enemy_turn(self.state.combat_state)
            for el in enemy_logs:
                print(el)

    def _combat_skill(self, stdscr):
        """Player uses a skill in combat"""
        if not self.state.combat_state:
            return
        # Use first available skill
        skill = self.state.player.skills[0] if self.state.player.skills else None
        if skill:
            log = self.combat.player_skill(self.state.combat_state, skill)
            print(log)

            if self.combat.check_victory(self.state.combat_state):
                self._combat_victory()
            elif self.combat.check_defeat(self.state.combat_state):
                self._combat_defeat()
            else:
                enemy_logs = self.combat.enemy_turn(self.state.combat_state)
                for el in enemy_logs:
                    print(el)
        else:
            print("没有可用技能")

    def _combat_item(self, stdscr):
        """Player uses an item in combat"""
        if not self.state.combat_state:
            return
        # Use first available heal item
        for item_name in self.state.player.items:
            if self.state.player.items[item_name] > 0:
                log = self.combat.player_item(self.state.combat_state, item_name)
                print(log)
                break

    def _combat_flee(self, stdscr):
        """Player flees from combat"""
        if random.random() < 0.5:
            print("成功逃跑!")
            self.state.game_phase = "explore"
            self.state.combat_state = None
        else:
            print("逃跑失败!")
            enemy_logs = self.combat.enemy_turn(self.state.combat_state)
            for el in enemy_logs:
                print(el)

    def _combat_victory(self):
        """Handle combat victory"""
        rewards = self.combat.apply_rewards(self.state.combat_state)
        print(f"胜利! 获得 {rewards['exp']} 经验, {rewards['gold']} 金钱")
        if rewards['level_ups']:
            print(f"升级! 等级 {rewards['level_ups']}")
        self.state.game_phase = "explore"
        self.state.combat_state = None

    def _combat_defeat(self):
        """Handle combat defeat"""
        print("败北... 游戏结束")
        # Reset to title
        self.state.game_phase = "title"
        self.state.combat_state = None
        self.state.player = create_starting_character()

    def _render_explore(self, stdscr):
        """Render exploration view"""
        map_data = self.state.maps.get(self.state.current_map)
        if map_data:
            self.renderer.render_map(
                stdscr, map_data,
                self.state.player_x, self.state.player_y,
                tile_bin="ms.bin"
            )
            # Render HUD
            try:
                stdscr.addstr(0, 30, f" Lv.{self.state.player.level} HP:{self.state.player.hp}/{self.state.player.max_hp}")
            except:
                pass

    def _render_dialog(self, stdscr):
        """Render dialog screen"""
        if self.state.current_dialog:
            self.renderer.render_dialog(
                stdscr,
                self.state.current_dialog['text'],
                self.state.current_dialog['speaker']
            )

    def _render_combat(self, stdscr):
        """Render combat screen"""
        if self.state.combat_state:
            self.renderer.render_combat(stdscr, self.state.combat_state)

    def _render_help(self, stdscr):
        """Render help screen"""
        stdscr.clear()
        try:
            stdscr.attron(curses.color_pair(15))
            stdscr.addstr(2, 2, " 操作说明:")
            stdscr.attroff(curses.color_pair(15))

            stdscr.addstr(4, 4, "  方向键 / 数字键2468: 移动")
            stdscr.addstr(5, 4, "  空格 / Enter:       确认/继续")
            stdscr.addstr(6, 4, "  ESC:                 返回/取消")
            stdscr.addstr(7, 4, "  H:                   帮助")
            stdscr.addstr(8, 4, "  M:                   菜单")
            stdscr.addstr(10, 4, "  战斗中:")
            stdscr.addstr(11, 4, "    1: 攻击")
            stdscr.addstr(12, 4, "    2: 仙术")
            stdscr.addstr(13, 4, "    3: 物品")
            stdscr.addstr(14, 4, "    4: 逃跑")
            stdscr.addstr(17, 4, "  [ESC] 返回")
        except:
            pass
        stdscr.refresh()

    def handle_help_input(self, stdscr, key):
        """Handle help screen input"""
        if key == self.keys['esc']:
            self.state.game_phase = "explore"

    def _show_menu(self, stdscr):
        """Show game menu (simplified)"""
        stdscr.clear()
        try:
            stdscr.addstr(5, 10, "=== 菜单 ===")
            stdscr.addstr(7, 10, f"角色: {self.state.player.name} Lv.{self.state.player.level}")
            stdscr.addstr(8, 10, f"HP: {self.state.player.hp}/{self.state.player.max_hp}")
            stdscr.addstr(9, 10, f"SP: {self.state.player.sp}/{self.state.player.max_sp}")
            stdscr.addstr(10, 10, f"经验: {self.state.player.exp}")
            stdscr.addstr(11, 10, f"金钱: {self.state.player.gold}")
            stdscr.addstr(13, 10, "[ESC] 关闭")
        except:
            pass
        stdscr.refresh()


if __name__ == '__main__':
    base_dir = '/mnt/shared/仙剑奇侠传忘情篇-逆向工程'
    game = GameEngine(base_dir)
    game.start_game()
