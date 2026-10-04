# 仙剑忘情篇 Web 复刻 — 接口契约 v1.0

> **本文档是所有并行 agent 的强制规范。** 任何 agent 开工前必须先读此文档。
> 违反契约的改动会导致集成失败。

---

## 1. 项目根目录

```
~/桌面/仙剑忘情-地图复刻/
├── index.html          ← 主引擎（仅由集成者修改）
├── CONTRACT.md         ← 本文档
├── PARALLEL_TASKS.md   ← 任务拆分清单
├── data/               ← 数据层（批次1 agent 写入）
│   ├── maps.js         ✅ 已完成（69张地图）
│   ├── talk_scripts.js ✅ 已完成（30个对话）
│   ├── npc_config.js   ✅ 已完成（39个NPC）
│   ├── npc_sprite_map.js ✅ 已完成（NPC→立绘映射）
│   ├── bin_index.js    ✅ 已完成（BIN索引）
│   ├── items.js        ← Agent-D1
│   ├── skills.js       ← Agent-D2
│   ├── enemies.js      ← Agent-D3
│   ├── recipes.js      ← Agent-D4
│   ├── tasks.js        ← Agent-D4
│   ├── chars.js        ← Agent-D5
│   ├── fight_cfg.js    ← Agent-D5
│   ├── game_cfg.js     ← Agent-D5
│   └── ants.js         ← Agent-D6
├── src/                ← 系统层（批次2 agent 写入）
│   ├── state.js        ← 集成者（定义 schema）
│   ├── save.js         ← Agent-S1
│   ├── inventory.js    ← Agent-S2
│   ├── battle.js       ← Agent-S3
│   ├── shop.js         ← Agent-S4
│   ├── craft.js        ← Agent-S5
│   ├── quest.js        ← Agent-S6
│   ├── menu.js         ← Agent-S7
│   └── audio.js        ← Agent-S8
├── data/tiles/         ✅ 已完成（336张PNG）
└── mid/                ← Agent-S8 提取 MIDI
```

### 文件归属规则（强制）

| 规则 | 说明 |
|------|------|
| **只写自己负责的文件** | Agent 只能创建/修改分配给自己的文件 |
| **禁止修改 index.html** | 集成者统一在最后引入所有 script |
| **禁止修改 CONTRACT.md** | 发现契约问题 → 通知集成者 |
| **禁止修改已完成文件** | `data/maps.js` 等标记 ✅ 的文件不可触碰 |
| **禁止跨目录引用** | `src/*.js` 可以引用 `data/*.js`，反之不行 |

---

## 2. 数据文件规范（批次1）

### 2.1 文件格式

所有 `data/*.js` 文件统一格式：

```javascript
// data/xxx.js — 描述
// 来源: str/config_xxx.str (gzip → STR magic 解析)
// 字段说明: ...
window.XJ_DATA_ITEMS = { ... };
```

**必须用 `var` 或直接赋值，不能用 `const`/`let`**（兼容旧版解析）。
**必须挂载到 `window.XJ_DATA_XXX` 全局变量**。

### 2.2 STR 解析标准

所有 `str/*.str` 文件的二进制格式（已100%确认）：

```
偏移  长度   内容
0     4B     magic: 88 53 54 52 ("STR")
4     2B     version: 06 00
6     1B     count (条目数)
7     —      [count 个条目]:
              0x00         (条目起始标记，1B)
              0xNN         (条目长度，1B，最大255)
              NN bytes     (UTF-8 内容)
```

**标准解析函数**（所有 agent 应复用）：

```python
import gzip
def parse_str(fn):
    d = gzip.decompress(open(fn,'rb').read())
    assert d[:6] == b'\x88STR\x06\x00'
    pos = 6
    count = d[pos]; pos += 1
    fields = []
    for _ in range(count):
        if pos < len(d) and d[pos] == 0: pos += 1  # skip 0x00 marker
        flen = d[pos]; pos += 1
        fields.append(d[pos:pos+flen].decode('utf-8','replace'))
        pos += flen
    return fields
```

### 2.3 各数据文件的 Schema

#### `data/items.js` → `window.XJ_DATA_ITEMS`

