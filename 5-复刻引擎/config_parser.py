"""
Configuration Parser
Parses the custom text-based config files from the game
"""
import json
import os
from typing import Dict, List, Any, Optional


def parse_text_config(path: str) -> Dict[str, Any]:
    """Parse a text-based config file into a dictionary"""
    result = {}
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                key, val = line.split('=', 1)
                result[key.strip()] = val.strip()
            elif '#' in line:
                parts = line.split('#')
                result[parts[0].strip()] = parts[1].strip() if len(parts) > 1 else ''
    return result


def parse_enemy_config(path: str) -> Dict[str, List[Dict]]:
    """Parse enemy config - maps each map to its enemies"""
    result = {}
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Skip header
    for line in lines[1:]:
        line = line.strip()
        if not line or '=' not in line:
            continue
        
        map_name, rest = line.split('=', 1)
        map_name = map_name.strip()
        
        parts = rest.split(',')
        if len(parts) >= 3:
            # Parse enemy IDs (can be ranges like 1-2 or 1-2-5)
            id_str = parts[0].strip()
            enemy_count = int(parts[1].strip()) if len(parts) > 1 else 1
            
            # Parse level range
            level_str = parts[2].strip() if len(parts) > 2 else '1'
            
            # Handle conditional levels: #32?25-35:0-10
            if '?' in level_str:
                cond = level_str.split('?')[0]
                rest = level_str.split('?')[1]
                if ':' in rest:
                    true_lv, false_lv = rest.split(':', 1)
                else:
                    true_lv = rest
                    false_lv = '1'
                event_id = cond.replace('#', '')
            else:
                event_id = ''
                true_lv = level_str
                false_lv = '1'
            
            # Parse level range
            try:
                if '-' in true_lv:
                    lv_start, lv_end = true_lv.split('-')
                    min_level, max_level = int(lv_start), int(lv_end)
                else:
                    min_level = max_level = int(true_lv)
            except:
                min_level = max_level = 1
            
            result[map_name] = {
                'enemy_ids': _parse_id_range(id_str),
                'enemy_count': enemy_count,
                'min_level': min_level,
                'max_level': max_level,
                'bg': parts[3].strip() if len(parts) > 3 else 'fight',
                'music': parts[4].strip() if len(parts) > 4 else 'xg.mid',
            }
    
    return result


def _parse_id_range(id_str: str) -> List[int]:
    """Parse ID range like '1-2' or '3-4' into list of IDs"""
    ids = []
    for part in id_str.split('-'):
        part = part.strip()
        try:
            ids.append(int(part))
        except:
            pass
    return ids if ids else [1]


def parse_skill_config(path: str) -> Dict[str, Dict]:
    """Parse skill config"""
    result = {}
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Skip header
    for line in lines[1:]:
        line = line.strip()
        if not line:
            continue
        
        parts = line.split('#')
        if len(parts) >= 11:
            skill = {
                'type': parts[0].strip(),
                'attack_type': parts[1].strip(),
                'name': parts[2].strip(),
                'desc': parts[11].strip() if len(parts) > 11 else '',
                'cost': int(parts[5].strip()) if parts[5].strip().isdigit() else 10,
                'power_expr': parts[9].strip() if len(parts) > 9 else 'atk',
                'target': 'all' if parts[7].strip() == '是' else 'single',
                'element': parts[0].strip() if parts[0].strip() not in ('普通',) else '',
            }
            if skill['name']:
                result[skill['name']] = skill
    
    return result


def parse_item_config(path: str) -> Dict[str, Dict]:
    """Parse item config"""
    result = {}
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for line in lines[1:]:
        line = line.strip()
        if not line:
            continue
        
        parts = line.split('#')
        if len(parts) >= 8:
            item = {
                'name': parts[1].strip(),
                'type': parts[0].strip(),
                'level': int(parts[2].strip()) if parts[2].strip().isdigit() else 1,
                'owner': parts[3].strip(),
                'price': int(parts[4].strip()) if parts[4].strip().isdigit() else 0,
                'effect': parts[7].strip() if len(parts) > 7 else '',
            }
            if item['name']:
                result[item['name']] = item
    
    return result


def parse_character_config(path: str) -> Dict[str, Any]:
    """Parse character config"""
    return parse_text_config(path)


def parse_combat_config(path: str) -> Dict[str, Any]:
    """Parse combat config"""
    return parse_text_config(path)


def load_all_configs(base_dir: str) -> Dict[str, Any]:
    """Load all game configurations"""
    cfg_dir = os.path.join(base_dir, '3-数据')
    configs = {}
    
    # Load all text configs
    for fname in os.listdir(cfg_dir):
        if fname.startswith('配置-') and fname.endswith('.txt'):
            key = fname.replace('配置-', '').replace('.txt', '')
            path = os.path.join(cfg_dir, fname)
            configs[key] = parse_text_config(path)
    
    # Special parsing for complex configs
    enemy_path = os.path.join(cfg_dir, '配置-敌人.txt')
    if os.path.exists(enemy_path):
        configs['enemies_detailed'] = parse_enemy_config(enemy_path)
    
    skill_path = os.path.join(cfg_dir, '配置-技能.txt')
    if os.path.exists(skill_path):
        configs['skills_detailed'] = parse_skill_config(skill_path)
    
    item_path = os.path.join(cfg_dir, '配置-物品.txt')
    if os.path.exists(item_path):
        configs['items_detailed'] = parse_item_config(item_path)
    
    return configs


if __name__ == '__main__':
    base = '/mnt/shared/仙剑奇侠传忘情篇-逆向工程'
    configs = load_all_configs(base)
    
    print("Loaded configs:")
    for key in sorted(configs.keys()):
        data = configs[key]
        if isinstance(data, dict):
            print(f"  {key}: {len(data)} entries")
        elif isinstance(data, list):
            print(f"  {key}: {len(data)} lines")
    
    # Show enemy map data
    if 'enemies_detailed' in configs:
        print(f"\nEnemy encounters by map:")
        for map_name, data in list(configs['enemies_detailed'].items())[:10]:
            print(f"  {map_name}: IDs={data['enemy_ids']} count={data['enemy_count']} Lv.{data['min_level']}-{data['max_level']}")
    
    # Show skills
    if 'skills_detailed' in configs:
        print(f"\nSkills ({len(configs['skills_detailed'])}):")
        for name, skill in list(configs['skills_detailed'].items())[:5]:
            print(f"  {name}: cost={skill['cost']} target={skill['target']} element={skill.get('element', '')}")
    
    # Show items
    if 'items_detailed' in configs:
        print(f"\nItems ({len(configs['items_detailed'])}):")
        for name, item in list(configs['items_detailed'].items())[:5]:
            print(f"  {name}: type={item['type']} level={item['level']} price={item['price']}")
