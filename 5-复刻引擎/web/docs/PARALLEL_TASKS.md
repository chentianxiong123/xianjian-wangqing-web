# 仙剑忘情篇 Web 复刻 — 并行任务清单

> **开工前必读**：`CONTRACT.md`（接口契约，所有 agent 的强制规范）

---

## 任务依赖图

```
批次1（数据解析，完全并行，无依赖）
  ┌─ D1: items.js        ← config_item.str (90物品)
  ├─ D2: skills.js       ← config_skill.str (28技能)
  ├─ D3: enemies.js      ← enemy.str (33遭遇) + fight_*.str
  ├─ D4: recipes.js      ← config_make.str (19配方)
  │  + tasks.js          ← task.str (46任务)
  ├─ D5: chars.js        ← config_chonglou/liyiru/zixuan.str
  │  + fight_cfg.js      ← config_fight.str
  │  + game_cfg.js       ← config_game.str
  └─ D6: ants.js         ← ant/*.ant (帧动画逆向)
                    │
                    ▼
        集成者：定义 state.js + 更新 index.html script 标签
                    │
                    ▼
批次2（系统实现，依赖批次1数据 + state.js，彼此可并行）
  ┌─ S1: save.js         ← 存档系统
  ├─ S2: inventory.js    ← 背包系统
  ├─ S3: battle.js       ← 战斗系统
  ├─ S4: shop.js         ← 商店系统
  ├─ S5: craft.js        ← 合成系统
  ├─ S6: quest.js        ← 任务系统
  ├─ S7: menu.js         ← 菜单系统
  └─ S8: audio.js        ← 音频系统
                    │
                    ▼
        集成者：最终集成到 index.html，全量测试
```

---

## 批次1：数据解析（6个 agent 并行）

### Agent-D1：物品数据解析

**输入**：`/mnt/shared/仙剑奇侠传忘情篇-逆向工程/1-解包产物/解包树/str/config_item.str`
**输出**：`~/桌面/仙剑忘情-地图复刻/data/items.js`

**Prompt**：
```
你是一个 J2ME 游戏逆向工程的 agent。请完成以下任务：

1. 先读 CONTRACT.md（~/桌面/仙剑忘情-地图复刻/CONTRACT.md），遵守所有规范
2. 解析 str/config_item.str 文件（gzip压缩的 STR 格式二进制）
3. 用 Python 脚本提取 90 条物品数据，字段用 # 分隔
4. 字段顺序（15字段）：
   name#type#level#owner#atk#def#spd#lck#maxhp#maxsp#maxmp#regen#price#quality#desc
5. 物品类型9种：武器|服饰|头饰|足饰|饰品|药品|材料|任务|特殊
6. 输出 data/items.js，挂载到 window.XJ_DATA_ITEMS
7. Schema 见 CONTRACT.md 第2.3节

STR 解析标准函数（所有 agent 复用）：
  gzip.decompress → 验证 magic b'\x88STR\x06\x00' → 1B count → 循环: skip 0x00, 1B flen, flen bytes UTF-8

只写 data/items.js，不修改任何其他文件。
完成后运行 node -c data/items.js 验证语法。
```

### Agent-D2：技能数据解析

**输入**：`config_skill.str`
**输出**：`data/skills.js` → `window.XJ_DATA_SKILLS`

**Prompt**：
```
同 D1 规范。解析 config_skill.str（28条，12字段，#分隔）。
字段顺序：type#attackType#name#animation#multi#spCost#hpCost#mpCost#hit#crit#formula#desc
注意：第0条是表头（"技能类型#攻击类型#名字#..."），从 idx=1 开始是真实技能。
formula 字段是 JS 表达式字符串（如 "(atk*8)/10"），直接 eval 即可。
输出 data/skills.js → window.XJ_DATA_SKILLS。
```

### Agent-D3：敌人/遭遇数据解析