```javascript
{
  "count": 90,
  "items": {
    "木剑": {
      "name": "木剑",
      "type": "武器",       // 武器|服饰|头饰|足饰|饰品|药品|材料|任务|特殊
      "level": 1,           // 装备等级要求
      "owner": "重楼",      // 装备者: 重楼|月瑶|紫萱|所有人
      "atk": 50,            // 武+
      "def": 0,             // 防+
      "spd": 0,             // 速+
      "lck": 0,             // 运+
      "maxhp": 0,           // 生命+
      "maxsp": 0,           // 气+
      "maxmp": 0,           // 神+
      "regen": 0,           // 每回合恢复
      "price": 20,
      "quality": 1,
      "desc": "武+50，1级可装备，重楼专用"
    }
  }
}
```

**原始字段顺序**（15字段，`#` 分隔）：
`name#type#level#owner#atk#def#spd#lck#maxhp#maxsp#maxmp#regen#price#quality#desc`

**物品类型**（9种）：武器、服饰、头饰、足饰、饰品、药品、材料、任务、特殊

#### `data/skills.js` → `window.XJ_DATA_SKILLS`

```javascript
{
  "count": 28,
  "skills": [
    {
      "idx": 1,             // 原始序号（0是表头，跳过）
      "type": "普通",       // 技能类型: 普通|水系|火系|风系|土系|雷系
      "attackType": "攻击", // 攻击类型: 攻击|增益|减益|偷窃|特殊
      "name": "鬼降",
      "animation": "鬼降",  // 动画文件名
      "multi": "是",        // 是否群体
      "spCost": 10,         // 气消耗
      "hpCost": 10,         // 生命消耗（负数=恢复）
      "mpCost": "否",       // 神消耗
      "hit": 7,             // 命中率
      "crit": 0,            // 暴击率
      "formula": "(atk*8)/10", // 伤害公式（JS表达式字符串）
      "desc": "减少精，攻击全体目标"
    }
  ]
}
```

**原始字段顺序**（12字段）：
`type#attackType#name#animation#multi#spCost#hpCost#mpCost#hit#crit#formula#desc`

**注意**：第0条是表头（`技能类型#攻击类型#名字#...`），从 idx=1 开始是真实技能。

#### `data/enemies.js` → `window.XJ_DATA_ENEMIES`

```javascript
{
  "count": 33,
  "encounters": {
    "十里坡东": {
      "enemyIds": "1-2",         // 敌人ID范围
      "type": "2",               // 怪物种类
      "event": "#32",            // 事件ID条件
      "levelRange": "25-35",     // 成立等级范围
      "failLevel": "0-10",       // 不成立的等级
      "battleBg": "fight_conglin", // 战斗背景ANT
      "music": "xg.mid"          // 战斗音乐
    }
  },
  "enemyTemplates": {
    // 敌人模板（从 fight_*.str 解析，Agent-D3 补充）
  }
}
```

**原始格式**：`地图名=id范围,种类,事件?等级范围:失败等级,背景,音乐`
**注意**：第0条是表头。

#### `data/recipes.js` → `window.XJ_DATA_RECIPES`

```javascript
{
  "count": 19,
  "recipes": [
    {
      "result": "竹蜻蜓",
      "materials": [
        {"name": "妖树刺", "count": 1},
        {"name": "蓝幽羽", "count": 2}
      ],
      "desc": "赠予异性后，好感度+2，需要材料妖树刺1，蓝幽羽2"
    }
  ]
}
```

**原始格式**：`结果,材料1(数量)|材料2(数量),描述`

#### `data/tasks.js` → `window.XJ_DATA_TASKS`

```javascript
{
  "count": 46,
  "tasks": [
    {
      "name": "去渔村",
      "desc": "去渔村找紫萱，沿着云麓下山就能到渔村"
    }
  ]
}
```

**原始格式**：`任务名 = 任务描述`（按出现顺序排列，序号从1开始）

#### `data/chars.js` → `window.XJ_DATA_CHARS`

