"""
仙剑奇侠传-忘情篇 复刻版
Main entry point - Text-based playable demo
"""
import os
import sys
import random

# Add engine to path
sys.path.insert(0, os.path.dirname(__file__))

from map_parser import MapParser
from combat import CombatSystem, Character, create_starting_character
from config_parser import load_all_configs


class TextGame:
    """Text-based game interface (no curses required)"""

    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        self.parser = MapParser(base_dir)
        self.combat = CombatSystem(base_dir)
        self.configs = load_all_configs(base_dir)
        self.state = {
            'player': create_starting_character(),
            'current_map': 'ms_syt_1',
            'x': 10,
            'y': 10,
            'direction': 'down',
            'phase': 'title',  # title, explore, dialog, combat, help
            'maps': {},
            'combat_state': None,
            'dialog': None,
        }
        self._load_maps()

    def _load_maps(self):
        self.state['maps'] = self.parser.load_all_maps()
        print(f"加载了 {len(self.state['maps'])} 张地图")

    def run(self):
        """Main game loop"""
        while True:
            if self.state['phase'] == 'title':
                self._render_title()
                self._handle_title_input()
            elif self.state['phase'] == 'explore':
                self._render_explore()
                self._handle_explore_input()
            elif self.state['phase'] == 'dialog':
                self._render_dialog()
                self._handle_dialog_input()
            elif self.state['phase'] == 'combat':
                self._render_combat()
                self._handle_combat_input()
            elif self.state['phase'] == 'help':
                self._render_help()
                self._handle_help_input()

    def _render_title(self):
        print("\n" + "="*50)
        print("    仙剑奇侠传 - 忘情篇 (复刻版)")
        print("="*50)
        print("\n  [Enter] 开始游戏")
        print("  [H]     操作说明")
        print("  [Q]     退出")
        print()

    def _handle_title_input(self):
        cmd = input("\n请选择: ").strip().lower()
        if cmd == '' or cmd == 'enter':
            self.state['phase'] = 'explore'
            self._load_map('cs_ljb_1')  # Start at 罗家堡
        elif cmd == 'h':
            self.state['phase'] = 'help'
        elif cmd == 'q':
            print("再见!")
            sys.exit(0)

    def _render_explore(self):
        m = self.state['maps'].get(self.state['current_map'])
        p = self.state['player']

        print("\n" + "-"*50)
        print(f"📍 {m.name if m else self.state['current_map']}")
        print(f"   坐标: ({self.state['x']}, {self.state['y']}) 方向: {self.state['direction']}")
        print(f"   Lv.{p.level} {p.name}  HP:{p.hp}/{p.max_hp} SP:{p.sp}/{p.max_sp}")
        print(f"   金钱:{p.gold}  经验:{p.exp}")
        print("-"*50)

        # Show NPCs
        if m and m.npcs:
            print("\n  附近NPC:")
            for nid, npc in list(m.npcs.items())[:5]:
                dist = abs(npc.x - self.state['x']) + abs(npc.y - self.state['y'])
                if dist <= 3:
                    print(f"    - {npc.name or f'NPC#{nid}'} ({npc.x},{npc.y}) [距离{dist}]")

        # Show transitions
        if m and m.transitions:
            print("\n  出口:")
            for t in m.transitions:
                dist = abs(t.spawn_x - self.state['x']) + abs(t.spawn_y - self.state['y'])
                print(f"    -> {t.target_map} (距离{dist})")

        # Show events nearby
        if m:
            dialogs = [e for e in m.events if e.startswith('TEXT:') or e.startswith('DIALOG:')]
            if dialogs and not self.state.get('event_triggered'):
                print(f"\n  剧情触发! ({len(dialogs)}条对话)")

        print("\n  [W/↑]上 [S/↓]下 [A/←]左 [D/→]右")
        print("  [E]交互 [H]帮助 [M]菜单 [ESC]退出")

    def _handle_explore_input(self):
        cmd = input("\n行动: ").strip().lower()

        if cmd in ('w', 'arrow up', 'up', '↑'):
            self._move(0, -1)
        elif cmd in ('s', 'arrow down', 'down', '↓'):
            self._move(0, 1)
        elif cmd in ('a', 'arrow left', 'left', '←'):
            self._move(-1, 0)
        elif cmd in ('d', 'arrow right', 'right', '→'):
            self._move(1, 0)
        elif cmd == 'e':
            self._interact()
        elif cmd == 'h':
            self.state['phase'] = 'help'
        elif cmd == 'm':
            self._show_menu()
        elif cmd in ('esc', 'q', 'exit'):
            print("再见!")
            sys.exit(0)
        else:
            print("(无效指令)")

    def _move(self, dx: int, dy: int):
        new_x = self.state['x'] + dx
        new_y = self.state['y'] + dy
        self.state['x'] = new_x
        self.state['y'] = new_y

        if dx < 0: self.state['direction'] = 'left'
        elif dx > 0: self.state['direction'] = 'right'
        elif dy < 0: self.state['direction'] = 'up'
        elif dy > 0: self.state['direction'] = 'down'

        # Check NPC collision
        m = self.state['maps'].get(self.state['current_map'])
        if m:
            for npc in m.npcs.values():
                if npc.x == new_x and npc.y == new_y:
                    self._start_dialog(npc)
                    return

        # Check map transitions
        if m:
            for t in m.transitions:
                if t.spawn_x == new_x and t.spawn_y == new_y:
                    self._load_map(t.target_map)
                    return

        # Random encounter
        if random.random() < 0.08:
            self._start_combat()

    def _start_combat(self):
        """Start a random combat encounter"""
        m = self.state['maps'].get(self.state['current_map'])
        enemy_levels = [1, 2]  # Default
        bg = 'fight'
        music = 'xg.mid'

        if m:
            # Try to find fight events in map
            for event in m.events:
                if event.startswith('FIGHT:'):
                    args = event[6:].split(',')
                    levels = [int(x.strip()) for x in args[:2] if x.strip().isdigit()]
                    if levels:
                        enemy_levels = levels
                        bg = args[2].strip() if len(args) > 2 else 'fight'
                        music = args[3].strip() if len(args) > 3 else 'xg.mid'
                    break
            # Also check enemy config for this map name
            enemy_config = self.configs.get('enemies_detailed', {})
            map_key = m.name if m else self.state['current_map']
            if map_key in enemy_config:
                ec = enemy_config[map_key]
                enemy_levels = [ec['min_level'] + random.randint(0, max(0, ec['max_level'] - ec['min_level']))
                               for _ in range(ec['enemy_count'])]
                bg = ec.get('bg', 'fight')
                music = ec.get('music', 'xg.mid')

        self.state['combat_state'] = self.combat.start_combat(
            self.state['player'], enemy_levels, bg, music
        )
        self.state['phase'] = 'combat'

    def _interact(self):
        m = self.state['maps'].get(self.state['current_map'])
        if not m:
            return

        # Find closest NPC
        closest = None
        closest_dist = 3
        for npc in m.npcs.values():
            dist = abs(npc.x - self.state['x']) + abs(npc.y - self.state['y'])
            if dist < closest_dist:
                closest_dist = dist
                closest = npc

        if closest:
            self._start_dialog(closest)
        else:
            # Trigger map events
            for event in m.events:
                if event.startswith('TEXT:') and not self.state.get('event_triggered'):
                    _, speaker, text = event.split(':', 2)
                    self.state['dialog'] = {'speaker': speaker.strip(), 'text': text.strip()}
                    self.state['phase'] = 'dialog'
                    self.state['event_triggered'] = True
                    return
                elif event.startswith('FIGHT:'):
                    args = event[6:].split(',')
                    levels = [int(x.strip()) for x in args[:2] if x.strip().isdigit()]
                    if levels:
                        self.state['combat_state'] = self.combat.start_combat(
                            self.state['player'], levels, args[2].strip() if len(args) > 2 else 'fight'
                        )
                        self.state['phase'] = 'combat'
                        return

    def _start_dialog(self, npc):
        # Find dialog for this NPC from map events
        m = self.state['maps'].get(self.state['current_map'])
        if m:
            for event in m.events:
                if event.startswith('TEXT:') or event.startswith('DIALOG:'):
                    parts = event.split(':', 2)
                    if len(parts) >= 3:
                        speaker = parts[1].strip().strip('/')
                        text = parts[2].strip()
                        if speaker and text:
                            self.state['dialog'] = {'speaker': speaker, 'text': text}
                            self.state['phase'] = 'dialog'
                            return

        # Default dialog
        self.state['dialog'] = {
            'speaker': npc.name or 'NPC',
            'text': '这里似乎没有什么特别的...'
        }
        self.state['phase'] = 'dialog'

    def _render_dialog(self):
        d = self.state['dialog']
        print("\n" + "═"*50)
        print(f"  【{d['speaker']}】")
        print("─"*50)
        print(f"  {d['text']}")
        print("─"*50)
        print("  [空格/Enter] 继续  [ESC] 退出")

    def _handle_dialog_input(self):
        cmd = input("\n").strip().lower()
        if cmd in ('', ' ', 'enter'):
            self.state['phase'] = 'explore'
            self.state['dialog'] = None
        elif cmd == 'esc':
            self.state['phase'] = 'explore'
            self.state['dialog'] = None

    def _render_combat(self):
        cs = self.state['combat_state']
        p = cs['player']

        print("\n" + "═"*50)
        print("  ⚔ 战斗中 ⚔")
        print("─"*50)

        # Player status
        hp_bar = '█' * (p.hp * 20 // p.max_hp) + '░' * (20 - p.hp * 20 // p.max_hp)
        sp_bar = '▓' * (p.sp * 15 // p.max_sp) + '░' * (15 - p.sp * 15 // p.max_sp)
        print(f"  {p.name} Lv.{p.level}")
        print(f"  HP: [{hp_bar}] {p.hp}/{p.max_hp}")
        print(f"  SP: [{sp_bar}] {p.sp}/{p.max_sp}")
        print(f"  技能: {', '.join(p.skills)}")
        print(f"  物品: {dict(list(p.items.items())[:3])}")

        # Enemy status
        print("─"*50)
        for e in cs['enemies']:
            if e.is_alive():
                e_hp_bar = '█' * (e.hp * 15 // e.max_hp) + '░' * (15 - e.hp * 15 // e.max_hp)
                print(f"  {e.name} Lv.{e.level}")
                print(f"  HP: [{e_hp_bar}] {e.hp}/{e.max_hp}")

        # Combat log
        print("─"*50)
        for log in cs['log'][-4:]:
            print(f"  {log}")

        print("─"*50)
        print("  [1]攻击 [2]技能 [3]物品 [4]逃跑")

    def _handle_combat_input(self):
        cmd = input("\n选择: ").strip()

        if cmd == '1':
            log = self.combat.player_attack(self.state['combat_state'])
            print(f"\n  {log}")
            self._check_combat_result()
        elif cmd == '2':
            if self.state['player'].skills:
                skill = self.state['player'].skills[0]
                log = self.combat.player_skill(self.state['combat_state'], skill)
                print(f"\n  {log}")
                self._check_combat_result()
            else:
                print("\n  没有技能!")
        elif cmd == '3':
            if self.state['player'].items:
                item = list(self.state['player'].items.keys())[0]
                log = self.combat.player_item(self.state['combat_state'], item)
                print(f"\n  {log}")
            else:
                print("\n  没有物品!")
        elif cmd == '4':
            if random.random() < 0.5:
                print("\n  成功逃跑!")
                self.state['phase'] = 'explore'
                self.state['combat_state'] = None
            else:
                print("\n  逃跑失败!")
                self._enemy_turn()
        elif cmd == 'esc':
            print("\n  无法在战斗中退出!")

    def _check_combat_result(self):
        cs = self.state['combat_state']
        if self.combat.check_victory(cs):
            rewards = self.combat.apply_rewards(cs)
            print(f"\n  🎉 胜利!")
            print(f"  获得 {rewards['exp']} 经验, {rewards['gold']} 金钱")
            if rewards['level_ups']:
                print(f"  升级! 等级 {rewards['level_ups']}")
            self.state['phase'] = 'explore'
            self.state['combat_state'] = None
        elif self.combat.check_defeat(cs):
            print(f"\n  💀 败北... 游戏结束")
            self.state['phase'] = 'title'
            self.state['combat_state'] = None
            self.state['player'] = create_starting_character()
        else:
            self._enemy_turn()

    def _enemy_turn(self):
        cs = self.state['combat_state']
        for log in self.combat.enemy_turn(cs):
            print(f"\n  {log}")
        if self.combat.check_defeat(cs):
            print(f"\n  💀 败北... 游戏结束")
            self.state['phase'] = 'title'
            self.state['combat_state'] = None
            self.state['player'] = create_starting_character()

    def _render_help(self):
        print("\n" + "═"*50)
        print("  操作说明")
        print("─"*50)
        print("  移动: W/↑ 上  S/↓ 下  A/← 左  D/→ 右")
        print("  交互: E 或与NPC碰撞")
        print("  菜单: M")
        print("  帮助: H")
        print("─"*50)
        print("  战斗中:")
        print("  [1] 普通攻击  [2] 使用技能")
        print("  [3] 使用物品  [4] 逃跑")
        print("─"*50)
        print("  [ESC] 返回")

    def _handle_help_input(self):
        cmd = input("\n").strip()
        if cmd == 'esc' or cmd == '':
            self.state['phase'] = 'explore'

    def _show_menu(self):
        p = self.state['player']
        print(f"\n--- 菜单 ---")
        print(f"角色: {p.name} Lv.{p.level}")
        print(f"HP: {p.hp}/{p.max_hp}  SP: {p.sp}/{p.max_sp}")
        print(f"武: {p.wp}  防: {p.dp}  速: {p.sp2}")
        print(f"经验: {p.exp}  金钱: {p.gold}")
        print(f"技能: {', '.join(p.skills)}")
        print(f"物品: {p.items}")
        print("---")
        input("按Enter继续...")

    def _load_map(self, map_name: str):
        m = self.state['maps'].get(map_name)
        if not m:
            m = self.parser.parse_map_file(f"{map_name}.map.bin")
            if m:
                self.state['maps'][map_name] = m

        if m:
            self.state['current_map'] = map_name
            # Find spawn point
            if m.npcs:
                spawn = next(iter(m.npcs.values()))
                self.state['x'] = spawn.x
                self.state['y'] = spawn.y
            else:
                self.state['x'] = 10
                self.state['y'] = 10
            self.state['event_triggered'] = False
            print(f"\n>>> 到达: {m.name}")
        else:
            print(f">>> 地图未找到: {map_name}")


def main():
    base_dir = '/mnt/shared/仙剑奇侠传忘情篇-逆向工程'
    game = TextGame(base_dir)
    game.run()


if __name__ == '__main__':
    main()