**输入**：`enemy.str` + `fight_0.str` ~ `fight_14.str` + `fight_egui.str`
**输出**：`data/enemies.js` → `window.XJ_DATA_ENEMIES`

**Prompt**：
```
同 D1 规范。解析 enemy.str（33条，格式：地图名=id范围,种类,事件?等级范围:失败等级,背景,音乐）
注意：第0条是表头。

另外解析 fight_0.str ~ fight_14.str、fight_egui.str，这些是每场战斗的敌人配置。
先 gzip.decompress 看内容，理解格式后提取敌人模板（HP/ATK/DEF/SPD/经验/金钱/掉落等）。

输出 data/enemies.js → window.XJ_DATA_ENEMIES，包含：
- encounters: 地图遭遇表
- enemyTemplates: 敌人属性模板

如果 fight_*.str 格式与 STR 标准不同（可能是 TALK 格式，2B长度），先 hexdump 分析。
```

### Agent-D4：配方+任务数据解析

**输入**：`config_make.str` + `task.str`
**输出**：`data/recipes.js` + `data/tasks.js`

**Prompt**：
```
同 D1 规范。解析两个文件：

1. config_make.str（19条配方，格式：结果,材料1(数量)|材料2(数量),描述）
   输出 data/recipes.js → window.XJ_DATA_RECIPES

2. task.str（46条任务，格式：任务名 = 任务描述）
   输出 data/tasks.js → window.XJ_DATA_TASKS
```

### Agent-D5：角色+战斗配置解析

**输入**：`config_chonglou.str` + `config_liyiru.str` + `config_zixuan.str` + `config_fight.str` + `config_game.str`
**输出**：`data/chars.js` + `data/fight_cfg.js` + `data/game_cfg.js`

**Prompt**：
```
同 D1 规范。解析5个文件：

1. config_chonglou.str（主角重楼配置，key = value 格式）
   输出 data/chars.js → window.XJ_DATA_CHARS.chonglou
   注意：公式字段（如 maxhp = "200+46*lv"）保留为字符串，运行时 eval

2. config_liyiru.str（李忆如配置）→ XJ_DATA_CHARS.liyiru
3. config_zixuan.str（紫萱配置）→ XJ_DATA_CHARS.zixuan

4. config_fight.str（23条战斗配置，key = value 格式）
   输出 data/fight_cfg.js → window.XJ_DATA_FIGHT_CFG

5. config_game.str（游戏全局配置，key = value 格式）
   输出 data/game_cfg.js → window.XJ_DATA_GAME_CFG
```

### Agent-D6：ANT 帧动画逆向

**输入**：`ant/*.ant`（75个文件，gzip压缩）
**输出**：`data/ants.js` → `window.XJ_DATA_ANTS`

**Prompt**：
```
同 D1 规范。逆向 ANT 帧动画格式。

已知信息（CONTRACT.md 第2.3节）：
- magic: 88 41 4E 54 (4B)
- version: 02 00 (2B)
- count: 2B BE
- 然后是 count 条 4B 记录
- 每条记录: (byte0, byte1, byte2, byte3)
  - byte0: 通常是 0
  - byte1: 帧索引或图片索引
  - byte2: 通常是 0
  - byte3: 偏移量

需要确认：
1. 每条记录的4个字节的精确含义
2. 如何映射到 renwu.bin / chonglou.bin / fight.bin 中的 PNG
3. 帧的裁剪矩形（x, y, w, h）

方法：
- 对比 ANT 的 count 与对应 BIN 的 PNG 数量
  （如 chonglou.ant count=19, chonglou.bin 只有1张PNG → 19帧来自1张sprite sheet）
- 用 PIL 读取 PNG 尺寸，推断每帧宽高
- hexdump 多个 ANT 文件，找模式

先解析 chonglou.ant（主角，最重要），然后扩展到 npc_*.ant 和 fight_*.ant。

输出 data/ants.js → window.XJ_DATA_ANTS，每个 ANT 文件的帧数据。
如果格式无法100%确认，输出已知部分 + TODO 标记。
```