```javascript
{
  "chonglou": {
    "name": "重楼",
    "initialLevel": 1,
    "moveSpeed": 6,
    "flySpeed": 12,
    "initialExp": 0,
    "initialMoney": 300,
    "initialWeapon": "木剑",
    "initialArmor": "布衣",
    "initialHead": "头巾",
    "initialFoot": "无",
    "initialAcc": "无",
    "initialSkills": ["心波", "鬼降", "魔尊真身"],
    "initialSpells": ["炎咒", "冰咒"],
    "initialItems": ["止血草", "止血草", "止血草", "止血草", "止血草", "鼠儿果", "鼠儿果", "鼠儿果", "鼠儿果", "鼠儿果"],
    "formulas": {
      "expNeeded": "20+(lv-1)*30",
      "maxhp": "200+46*lv",
      "maxsp": "8+lv",
      "maxmp": "20+4*lv",
      "lck": 10,
      "atk": "100+26*lv",
      "def": "18+4*lv",
      "spd": 21,
      "spellSpeed": "10+4*(slv-1)"
    },
    "affinity": 0,
    "assistRate": 15,
    "comboRate": 0,
    "portrait": ["portrait_cl.ant", "normal"]
  },
  "liyiru": { /* 李忆如 config_liyiru.str */ },
  "zixuan": { /* 紫萱 config_zixuan.str */ }
}
```

**config_xxx.str 格式**：`key = value`（用 `#` 或 `=` 分隔，与 task.str 相同）

#### `data/fight_cfg.js` → `window.XJ_DATA_FIGHT_CFG`

```javascript
{
  "bgWidth": 440,
  "bgHeight": 400,
  "heroPositions": [
    {"x": 182, "y": 249},  // 英雄1
    {"x": 150, "y": 272},  // 英雄2
    {"x": 210, "y": 219}   // 英雄3
  ],
  "enemyPositions": [
    {"x": 26, "y": 164},   // 敌兵1
    {"x": 40, "y": 128},   // 敌兵2
    {"x": 86, "y": 113}    // 敌兵3
  ],
  "attackDistance": 25,
  "dmgSpeedH": 8,
  "dmgSpeedV": 20,
  "dmgAccelV": -5,
  "dmgOffsetH": 10,
  "dmgOffsetV": 20,
  "dmgDisplayTime": 1000,
  "gaugeLength": 180,
  "gaugeSkillLength": 135
}
```

#### `data/game_cfg.js` → `window.XJ_DATA_GAME_CFG`

```javascript
{
  "twistDelay": 500,
  "cameraSpeed": 6,
  "storyBlackColor": "#000000",
  "storyBlackSpeed": 3,
  "systemBoxVMargin": 10,
  "systemBoxHMargin": 10,
  "dialogTextLineSpacing": 2,
  "dialogTextScrollSpeed": 2,
  "autoPathDistance": 50,
  "cameratapeScroll": true,
  "npcMinSteps": 3,
  "npcMaxSteps": 10,
  "npcMinStand": 1000,
  "npcMaxStand": 3000,
  "monsterMinSteps": 1,
  "monsterMaxSteps": 3,
  "monsterMinStand": 500,
  "monsterMaxStand": 2000,
  "monsterMoveSpeed": 10,
  "monsterRefresh": 60000,
  "monsterVision": 50,
  "monsterMoveRadius": 30,
  "monsterChaseRadius": 100,
  "birdVision": 50,
  "paths": {
    "map": "/map/",
    "ant": "/ant/",
    "bin": "/bin/",
    "str": "/str/",
    "mid": "/mid/"
  },
  "configs": {
    "hero": "config_chonglou.str",
    "heroAnim": "chonglou.ant",
    "heroBin": "chonglou.bin",
    "partner1": "config_liyiru.str",
    "partner2": "config_zixuan.str",
    "monsterAnim": "guaiwu.ant"
  }
}
```

#### `data/ants.js` → `window.XJ_DATA_ANTS`

