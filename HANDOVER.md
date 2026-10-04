# 仙剑奇侠传-忘情篇 项目交接文档

## 1. 项目背景与目标

### 原始游戏
- **游戏名称**: 仙剑奇侠传-忘情篇 (2002年)
- **游戏类型**: 中文RPG，回合制战斗，探索式地图
- **原始引擎**: 自有引擎，资源文件格式为MAP/BIN/MID等专有格式

### 逆向工程目标
1. 解包游戏资源，理解文件格式
2. 解析地图、角色、战斗、物品等数据
3. 用现代技术复刻游戏引擎

### 最终目标
创建可玩的游戏复刻版，支持Web平台运行。

---

## 2. 已完成工作

### 2.1 逆向工程阶段

**解包产物** (`1-解包产物/`):
- `MAP/` - 69个地图文件 (.map.bin)
- `BIN/` - 精灵动画文件 (.ant.bin, .ms.bin, .tile.bin)
- `MID/` - MIDI音乐文件
- `配置/` - 技能、物品、敌人等配置文本

**核心发现**:
- **MAP格式**: `88 4D 41 50` magic头 + 16字节header + UTF-8脚本
- **脚本命令**: `world.setName()`, `world.change()`, `npc.setPosition()`, `dialogBox.setText()`
- **传送门**: `world.change(target_map, tile, anim, sprite, x, y, direction)`
- **遭遇表**: `地图名 = ID范围,数量,等级范围,背景,音乐`

**解析工具** (`2-工具/`):
- Python脚本用于解析MAP、BIN、配置文件
- 数据提取到 `3-数据/` 目录

### 2.2 Python复刻引擎

**位置**: `5-复刻引擎/*.py` (7个文件，约2500行)

**模块结构**:
```
config_parser.py  - 解析技能、物品、敌人配置
map_parser.py     - 解析MAP脚本，提取地图/NPC/传送门
combat.py         - 回合制战斗系统
engine.py         - 游戏状态机
renderer.py       - 终端渲染
game.py           - 主入口
png_decoder.py    - BIN图片解码
```

**已实现功能**:
- 69张地图加载与导航
- 27个技能（含完整伤害公式）
- 59个敌人模板，32个地图遭遇配置
- 90+物品（含11种药品效果）
- 回合制战斗（攻击/技能/物品/逃跑）
- 角色升级系统（HP/SP/WP/DP公式）
- NPC对话系统

### 2.3 Web复刻版

**位置**: `5-复刻引擎/web/index.html` (31KB单文件)

**特点**:
- 纯前端实现，零外部依赖
- 所有游戏数据嵌入HTML
- Canvas 2D渲染 + requestAnimationFrame循环
- 状态机驱动 (title/explore/dialog/combat/help/menu/gameover)

**游戏系统**:
1. **探索系统**: WASD/方向键移动，碰撞检测，NPC交互，传送门切换
2. **战斗系统**: 回合制，攻击/技能/物品/逃跑，伤害公式eval解析
3. **升级系统**: HP=200+46*lv, SP=8+lv, WP=100+26*lv, DP=18+4*lv
4. **物品系统**: 止血草(HP+400)、鼠儿果(SP+30)、蜂王蜜(HP+1000,SP+100)
5. **对话系统**: 点击NPC触发对话框

### 2.4 Git提交历史

```
99e58e1 补全全部69张地图数据至Web版
da67d26 修复Web版HTML结构：添加DOCTYPE和canvas容器
3c5561a 完成Web复刻版：全部游戏数据嵌入单HTML文件
d5afb13 初始化项目：逆向工程文档与Python复刻引擎
```

---

## 3. 技术架构

### 3.1 游戏数据流

```
原始MAP文件 (.map.bin)
    ↓
解析脚本命令
    ↓
提取: 地图名、NPC坐标、传送门目标、音乐标记
    ↓
嵌入Web版 JS常量 (MAPS_DATA)
    ↓
游戏运行时: 按地图ID加载数据，导航切换
```

### 3.2 战斗系统公式

**伤害计算** (eval解析power_expr):
- 鬼降: `(atk*8)/10`
- 冰咒: `(atk*(5+5*slv))/30`
- 炎咒: `(atk*(10+6*slv))/20`
- 雷咒: `(atk*(10+6*slv))/20`

**角色属性** (按等级):
- HP: 200 + 46 * lv
- SP: 8 + lv
- WP: 100 + 26 * lv
- DP: 18 + 4 * lv

### 3.3 地图切换逻辑

```javascript
// 脚本中的传送门
world.change("cs_sz_2", "tile.bin", "anim.bin", "sprite.bin", 30, 205, "right")
// target_map, tile, anim, sprite, spawn_x, spawn_y, direction

// Web版处理
player.x = transition.x;
player.y = transition.y;
currentMap = transition.target;
```

---

## 4. 如何运行

### 4.1 Web版（推荐）