---

## 批次2：系统实现（8个 agent 并行）

> **前置条件**：批次1全部完成 + 集成者已创建 `src/state.js` + 更新 `index.html` script 标签

### Agent-S1：存档系统

**输入**：`CONTRACT.md`（state schema）
**输出**：`src/save.js`

**Prompt**：
```
先读 CONTRACT.md，遵守所有规范。

实现存档系统 src/save.js：
1. window.XJ.save(slot) — 序列化 XJ_STATE（不含 runtime），存入 localStorage
2. window.XJ.load(slot) — 从 localStorage 读取，恢复 XJ_STATE
3. window.XJ.hasSave(slot) — 检查存档是否存在
4. 自动存档：window.onbeforeunload 时自动保存到 slot 0
5. 支持3个存档槽（slot 1/2/3）+ 1个自动存档（slot 0）

localStorage key: xj_save_slot_<N>
存档格式见 CONTRACT.md 第3节。

只写 src/save.js，不修改其他文件。
```

### Agent-S2：背包/装备系统

**输入**：`data/items.js` + `data/chars.js` + `CONTRACT.md`
**输出**：`src/inventory.js`

**Prompt**：
```
先读 CONTRACT.md，遵守所有规范。

实现背包系统 src/inventory.js：
1. window.XJ.addItem(name, count) — 添加物品到 bag
2. window.XJ.removeItem(name, count) — 移除物品，返回是否成功
3. window.XJ.hasItem(name, count) — 检查是否有足够数量
4. window.XJ.getBag() — 返回 bag 数组
5. window.XJ.equip(charId, slot, itemName) — 装备物品
   slot: weapon|armor|head|foot|acc
   检查：等级要求、职业限制（owner字段）
   装备后从 bag 移除，旧装备放回 bag
6. window.XJ.unequip(charId, slot) — 卸下装备
7. window.XJ.getEquipBonus(charId) — 计算装备总属性加成
   遍历5个装备槽，累加 atk/def/spd/lck/maxhp/maxsp/maxmp

物品属性从 window.XJ_DATA_ITEMS.items[name] 读取。
角色属性从 window.XJ_DATA_CHARS[charId] 读取。

只写 src/inventory.js，不修改其他文件。
```

### Agent-S3：战斗系统

**输入**：`data/enemies.js` + `data/skills.js` + `data/fight_cfg.js` + `data/ants.js` + `CONTRACT.md`
**输出**：`src/battle.js`

**Prompt**：
```
先读 CONTRACT.md，遵守所有规范。

实现回合制战斗系统 src/battle.js：
1. window.XJ.openBattle(encounterKey) — 根据地图遭遇表启动战斗
   - 从 XJ_DATA_ENEMIES.encounters[encounterKey] 读取敌人ID范围
   - 从 XJ_DATA_ENEMIES.enemyTemplates 读取敌人属性
   - 用 XJ_DATA_FIGHT_CFG 的坐标放置角色和敌人
2. 战斗循环：速度条决定行动顺序
   - 速度条长度 = fightCfg.gaugeLength (180)
   - 技能消耗 = fightCfg.gaugeSkillLength (135)
3. 技能伤害：eval(formula)，formula 从 XJ_DATA_SKILLS 读取
4. 胜利：获得经验和金钱，可能掉落物品
5. 失败：Game Over，回到标题或自动复活
6. 渲染：在 xj-panel-battle 容器中用 DOM 绘制
   - 战斗背景用 fight_*.bin 的 PNG
   - 角色/敌人用对应 ANT 动画的第一帧
7. 操作：1-5键选技能，方向键选目标，Enter确认

UI 容器：<div id="xj-panel-battle" class="xj-panel hidden">
只写 src/battle.js，不修改其他文件。
```