**ANT 格式（100% 破解，75/75 文件验证通过）**：
```
头部:
  偏移  长度   内容
  0     4B     magic: 88 41 4E 54
  4     1B     version (02)
  5     1B     compressed flag (0x00)
  6     2B BE  count_c (帧表数量)

c_table (count_c × 18B):
  [sheet(2B BE), srcX(4B BE), srcY(4B BE), w(4B BE), h(4B BE)]
  sheet: 对应 renwu.bin/chonglou.bin/fight.bin 的图片索引

y_anims:
  count_y(2B BE)
  for each y: frame_count(2B BE) + frame_count × [cIdx(2B), dx(4B), dy(4B), flags(1B)]

at_anims (命名动画):
  count_at(2B BE)
  for each at:
    name(readUTF)
    has_img(readBoolean) + [img_name(readUTF)]
    be_count(readShort)
    for each be:
      frame(2B), baseX(4B), baseY(4B), elapsed(8B), has_data(1B) + [data_name(readUTF)]
      f_events: count(2B) + count × [delta_a(4B), delta_b(4B), dur(4B), extra(4B), has_name(1B) + [name(readUTF)]]
      g_actions: count(2B) + count × [delta_a(4B), delta_b(4B), dur(4B), extra(4B), name(readUTF)]
```

**输出结构**：
```javascript
{
  "chonglou": {
    "version": 2,
    "c": [[sheet, srcX, srcY, w, h], ...],   // 帧表
    "y": [[[cIdx, dx, dy, flags], ...], ...], // 动画序列
    "anims": [                                  // 命名动画
      {"name": "站立上", "img": null, "be": [...]},
      {"name": "走路上", "img": null, "be": [...]},
      ...
    ]
  },
  "npc_6": { ... },
  ...
}
```

**统计**：75 文件, 2532 帧, 1986 动画序列, 1075 命名动画

**关键动画名称**：站立上/下/左/右, 走路上/下/左/右, 飞行上/下/左/右,
出现, 消失, 攻击, 被攻击1/2, 死亡中, 死亡, 闪避, 跳跃, 跑动,
dun(蹲), dao(刀), fuhuo(复活), baozha(爆炸), 冰咒, 火焰, 雷咒, 风咒,
变身出现/消失/攻击/站立/闪避, 仙术释放, 战斗确认/结算/背景/返回/选框,
李忆如, 紫萱, 重楼, 怪物, 万蛊蚀天, 三味真火, 五气连波, 天罡战气, ...

字节序：全部 Big-Endian（Java DataInputStream）
编码：UTF-8
压缩：gzip

---

## 3. 状态 Schema（核心契约）

### `src/state.js` — 游戏全局状态

```javascript
window.XJ_STATE = {
  // 地图与位置
  mapId: 'cs_ljb_1',           // 当前地图ID（maps.js中的key）
  player: {
    x: 320, y: 240,            // 像素坐标
    dir: 'down',               // up|down|left|right
    moving: false
  },
  camera: { x: 200, y: 80 },   // 摄像机偏移

  // 队伍
  party: [
    {
      id: 'chonglou',
      name: '重楼',
      level: 1,
      exp: 0,
      hp: 200, maxhp: 200,
      sp: 9, maxsp: 9,         // 气值
      mp: 20, maxmp: 20,       // 神值
      atk: 100, def: 18,
      spd: 21, lck: 10,
      skills: ['心波', '鬼降', '魔尊真身'],
      spells: ['炎咒', '冰咒'],
      equip: {
        weapon: '木剑',
        armor: '布衣',
        head: '头巾',
        foot: null,            // '无' 表示无
        acc: null
      }
    }
  ],

  // 资源
  money: 300,                  // 金钱
  bag: [],                     // [{name: '止血草', count: 5}, ...]

  // 标记系统
  flags: {
    event: {},                 // 剧情事件: {id: true}
    fee: {},                   // fee系统: {id: true}
    quest: {},                 // 任务: {name: 'active'|'done'}
    trade: {},                 // 商店: {shopId_itemId: true}
    item: {}                   // 道具触发: {itemId: true}
  },

  // 运行时状态（不存档）
  runtime: {
    dialogue: null,            // 当前对话状态
    battle: null,              // 当前战斗状态
    ui: 'map',                 // 当前UI: map|dialog|battle|menu|shop|craft|inventory
    paused: false
  }
};
```

### 存档格式（localStorage key: `xj_save_slot_1`）