```bash
# 方式1: 本地服务器
cd /mnt/shared/仙剑奇侠传忘情篇-逆向工程/5-复刻引擎/web
python3 -m http.server 8765
# 浏览器打开 http://localhost:8765/index.html

# 方式2: 直接打开文件
xdg-open /mnt/shared/仙剑奇侠传忘情篇-逆向工程/5-复刻引擎/web/index.html
```

**操作**:
- WASD/方向键: 移动
- E: 与NPC交互
- H: 帮助
- M: 菜单/状态
- 战斗中: 1-攻击, 2-技能, 3-物品, 4-逃跑
- ESC: 返回标题

### 4.2 Python CLI版

```bash
cd /mnt/shared/仙剑奇侠传忘情篇-逆向工程/5-复刻引擎
python3 game.py
```

---

## 5. 可选扩展方向

### 5.1 视觉增强
- **ANT动画解码**: 当前使用静态符号(@,<,>,▲)，可解码chonglou.ant.bin实现精灵动画
- **地图视觉**: 解码ms.bin/tile数据显示地形图块
- **精灵图**: 解析sprite.bin获取角色/敌人图片

### 5.2 音频系统
- **MIDI音乐**: 解包.mid文件，用Web Audio API播放
- **音效**: 战斗、升级、传送等音效

### 5.3 剧情系统
- **对话扩展**: 解析script.openScriptList()和eventMarked条件
- **任务系统**: 追踪主线/支线任务
- **存档系统**: localStorage存储进度

### 5.4 数据完善
- 补充更多NPC对话内容
- 添加更多技能描述
- 完善敌人AI行为

---

## 6. 文件结构总览

```
/mnt/shared/仙剑奇侠传忘情篇-逆向工程/
├── 0-原始素材/          # 游戏原始文件（未提交到git）
├── 1-解包产物/          # 解包后的资源（未提交）
│   ├── MAP/            # 69个.map.bin
│   ├── BIN/            # 动画/精灵文件
│   ├── MID/            # 音乐文件
│   └── 配置/           # 技能/物品/敌人配置
├── 2-工具/             # 解析脚本（未提交）
├── 3-数据/             # 提取的数据（未提交）
├── 4-文档/             # 引擎工程文档
├── 5-复刻引擎/         # 【核心】
│   ├── *.py            # Python复刻引擎（7个文件）
│   └── web/
│       └── index.html  # Web复刻版（31KB单文件）
├── .gitignore          # 忽略原始素材/解包产物
└── .git/               # Git仓库（4次提交）
```

---

## 7. 关键代码参考

### 7.1 Web版核心结构

```javascript
// 数据常量
const SKILLS_DATA = [...];       // 27个技能
const HEAL_ITEMS_DATA = [...];   // 11种药品
const ENEMY_TEMPLATES = [...];   // 59个敌人
const ENCOUNTERS = {...};        // 32个地图遭遇
const MAPS_DATA = [...];         // 69张地图（动态生成）

// 游戏状态
const game = {
  phase: 'title',
  player: {x, y, hp, sp, wp, dp, lv, gold, items, skills},
  currentMap: 'cs_ljb_1',
  enemies: [],
  combatLog: []
};

// 核心函数
initGame()          // 初始化
movePlayer(dx, dy)  // 玩家移动
startCombat()       // 遭遇敌人
playerAttack()      // 攻击
playerSkill()       // 技能
playerItem()        // 物品
checkCombatResult() // 战斗结算
renderTitle()       // 标题画面
renderExplore()     // 探索画面
renderCombat()      // 战斗画面
handleKey(e)        // 按键处理
```

### 7.2 地图数据示例

```javascript
{
  id: "cs_ljb_1",
  name: "罗家堡",
  music: "syc",
  npcs: [{id: 31, x: 609, y: 435}],
  transitions: [
    {target: "cs_sz_2", x: 30, y: 205},
    {target: "cs_ljb_2", x: 420, y: 773}
  ]
}
```

---

## 8. 给接手者

### 8.1 快速开始
1. 浏览本文档了解项目全貌
2. 运行Web版游戏体验完整功能
3. 阅读 `4-文档/引擎工程文档.md` 了解架构设计
4. 检查 `5-复刻引擎/README.md` 了解Python引擎细节

### 8.2 常见问题
- **Web版打不开**: 确保浏览器支持ES6+和Canvas 2D
- **地图切换失败**: 检查MAPS_DATA中transitions配置
- **技能不生效**: 检查SKILLS_DATA中power_expr公式
- **敌人不出现**: 检查ENCOUNTERS中地图名匹配

### 8.3 修改建议
- 修改游戏数据直接编辑HTML中的JS常量
- 修改战斗公式在 `playerSkill()` 函数中调整
- 添加新地图在MAPS_DATA生成函数中添加
- 添加新技能在SKILLS_DATA数组中添加

### 8.4 联系信息
如有问题，请检查:
- `4-文档/引擎工程文档.md` - 详细架构文档
- `5-复刻引擎/README.md` - Python引擎说明
- Git历史中的commit message

---

## 9. 许可证声明

本项目为逆向工程学习用途，不用于商业分发。
原游戏版权归属大宇资讯/Softstar。