### Agent-S4：商店系统

**输入**：`data/items.js` + `CONTRACT.md`
**输出**：`src/shop.js`

**Prompt**：
```
先读 CONTRACT.md，遵守所有规范。

实现商店系统 src/shop.js：
1. window.XJ.openShop(npcId) — 根据 NPC ID 决定商店类型
   - NPC 56/54: 道具商人（卖药品/材料）
   - NPC 57/58: 蜀山商人（卖装备）
   - NPC 59: 铁匠（卖武器+修理）
2. 购买：扣金钱，加物品到 bag
3. 出售：移除 bag 物品，加金钱（售价的50%）
4. UI：商品列表（名字+价格+描述），点击购买
5. 金钱显示在右上角
6. 不够钱时提示"金钱不足"

物品价格从 XJ_DATA_ITEMS.items[name].price 读取。
UI 容器：<div id="xj-panel-shop" class="xj-panel hidden">
只写 src/shop.js，不修改其他文件。
```

### Agent-S5：合成系统

**输入**：`data/recipes.js` + `CONTRACT.md`
**输出**：`src/craft.js`

**Prompt**：
```
先读 CONTRACT.md，遵守所有规范。

实现合成系统 src/craft.js：
1. window.XJ.openCraft() — 打开合成界面
2. 显示所有配方：结果物品 + 需要材料（高亮已有的/灰显缺少的）
3. window.XJ.craft(recipeIdx) — 合成
   检查材料是否齐全，消耗材料，添加结果物品到 bag
4. 合成后刷新列表
5. UI：配方列表，每个配方显示材料和结果

配方从 XJ_DATA_RECIPES.recipes 读取。
UI 容器：<div id="xj-panel-craft" class="xj-panel hidden">
只写 src/craft.js，不修改其他文件。
```

### Agent-S6：任务系统

**输入**：`data/tasks.js` + `CONTRACT.md`
**输出**：`src/quest.js`

**Prompt**：
```
先读 CONTRACT.md，遵守所有规范。

实现任务系统 src/quest.js：
1. window.XJ.setActiveQuest(questName) — 设置当前活跃任务
2. window.XJ.completeQuest(questName) — 标记任务完成
3. window.XJ.isQuestActive(name) — 检查是否活跃
4. window.XJ.isQuestDone(name) — 检查是否完成
5. 任务追踪UI：Tab键打开，显示当前任务名+描述
6. 任务进度持久化到 XJ_STATE.flags.quest

任务从 XJ_DATA_TASKS.tasks 读取。
UI 容器：<div id="xj-panel-quest" class="xj-panel hidden">（或浮动小窗口）
只写 src/quest.js，不修改其他文件。
```

### Agent-S7：菜单系统

**输入**：所有数据 + `CONTRACT.md`
**输出**：`src/menu.js`

**Prompt**：
```
先读 CONTRACT.md，遵守所有规范。

实现菜单系统 src/menu.js：
1. window.XJ.openMenu(tab) — 打开菜单
   tab: bag|status|equip|skill|quest|save
2. Esc键打开/关闭菜单
3. I键快速打开背包
4. 菜单布局：左侧标签栏 + 右侧内容区
5. 背包页：物品列表（图标+名字+数量），可使用药品
6. 状态页：角色属性（HP/SP/MP/ATK/DEF/SPD/LCK/等级/经验）
7. 装备页：5个装备槽，点击装备槽选物品
8. 技能页：已学技能列表
9. 任务页：调用 quest.js 的显示
10. 存档页：3个存档槽+读取按钮

UI 容器：<div id="xj-panel-menu" class="xj-panel hidden">
图标用 data/tiles/ui/ 的 PNG。
只写 src/menu.js，不修改其他文件。
```

### Agent-S8：音频系统

**输入**：`mid/*.mid`（10个MIDI文件）
**输出**：`src/audio.js` + `mid/` 目录