```javascript
{
  "version": "1.0",
  "timestamp": 1700000000000,
  "mapId": "cs_ljb_1",
  "player": { "x": 320, "y": 240, "dir": "down" },
  "camera": { "x": 200, "y": 80 },
  "party": [ /* party数组，同state.party */ ],
  "money": 300,
  "bag": [ /* bag数组 */ ],
  "flags": { /* flags对象 */ }
}
```

**不包含**：`runtime` 字段（运行时状态，不持久化）

---

## 4. 系统接口契约

### `window.XJ` — 全局 API 对象

所有系统必须通过 `window.XJ` 暴露统一接口：

```javascript
window.XJ = {
  // 数据访问
  data: {
    items: window.XJ_DATA_ITEMS,
    skills: window.XJ_DATA_SKILLS,
    enemies: window.XJ_DATA_ENEMIES,
    recipes: window.XJ_DATA_RECIPES,
    tasks: window.XJ_DATA_TASKS,
    chars: window.XJ_DATA_CHARS,
    fightCfg: window.XJ_DATA_FIGHT_CFG,
    gameCfg: window.XJ_DATA_GAME_CFG,
    ants: window.XJ_DATA_ANTS,
    maps: window.MAPS,          // 已完成
    npcs: window.NPC_CONFIG,    // 已完成
    talk: window.TALK_SCRIPTS,  // 已完成
    npcSprites: window.NPC_SPRITE_MAP  // 已完成
  },

  // 状态访问
  state: window.XJ_STATE,

  // 存档
  save: function(slot) { /* Agent-S1 */ },
  load: function(slot) { /* Agent-S1 */ },
  hasSave: function(slot) { return false; /* Agent-S1 */ },

  // 物品系统
  addItem: function(name, count) { /* Agent-S2 */ },
  removeItem: function(name, count) { /* Agent-S2 */ },
  hasItem: function(name, count) { return false; /* Agent-S2 */ },
  equip: function(charId, slot, itemName) { /* Agent-S2 */ },
  unequip: function(charId, slot) { /* Agent-S2 */ },
  getEquipBonus: function(charId) { return {}; /* Agent-S2 */ },

  // 战斗系统
  openBattle: function(encounterKey) { /* Agent-S3 */ },
  closeBattle: function() { /* Agent-S3 */ },

  // 商店系统
  openShop: function(npcId) { /* Agent-S4 */ },
  closeShop: function() { /* Agent-S4 */ },

  // 合成系统
  openCraft: function() { /* Agent-S5 */ },
  closeCraft: function() { /* Agent-S5 */ },
  craft: function(recipeIdx) { return false; /* Agent-S5 */ },

  // 任务系统
  setActiveQuest: function(questName) { /* Agent-S6 */ },
  completeQuest: function(questName) { /* Agent-S6 */ },
  isQuestActive: function(questName) { return false; /* Agent-S6 */ },
  isQuestDone: function(questName) { return false; /* Agent-S6 */ },

  // 菜单系统
  openMenu: function(tab) { /* Agent-S7 */ },  // tab: bag|status|equip|skill|quest
  closeMenu: function() { /* Agent-S7 */ },

  // 音频系统
  playBGM: function(midName) { /* Agent-S8 */ },
  stopBGM: function() { /* Agent-S8 */ },

  // 事件标记
  setFlag: function(ns, key, val) { /* 集成者 */ },
  getFlag: function(ns, key) { return undefined; /* 集成者 */ },
};
```

### 初始化顺序（index.html 中的 script 标签顺序）

```html
<!-- 数据层（批次1） -->
<script src="data/bin_index.js"></script>
<script src="data/maps.js"></script>
<script src="data/npc_config.js"></script>
<script src="data/talk_scripts.js"></script>
<script src="data/npc_sprite_map.js"></script>
<script src="data/items.js"></script>
<script src="data/skills.js"></script>
<script src="data/enemies.js"></script>
<script src="data/recipes.js"></script>
<script src="data/tasks.js"></script>
<script src="data/chars.js"></script>
<script src="data/fight_cfg.js"></script>
<script src="data/game_cfg.js"></script>
<script src="data/ants.js"></script>

<!-- 系统层（批次2） -->
<script src="src/state.js"></script>
<script src="src/save.js"></script>
<script src="src/audio.js"></script>
<script src="src/inventory.js"></script>
<script src="src/quest.js"></script>
<script src="src/shop.js"></script>
<script src="src/craft.js"></script>
<script src="src/battle.js"></script>
<script src="src/menu.js"></script>

<!-- 主引擎 -->
<script>
  // index.html 中的游戏引擎代码
</script>
```

