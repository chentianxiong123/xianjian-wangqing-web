"""
Turn-based Combat System
Implements the combat mechanics from the original game
"""
import random
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field

from config_parser import load_all_configs


@dataclass
class Character:
    name: str
    level: int
    hp: int
    max_hp: int
    sp: int
    max_sp: int
    wp: int  # 武 - attack
    dp: int  # 防 - defense
    sp2: int  # 速 - speed
    ip: int  # 神 - magic power
    exp: int
    gold: int
    skills: List[str] = field(default_factory=list)
    items: Dict[str, int] = field(default_factory=dict)
    state: str = "normal"
    buffs: Dict[str, int] = field(default_factory=dict)

    def is_alive(self) -> bool:
        return self.hp > 0

    def take_damage(self, damage: int, dtype: str = "physical") -> int:
        if dtype == "physical":
            actual = max(1, damage - self.dp // 2)
        else:
            actual = damage
        self.hp = max(0, self.hp - actual)
        return actual

    def heal(self, amount: int):
        self.hp = min(self.max_hp, self.hp + amount)

    def use_sp(self, cost: int) -> bool:
        if self.sp >= cost:
            self.sp -= cost
            return True
        return False


@dataclass
class Enemy:
    id: int
    name: str
    level: int
    hp: int
    max_hp: int
    wp: int
    dp: int
    sp2: int
    exp: int
    gold: int
    drops: List[str] = field(default_factory=list)

    def is_alive(self) -> bool:
        return self.hp > 0

    def take_damage(self, damage: int) -> int:
        actual = max(1, damage - self.dp // 2)
        self.hp = max(0, self.hp - actual)
        return actual


class CombatSystem:
    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        self.configs = load_all_configs(base_dir)
        self.skill_map = self.configs.get('skills_detailed', {})
        self.item_map = self.configs.get('items_detailed', {})
        self.enemy_map = self._build_enemy_table()

    def _build_enemy_table(self) -> Dict[int, Dict]:
        """Build enemy lookup table from config"""
        table = {}
        # Default enemy templates based on level
        for level in range(1, 60):
            table[level] = {
                'name': f'怪物Lv.{level}',
                'hp': 80 + 20 * level,
                'wp': 40 + 10 * level,
                'dp': 5 + 3 * level,
                'sp2': 10 + level,
                'exp': 8 + 3 * level,
                'gold': 3 + level,
            }
        # Add some named enemies
        named = {
            1: {'name': '野狼', 'hp': 100, 'wp': 50, 'dp': 10, 'exp': 15, 'gold': 5},
            2: {'name': '山猪', 'hp': 120, 'wp': 55, 'dp': 12, 'exp': 18, 'gold': 6},
            3: {'name': '蛇妖', 'hp': 150, 'wp': 65, 'dp': 15, 'exp': 25, 'gold': 10},
            4: {'name': '蜘蛛精', 'hp': 180, 'wp': 70, 'dp': 18, 'exp': 30, 'gold': 12},
            5: {'name': '树精', 'hp': 200, 'wp': 75, 'dp': 20, 'exp': 35, 'gold': 15},
            10: {'name': '鬼将', 'hp': 400, 'wp': 120, 'dp': 40, 'exp': 80, 'gold': 30},
            20: {'name': '妖王', 'hp': 800, 'wp': 200, 'dp': 60, 'exp': 200, 'gold': 80},
            30: {'name': '邪术师', 'hp': 1200, 'wp': 280, 'dp': 80, 'exp': 350, 'gold': 120},
            40: {'name': '锁妖', 'hp': 1800, 'wp': 350, 'dp': 100, 'exp': 500, 'gold': 180},
            50: {'name': '魔将', 'hp': 2500, 'wp': 450, 'dp': 130, 'exp': 700, 'gold': 250},
        }
        table.update(named)
        return table

    def calculate_damage(self, attacker: Character, target: Character, 
                         skill_name: str = "") -> int:
        """Calculate damage for an attack"""
        if not skill_name or skill_name not in self.skill_map:
            base = attacker.wp
            return max(1, base - target.dp // 3 + random.randint(-3, 5))

        skill = self.skill_map[skill_name]
        power_expr = skill.get('power_expr', 'atk')

        try:
            atk = attacker.wp
            slv = attacker.level
            expr = power_expr.replace('atk', str(atk)).replace('slv', str(slv))
            return max(1, eval(expr))
        except:
            return max(1, attacker.wp - target.dp // 3)

    def start_combat(self, player: Character, enemy_levels: List[int],
                     map_bg: str = "fight", music: str = "xg.mid") -> Dict[str, Any]:
        """Start a combat encounter"""
        enemies = []
        for level in enemy_levels:
            template = self.enemy_map.get(level, self.enemy_map.get(1, {}))
            enemy = Enemy(
                id=level,
                name=template.get('name', f'怪物Lv.{level}'),
                level=level,
                hp=template.get('hp', 100),
                max_hp=template.get('hp', 100),
                wp=template.get('wp', 50),
                dp=template.get('dp', 10),
                sp2=template.get('sp2', 10),
                exp=template.get('exp', 10),
                gold=template.get('gold', 5),
            )
            enemies.append(enemy)

        combat_state = {
            'phase': 'player_turn',
            'player': player,
            'enemies': enemies,
            'log': [f"遭遇了 {', '.join(e.name for e in enemies)}!"],
            'map_bg': map_bg,
            'music': music,
            'turn': 0,
            'victory': False,
            'fled': False,
        }
        return combat_state

    def player_attack(self, combat: Dict[str, Any], target_idx: int = 0) -> str:
        player = combat['player']
        enemies = combat['enemies']

        target = enemies[target_idx] if target_idx < len(enemies) else None
        if not target or not target.is_alive():
            for i, e in enumerate(enemies):
                if e.is_alive():
                    target = e
                    target_idx = i
                    break

        if not target:
            return "没有目标"

        damage = self.calculate_damage(player, target)
        actual = target.take_damage(damage)
        combat['log'].append(f"{player.name} 攻击 {target.name}, 造成 {actual} 点伤害")
        return f"{player.name} 攻击 {target.name}, 造成 {actual} 点伤害"

    def player_skill(self, combat: Dict[str, Any], skill_name: str, 
                     target_idx: int = 0) -> str:
        player = combat['player']
        enemies = combat['enemies']

        if skill_name not in self.skill_map:
            return f"不会技能: {skill_name}"

        skill = self.skill_map[skill_name]
        cost = skill.get('cost', 10)

        if not player.use_sp(cost):
            return "气值不足"

        # Find target
        if skill.get('target') == 'all':
            # Hit all enemies
            results = []
            for i, enemy in enumerate(enemies):
                if enemy.is_alive():
                    damage = self.calculate_damage(player, enemy, skill_name)
                    actual = enemy.take_damage(damage)
                    results.append(f"{player.name} 使用 {skill_name}, 对 {enemy.name} 造成 {actual} 点伤害")
            combat['log'].extend(results)
            return '; '.join(results) if results else "没有目标"
        else:
            target = enemies[target_idx] if target_idx < len(enemies) else None
            if not target or not target.is_alive():
                for e in enemies:
                    if e.is_alive():
                        target = e
                        break

            if not target:
                return "没有目标"

            damage = self.calculate_damage(player, target, skill_name)
            actual = target.take_damage(damage)
            combat['log'].append(f"{player.name} 使用 {skill_name}, 对 {target.name} 造成 {actual} 点伤害")
            return f"{player.name} 使用 {skill_name}, 对 {target.name} 造成 {actual} 点伤害"

    def player_item(self, combat: Dict[str, Any], item_name: str) -> str:
        player = combat['player']

        if item_name not in player.items or player.items[item_name] <= 0:
            return "物品不足"

        # Check if it's a heal item
        heal_amount = 0
        if '止血草' in item_name:
            heal_amount = 50
        elif '鼠儿果' in item_name:
            heal_amount = 100
        elif '仙丹' in item_name:
            heal_amount = 300

        if heal_amount > 0:
            player.heal(heal_amount)
            player.items[item_name] -= 1
            combat['log'].append(f"{player.name} 使用 {item_name}, 恢复 {heal_amount} 点HP")
            return f"{player.name} 使用 {item_name}, 恢复 {heal_amount} 点HP"

        return "无效物品"

    def enemy_turn(self, combat: Dict[str, Any]) -> List[str]:
        player = combat['player']
        enemies = combat['enemies']
        logs = []

        for enemy in enemies:
            if not enemy.is_alive():
                continue

            damage = max(1, enemy.wp - player.dp // 3 + random.randint(-3, 3))
            actual = player.take_damage(damage)
            logs.append(f"{enemy.name} 攻击 {player.name}, 造成 {actual} 点伤害")

        return logs

    def check_victory(self, combat: Dict[str, Any]) -> bool:
        return all(not e.is_alive() for e in combat['enemies'])

    def check_defeat(self, combat: Dict[str, Any]) -> bool:
        return not combat['player'].is_alive()

    def apply_rewards(self, combat: Dict[str, Any]) -> Dict[str, Any]:
        player = combat['player']
        total_exp = sum(e.exp for e in combat['enemies'] if not e.is_alive())
        total_gold = sum(e.gold for e in combat['enemies'] if not e.is_alive())

        player.exp += total_exp
        player.gold += total_gold

        level_ups = []
        while player.exp >= self._exp_needed(player.level):
            player.exp -= self._exp_needed(player.level)
            player.level += 1
            self._level_up(player)
            level_ups.append(player.level)

        return {
            'exp': total_exp,
            'gold': total_gold,
            'level_ups': level_ups
        }

    def _exp_needed(self, level: int) -> int:
        return 20 + (level - 1) * 30

    def _level_up(self, player: Character):
        player.max_hp = 200 + 46 * player.level
        player.hp = player.max_hp
        player.max_sp = 8 + player.level
        player.sp = player.max_sp
        player.wp = 100 + 26 * player.level
        player.dp = 18 + 4 * player.level
        player.sp2 = 21


def create_starting_character() -> Character:
    """Create the starting character (重楼)"""
    player = Character(
        name="重楼",
        level=1,
        hp=246,
        max_hp=246,
        sp=9,
        max_sp=9,
        wp=126,
        dp=22,
        sp2=21,
        ip=24,
        exp=0,
        gold=300,
        skills=["心波", "鬼降", "炎咒", "冰咒"],
        items={"止血草": 5, "鼠儿果": 3}
    )
    return player


if __name__ == '__main__':
    base = '/mnt/shared/仙剑奇侠传忘情篇-逆向工程'
    combat = CombatSystem(base)

    player = create_starting_character()
    print(f"角色: {player.name} Lv.{player.level} HP={player.hp} WP={player.wp}")
    print(f"技能: {player.skills}")
    print(f"物品: {player.items}")

    # Start combat
    state = combat.start_combat(player, [1, 2])
    print(f"\n{state['log'][0]}")

    for turn in range(8):
        if combat.check_victory(state):
            rewards = combat.apply_rewards(state)
            print(f"\n胜利! EXP+{rewards['exp']} GOLD+{rewards['gold']}")
            if rewards['level_ups']:
                print(f"升级! 等级 {rewards['level_ups']}")
            break
        if combat.check_defeat(state):
            print("\n败北...")
            break

        # Player action
        if player.skills and turn % 3 == 2:
            log = combat.player_skill(state, player.skills[0])
        else:
            log = combat.player_attack(state)
        print(f"[P] {log}")

        if combat.check_victory(state):
            rewards = combat.apply_rewards(state)
            print(f"胜利! EXP+{rewards['exp']} GOLD+{rewards['gold']}")
            break
        if combat.check_defeat(state):
            print("败北...")
            break

        # Enemy turn
        for el in combat.enemy_turn(state):
            print(f"[E] {el}")