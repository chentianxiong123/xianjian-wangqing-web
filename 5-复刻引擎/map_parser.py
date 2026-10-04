"""
Map Script Parser
Parses the custom script language used in .map.bin files
"""
import re
import json
import os
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, field


@dataclass
class NPC:
    id: int
    name: str = ""
    x: int = 0
    y: int = 0
    direction: str = "down"
    state: str = "stand"
    sequence: int = 0
    dialog: str = ""
    events: List[str] = field(default_factory=list)


@dataclass
class MapTransition:
    target_map: str
    tile_bin: str
    anim_bin: str
    sprite_bin: str
    spawn_x: int
    spawn_y: int
    direction: str


@dataclass
class MapData:
    name: str = ""
    width: int = 0
    height: int = 0
    tile_bin: str = ""
    anim_bin: str = ""
    sprite_bin: str = ""
    music: str = ""
    fly_enabled: bool = True
    npcs: Dict[int, NPC] = field(default_factory=dict)
    transitions: List[MapTransition] = field(default_factory=list)
    events: List[str] = field(default_factory=list)
    raw_script: str = ""
    commands: List[Dict[str, Any]] = field(default_factory=list)


class MapParser:
    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        self.map_dir = os.path.join(base_dir, '1-解包产物', '原始格式', 'map')
        self.img_dir = os.path.join(base_dir, '1-解包产物', '图片')
        self.maps: Dict[str, MapData] = {}

    def parse_map_file(self, filename: str) -> Optional[MapData]:
        """Parse a single .map.bin file"""
        path = os.path.join(self.map_dir, filename)
        if not os.path.exists(path):
            print(f"Map file not found: {path}")
            return None

        with open(path, 'rb') as f:
            data = f.read()

        # Skip 16-byte header
        script = data[16:].decode('utf-8', errors='replace')

        map_data = MapData(raw_script=script)
        self._parse_commands(script, map_data)
        return map_data

    def _parse_commands(self, script: str, m: MapData):
        """Parse script commands"""
        # Split by semicolon but respect parentheses
        commands = self._split_commands(script)

        for cmd in commands:
            cmd = cmd.strip()
            if not cmd or cmd == 'break':
                continue

            m.commands.append({'raw': cmd, 'type': self._classify_command(cmd)})

            # Parse specific command types
            if cmd.startswith('world.setName('):
                m.name = self._extract_string(cmd)
            elif cmd.startswith('world.change('):
                t = self._parse_world_change(cmd)
                if t:
                    m.transitions.append(t)
            elif cmd.startswith('midi.play('):
                m.music = self._extract_string(cmd)
            elif cmd.startswith('world.setFlyEnabled('):
                val = self._extract_bool(cmd)
                if val is not None:
                    m.fly_enabled = val
            elif cmd.startswith('npc.setPosition('):
                self._parse_npc_setpos(cmd, m)
            elif cmd.startswith('npc.moveTo('):
                self._parse_npc_move(cmd, m)
            elif cmd.startswith('npc.setState('):
                self._parse_npc_state(cmd, m)
            elif cmd.startswith('npc.setDirection('):
                self._parse_npc_direction(cmd, m)
            elif cmd.startswith('npc.setSequence('):
                self._parse_npc_sequence(cmd, m)
            elif cmd.startswith('dialogBox.setText('):
                self._parse_dialog(cmd, m)
            elif cmd.startswith('game.fight('):
                self._parse_fight(cmd, m)
            elif cmd.startswith('game.black('):
                m.events.append(self._extract_string(cmd))

    def _split_commands(self, script: str) -> List[str]:
        """Split script by semicolons, respecting parentheses"""
        commands = []
        depth = 0
        current = []

        for char in script:
            if char == '(':
                depth += 1
                current.append(char)
            elif char == ')':
                depth -= 1
                current.append(char)
            elif char == ';' and depth == 0:
                commands.append(''.join(current))
                current = []
            else:
                current.append(char)

        if current:
            commands.append(''.join(current))

        return commands

    def _classify_command(self, cmd: str) -> str:
        """Classify command type"""
        if '(' in cmd:
            return cmd.split('(')[0].strip()
        return cmd.strip()

    def _extract_string(self, cmd: str) -> str:
        """Extract quoted string from command"""
        match = re.search(r'"([^"]*)"', cmd)
        if match:
            return match.group(1)
        # Try unquoted
        match = re.search(r'\(([^)]+)\)', cmd)
        if match:
            return match.group(1).strip()
        return ""

    def _extract_bool(self, cmd: str) -> Optional[bool]:
        """Extract boolean value"""
        match = re.search(r'(true|false|开|关)', cmd, re.IGNORECASE)
        if match:
            val = match.group(1).lower()
            return val in ('true', '开')
        return None

    def _parse_world_change(self, cmd: str) -> Optional[MapTransition]:
        """Parse world.change(target_map, tile_bin, anim_bin, sprite_bin, x, y, direction)"""
        match = re.search(r'world\.change\((.+)\)', cmd)
        if not match:
            return None
        args = self._split_args(match.group(1))
        if len(args) >= 6:
            return MapTransition(
                target_map=args[0].strip().strip('"'),
                tile_bin=args[1].strip().strip('"'),
                anim_bin=args[2].strip().strip('"'),
                sprite_bin=args[3].strip().strip('"'),
                spawn_x=int(args[4].strip()),
                spawn_y=int(args[5].strip()),
                direction=args[6].strip().strip('"') if len(args) > 6 else "down"
            )
        return None

    def _parse_npc_setpos(self, cmd: str, m: MapData):
        """Parse npc.setPosition(id, x, y)"""
        match = re.search(r'npc\.setPosition\((\d+),\s*(\d+),\s*(\d+)', cmd)
        if match:
            nid = int(match.group(1))
            x = int(match.group(2))
            y = int(match.group(3))
            if nid not in m.npcs:
                m.npcs[nid] = NPC(id=nid)
            m.npcs[nid].x = x
            m.npcs[nid].y = y

    def _parse_npc_move(self, cmd: str, m: MapData):
        """Parse npc.moveTo(id, x, y, speed)"""
        match = re.search(r'npc\.moveTo\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)', cmd)
        if match:
            nid = int(match.group(1))
            if nid not in m.npcs:
                m.npcs[nid] = NPC(id=nid)
            m.npcs[nid].x = int(match.group(2))
            m.npcs[nid].y = int(match.group(3))

    def _parse_npc_state(self, cmd: str, m: MapData):
        """Parse npc.setState(id, state) or player.setState(state)"""
        match = re.search(r'npc\.setState\((\d+),\s*(\w+)\)', cmd)
        if match:
            nid = int(match.group(1))
            state = match.group(2)
            if nid not in m.npcs:
                m.npcs[nid] = NPC(id=nid)
            m.npcs[nid].state = state
        elif 'player.setState' in cmd:
            match = re.search(r'player\.setState\((\w+)\)', cmd)
            if match:
                pass  # Handle player state

    def _parse_npc_direction(self, cmd: str, m: MapData):
        """Parse npc.setDirection(id, dir)"""
        match = re.search(r'npc\.setDirection\((\d+),\s*(\w+)\)', cmd)
        if match:
            nid = int(match.group(1))
            direction = match.group(2)
            if nid not in m.npcs:
                m.npcs[nid] = NPC(id=nid)
            m.npcs[nid].direction = direction

    def _parse_npc_sequence(self, cmd: str, m: MapData):
        """Parse npc.setSequence(id, seq)"""
        match = re.search(r'npc\.setSequence\((\d+),\s*(\w+)\)', cmd)
        if match:
            nid = int(match.group(1))
            seq = match.group(2)
            if nid not in m.npcs:
                m.npcs[nid] = NPC(id=nid)
            try:
                m.npcs[nid].sequence = int(seq)
            except ValueError:
                m.npcs[nid].sequence = 0

    def _parse_dialog(self, cmd: str, m: MapData):
        """Parse dialogBox.setText(/Name/: text)"""
        match = re.search(r'dialogBox\.setText\(([^)]+)\)', cmd)
        if match:
            text = match.group(1)
            # Extract NPC name and dialog
            name_match = re.match(r'/([^/]+)/\s*:\s*(.*)', text)
            if name_match:
                npc_name = name_match.group(1)
                dialog_text = name_match.group(2).strip()
                m.events.append(f"DIALOG:{npc_name}:{dialog_text}")
            else:
                m.events.append(f"TEXT:{text.strip()}")

    def _parse_fight(self, cmd: str, m: MapData):
        """Parse game.fight(monster_list, bg, music)"""
        match = re.search(r'game\.fight\((.+)\)', cmd)
        if match:
            args = self._split_args(match.group(1))
            if args:
                m.events.append(f"FIGHT:{','.join(args)}")

    def _split_args(self, args_str: str) -> List[str]:
        """Split comma-separated args, respecting parentheses"""
        args = []
        depth = 0
        current = []
        for char in args_str:
            if char == '(':
                depth += 1
                current.append(char)
            elif char == ')':
                depth -= 1
                current.append(char)
            elif char == ',' and depth == 0:
                args.append(''.join(current))
                current = []
            else:
                current.append(char)
        if current:
            args.append(''.join(current))
        return args

    def load_all_maps(self) -> Dict[str, MapData]:
        """Load all map files"""
        if not os.path.exists(self.map_dir):
            print(f"Map directory not found: {self.map_dir}")
            return {}

        for fname in sorted(os.listdir(self.map_dir)):
            if fname.endswith('.map.bin'):
                map_name = fname.replace('.map.bin', '')
                map_data = self.parse_map_file(fname)
                if map_data:
                    self.maps[map_name] = map_data

        return self.maps

    def get_map(self, name: str) -> Optional[MapData]:
        """Get a map by name"""
        if name in self.maps:
            return self.maps[name]
        # Try with .map.bin suffix
        if f"{name}.map.bin" in [f.replace('.map.bin', '') for f in os.listdir(self.map_dir)]:
            return self.parse_map_file(f"{name}.map.bin")
        return None


if __name__ == '__main__':
    base_dir = '/mnt/shared/仙剑奇侠传忘情篇-逆向工程'
    parser = MapParser(base_dir)
    maps = parser.load_all_maps()
    print(f"Loaded {len(maps)} maps")

    # Show first few maps
    for name in list(maps.keys())[:5]:
        m = maps[name]
        print(f"\n{name}: {m.name}")
        print(f"  NPCs: {len(m.npcs)}")
        print(f"  Transitions: {len(m.transitions)}")
        print(f"  Events: {len(m.events)}")
        if m.transitions:
            for t in m.transitions[:3]:
                print(f"    -> {t.target_map} at ({t.spawn_x}, {t.spawn_y})")