### UI 容器规范

所有系统 UI 使用独立的 DOM 容器，通过 CSS class 控制显隐：

```html
<div id="xj-overlay">
  <!-- 每个系统一个面板 -->
  <div id="xj-panel-battle" class="xj-panel hidden">...</div>
  <div id="xj-panel-shop" class="xj-panel hidden">...</div>
  <div id="xj-panel-craft" class="xj-panel hidden">...</div>
  <div id="xj-panel-menu" class="xj-panel hidden">...</div>
  <div id="xj-panel-inventory" class="xj-panel hidden">...</div>
</div>
```

**CSS 规范**：
```css
.xj-panel { position: absolute; inset: 0; z-index: 100; }
.xj-panel.hidden { display: none; }
```

**打开/关闭面板的约定**：
```javascript
function showPanel(id) {
  document.querySelectorAll('.xj-panel').forEach(p => p.classList.add('hidden'));
  document.getElementById('xj-panel-' + id).classList.remove('hidden');
}
```

### 按键映射（不冲突原则）

| 按键 | 功能 | 归属系统 |
|------|------|----------|
| WASD/方向键 | 移动 | 主引擎 |
| Space/E | 交互（NPC/道具） | 主引擎 |
| Esc | 暂停菜单 | menu.js |
| I | 背包 | menu.js |
| B | 战斗记录 | battle.js |
| Tab | 任务列表 | quest.js |
| 1-5 | 技能/仙术 | battle.js |
| 数字键（菜单内） | 选择选项 | 各系统 |

### 对话框文字滚动

已有的 `showDialog(name, text)` 函数是主引擎的。系统层如需弹出对话框，必须通过：
```javascript
window.XJ.dialogue.show(name, text);  // 如果存在
// 或直接调用已有的 showDialog(name, text)
```

---

## 5. 调试与验证

### 每个 agent 的自检清单

1. **语法检查**：`node -c src/xxx.js` 无报错
2. **全局变量**：`window.XJ_DATA_XXX` 或 `window.XJ.XXX` 正确挂载
3. **不引入外部依赖**：纯 vanilla JS，无 CDN
4. **不修改其他文件**：只写自己负责的文件
5. **注释说明**：每个文件头部注明来源和字段说明

### 集成验证（由集成者执行）

```bash
# 1. 检查所有数据文件
for f in data/*.js src/*.js; do
  node -e "new Function(require('fs').readFileSync('$f','utf8'))" && echo "OK: $f" || echo "ERR: $f"
done

# 2. 检查全局变量
node -e "
const fs = require('fs');
const w = {};
for (const f of fs.readdirSync('data').filter(f=>f.endsWith('.js'))) {
  eval(fs.readFileSync('data/'+f,'utf8').replace(/window\./g,'w.'));
}
console.log('Global vars:', Object.keys(w));
"

# 3. HTTP 服务器
python3 -m http.server 8765 --directory ~/桌面/仙剑忘情-地图复刻 &
```

---

## 6. 禁止事项

| 禁止 | 原因 |
|------|------|
| 修改 `index.html` | 集成者统一管理 |
| 修改 `CONTRACT.md` | 契约变更需集成者审核 |
| 修改标记 ✅ 的已完成文件 | 已完成，避免回归 |
| 引入 npm 依赖 | 零依赖原则 |
| 引入 CDN | 离线运行原则 |
| 使用 `fetch()` 加载本地文件 | 用 `<script>` 标签或 XHR 绝对路径 |
| 在 `src/` 中解析原始二进制 | 数据层（`data/`）负责解析，系统层只读数据 |
| 直接操作 Canvas | 只有 `index.html` 主引擎操作 Canvas |
| 定义重复的全局函数名 | 所有函数挂在 `window.XJ` 下 |

---

## 7. 变更日志

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-10-04 | 初始契约：数据格式、state schema、系统接口、UI规范 |