**Prompt**：
```
先读 CONTRACT.md，遵守所有规范。

实现音频系统 src/audio.js：
1. 提取 JAR 中的 mid/ 目录到 ~/桌面/仙剑忘情-地图复刻/mid/
2. window.XJ.playBGM(midName) — 播放 MIDI 背景音乐
3. window.XJ.stopBGM() — 停止
4. 音量控制
5. 切换地图时自动切换 BGM（地图名→MIDI名映射）

注意：浏览器原生不支持 MIDI 播放。方案：
- 方案A：用 Web Audio API 解析 MIDI 并用 oscillator 合成
- 方案B：转为其他格式（但会增加依赖，不推荐）
- 方案C：用 <audio> 标签（需要先转 wav/mp3）

推荐方案A：写一个简单的 MIDI 解析器，用 Web Audio 的 OscillatorNode 播放音符。
如果太复杂，先实现 playBGM 的接口桩（空函数+TODO），不阻塞其他系统。

只写 src/audio.js，不修改其他文件。
```

---

## 集成者（你）的工作

### 批次1完成后

1. 检查所有 `data/*.js` 语法
2. 创建 `src/state.js`（定义 XJ_STATE 和 XJ 对象骨架）
3. 更新 `index.html`，在 `<head>` 中按顺序引入所有 script 标签
4. 在 `index.html` 中添加 UI 容器 DOM：
   ```html
   <div id="xj-overlay">
     <div id="xj-panel-battle" class="xj-panel hidden"></div>
     <div id="xj-panel-shop" class="xj-panel hidden"></div>
     <div id="xj-panel-craft" class="xj-panel hidden"></div>
     <div id="xj-panel-menu" class="xj-panel hidden"></div>
     <div id="xj-panel-quest" class="xj-panel hidden"></div>
   </div>
   ```

### 批次2完成后

1. 检查所有 `src/*.js` 语法
2. 逐一测试每个系统功能
3. 修复集成冲突（全局变量名、DOM ID、按键冲突）
4. 端到端测试：移动→触发对话→购买物品→进入战斗→合成→存档→读档

---

## 进度追踪表

| Agent | 任务 | 状态 | 文件 | 备注 |
|-------|------|------|------|------|
| D1 | items.js | ✅ 完成 | data/items.js | 90物品 |
| D2 | skills.js | ✅ 完成 | data/skills.js | 28技能 |
| D3 | enemies.js | ✅ 完成 | data/enemies.js | 33遭遇+10敌人模板 |
| D4 | recipes.js + tasks.js | ✅ 完成 | data/recipes.js, data/tasks.js | 19配方+46任务 |
| D5 | chars.js + fight_cfg.js + game_cfg.js | ✅ 完成 | data/chars.js 等 | 3角色+战斗+游戏配置 |
| D6 | ants.js | ✅ 完成 | data/ants.js | 75文件/2532帧/1986动画序列/1075命名动画 |
| — | 集成：state.js + index.html | ✅ 完成 | src/state.js, index.html | 批次1→批次2 桥梁 |
| S1 | save.js | ✅ 完成 | src/save.js | 存档系统 |
| S2 | inventory.js | ✅ 完成 | src/inventory.js | 背包/装备 |
| S3 | battle.js | ✅ 完成 | src/battle.js | 回合制战斗 |
| S4 | shop.js | ✅ 完成 | src/shop.js | 商店 |
| S5 | craft.js | ✅ 完成 | src/craft.js | 合成 |
| S6 | quest.js | ✅ 完成 | src/quest.js | 任务追踪 |
| S7 | menu.js | ✅ 完成 | src/menu.js | 菜单/背包/状态 |
| S8 | audio.js | ✅ 完成 | src/audio.js | MIDI音乐 |
| — | **总集成验证** | ✅ 完成 | — | 25/25 JS文件语法通过+HTTP 200 |
