# 仙剑奇侠传-忘情篇 逆向工程 · 交接文档

> **最后更新**: 2026-10-05（十二：暂停语义+碰撞盒+数据字段总表，见下文）
> **仓库**: `/mnt/shared/仙剑奇侠传忘情篇-逆向工程/`
> **Git**: working tree 见 git log
> **测试**: 13 套 node 测试 476 项全通过；90-校验.py 31 项 0 错（1 WARN 为原版缺失对话文件）

---

## 一、项目目标

完整复刻 2002 年 J2ME 游戏《仙剑奇侠传-忘情篇》，在 Web 上跑起来能玩。

---

## 二、当前目录结构

```
/mnt/shared/仙剑奇侠传忘情篇-逆向工程/
├── 0-原始素材/              # 原始 jar / 资源文件
├── 1-解包产物/              # ★ 解包后的原始资源
│   ├── 解包树/
│   │   ├── map/             #   69 个 .map (gzip)
│   │   ├── ant/             #   75 个 .ant (gzip) — 动画定义
│   │   ├── bin/             #   多个 .bin (gzip) — 精灵图数据
│   │   ├── str/             #  101 个 .str (gzip) — 脚本/配置/对话
│   │   ├── mid/             #  MIDI 音乐
│   │   └── ...
│   ├── 类文件/              #   74 个 .class — ★★★ 未反编译的 Java 字节码
│   ├── 剧本-解码/
│   ├── 剧本-条目/
│   ├── 图片/
│   └── 音乐/
├── 2-工具/                  # Python 解析脚本
├── 3-数据/                  # 中间提取数据
├── 4-文档/                  # 文档
├── 5-复刻引擎/              # ★ 最终产物
│   ├── *.py                 # Python CLI 版（过时，忽略）
│   └── web/                 # ★★ Web 复刻版（当前重点）
│       ├── index.html       #   主文件（渲染循环 + 地图 + NPC）
│       ├── src/             #   10 个 JS 模块 (state/battle/audio/...)
│       ├── data/            #   16 个 JS 数据文件
│       │   ├── ants.js      #     75 个 ANT 文件的 hex 数据
│       │   ├── npc_config.js#     ★ 只有 50 个 NPC 配置（不完整）
│       │   ├── npc_sprite_map.js # ★ 只有 49 个 NPC→立绘映射（不完整）
│       │   ├── maps.js
│       │   └── ...
│       ├── data/tiles/      #  392 张 PNG 精灵图
│       └── mid/             #  10 首 MIDI
└── HANDOVER.md              # ← 本文件
```

---

## 三、已解决了什么

| 模块 | 状态 | 说明 |
|------|------|------|
| 文件解包 | ✅ 完成 | jar 解包，gzip 去压，分类到解包树 |
| MAP 格式 | ✅ 完成 | magic `88 4D 41 50` + header + UTF-8 脚本 |
| STR 格式 | ✅ 完成 | gzip → magic `88 53 54 52` + UTF-8 key=value |
| 瓦片图提取 | ✅ 完成 | 392 张 PNG 已导出到 web/data/tiles/ |
| 地图渲染 | ✅ 完成 | Canvas 渲染 16x16 地砖，camera 跟随 |
| 玩家移动 | ✅ 完成 | WASD/方向键，碰撞检测，传送门切换 |
| 战斗系统 | ✅ 完成 | 回合制，攻击/技能/物品/逃跑 |
| 升级系统 | ✅ 完成 | HP/SP/WP/DP 公式 |
| 音频系统 | ✅ 完成 | MIDI → WebAudio 合成 |
| 存档系统 | ✅ 完成 | localStorage |

---

## 四、❌ 没解决的问题（核心痛点）

### 问题 1：角色渲染是错的 ★★★

**现象**: 角色不是"拼好的完整人物"，而是一堆碎纹理乱移。

**根因**: ANT 动画文件我只解析了 section 1（c_table 裁剪表），没解析 section 2（动画帧序列）和 section 3（命名状态）。角色动画需要：
1. c_table 定义每个帧的裁剪区域 ← 已解析
2. 动画序列定义哪些帧按什么顺序播放 ← **未解析**
3. 命名状态（stand/walk_up/walk_down 等）映射到序列 ← **未解析**

**当前权宜之计**: drawNpcs() 直接画 renwu.bin 独立立绘（整张 PNG），drawPlayer() 画 chonglou 缩放图。能显示但没动画。

**ANT 格式已知部分**:
```
Header (8B): 88 41 4E 54 [magic] + 02 00 [ver LE] + 00 13 [count BE]
Section 1: count × 10B, 每行 = 5×uint16 BE (sheet, srcX, srcY, w, h)
Section 2: 变长，含动画帧序列 + UTF-8 状态名 ← 未解析
Section 3: 变长，命名动画状态 ← 未解析
```

---

### 问题 2：NPC 数据大量缺失 ★★★

**现象**: 地图 cs_ljb_1 上 49 个 NPC，只有 2 个有配置，其余显示黄方块。

**地图上出现的 NPC ID**: 18, 40, 41, 42, 71, 86, 87, 88, 94, 126, 128, 138, 140

**npc_config.js 只覆盖**: NPC 2-23, 29, 50-66, 138, 140（约 50 个）

**npc_sprite_map.js 只覆盖**: 同上范围（约 49 个）

**根因**: 我只从 `talk_*.str` 提取了 NPC 名字和对话，没从别的地方提取完整 NPC 定义。地图上的 NPC 18/40/41/42/71/86/87/88/94 等在 talk_*.str 里没有对应文件。

---

### 问题 3：Java class 文件完全没反编译 ★★★

**现象**: `1-解包产物/类文件/` 有 74 个 .class 文件，全是混淆后的单字母类名（a.class ~ z.class + aa.class ~ bx.class）。

**这是最大的数据金矿**: 游戏引擎的 NPC 配置、地图加载逻辑、动画播放逻辑、事件系统全在字节码里。我没碰。

**系统上有的工具**: JDK 21 (`javap` 可用，可看方法签名但看不到方法体逻辑)，但**没有 CFR/procyon/jadx 等反编译器**。

**需要**: 安装反编译器，反编译全部 74 个 class，从中提取：
- NPC 完整定义（ID → 名字/动画/立绘/行为）
- ANT section 2/3 的解析逻辑
- 事件系统（eventMarked 条件分支）
- 地图 NPC 布局逻辑

---

### 问题 4：剧情脚本只解了一半

**现象**: 101 个 .str 文件，我只解析了 30 个 talk_*.str，提取了对话文本。还有很多 .str 是：
- `config_*.str` — 角色配置（重楼/月如/紫萱）
- `config_game.str` — 全局游戏配置
- `config_item.str` — 物品定义
- `config_skill.str` — 技能定义
- 数字命名的 .str（如 `9.str`, `55.str`）— 用途不明

**脚本格式**:
```
.gz → 解压 → magic 88 53 54 52 + ver + length(2B LE) + UTF-8 文本
文本格式: key = value (用 \x00\x10 分隔条目)
脚本格式: eventMarked(N),!eventMarked(M)#script.openScriptList(); ... script.closeScriptList();
```

**对话脚本示例** (talk_6.str):
```
eventMarked(9),eventMarked(8)#script.openScriptList();
player.setState(stand);
npc.setAiEnabled(1,false);
npc.setSequence(1,stand_up)[player.dir==down];
dialogBox.setText(/王大虎/:这位少侠也是来打听消消息的吧。);
dialogBox.showDialog();
script.break();
...
game.markEvent(9);
script.closeScriptList();
```

---

### 问题 5：工作流效率低

**我做错了什么**:
- 手动逐字节猜二进制格式，没先反编译 Java 看原始逻辑
- 每个 ANT 文件手动检查，没写批量解析脚本
- 改代码靠试错（改一次 → 开浏览器截图 → 再改），没建立自动化验证
- 中间产物散落（test_a/, test_output/, test_output2/）

---

## 五、关键文件位置速查

| 要找什么 | 去哪看 |
|----------|--------|
| 原始 ANT 文件 | `1-解包产物/解包树/ant/*.ant` (gzip) |
| 原始 MAP 文件 | `1-解包产物/解包树/map/*.map` (gzip) |
| 原始 STR 文件 | `1-解包产物/解包树/str/*.str` (gzip) |
| Java 字节码 | `1-解包产物/类文件/*.class` (74个) |
| Web 主程序 | `5-复刻引擎/web/index.html` |
| ANT hex 数据 | `5-复刻引擎/web/data/ants.js` |
| NPC 配置(不完整) | `5-复刻引擎/web/data/npc_config.js` |
| NPC 立绘映射(不完整) | `5-复刻引擎/web/data/npc_sprite_map.js` |
| 精灵图 PNG | `5-复刻引擎/web/data/tiles/{renwu,chonglou,cs,...}/` |
| ANT 解析器 | `5-复刻引擎/web/src/ant_parser.js` |
| 渲染函数 | `index.html` 中 `drawNpcs()` (~line 252) / `drawPlayer()` (~line 287) |

---

## 六、STR 文件完整解法（已验证）

```python
import gzip, re

def parse_str(path):
    with open(path, 'rb') as f:
        dec = gzip.decompress(f.read())
    # magic(4B "圫TR") + ver(2B) + length(2B LE) + UTF-8 text
    text = dec[8:].decode('utf-8', errors='replace')
    # 条目用 \x00\x10 或 \x00\xNN 分隔
    parts = re.split(r'[\x00-\x0f]', text)
    return [p.strip() for p in parts if p.strip()]
```

**config_game.str 关键配置**:
```
主角配置文件 = config_chonglou.str
主角动画文件 = chonglou.ant
主角资源文件 = chonglou.bin
NPC资源文件 = renwu.bin
明怪动画文件 = guaiwu.ant
初始场景地图文件 = ms_syt_1.map
初始场景地砖资源 = ms.bin
```

---

## 七、给接手者的建议路线

### 第一步（最高优先）：反编译 Java

```bash
# 安装 CFR 反编译器（单 jar 文件）
wget https://github.com/leibnitz27/cfr/releases/download/0.152/cfr-0.152.jar -O /tmp/cfr.jar

# 反编译全部 class
java -jar /tmp/cfr.jar 1-解包产物/类文件/*.class --outputdir /tmp/decompiled/

# 找 NPC 相关类
grep -rl "npc" /tmp/decompiled/ | head
grep -rl "renwu" /tmp/decompiled/ | head
grep -rl "setPosition" /tmp/decompiled/ | head
```

**目标**: 从反编译代码中找到：
1. NPC 类的定义格式（ID → 属性映射）
2. ANT 文件 section 2/3 的解析逻辑
3. 地图如何加载 NPC 列表

### 第二步：批量提取 NPC 配置

写一个 Python 脚本，从以下来源**批量**提取完整 NPC 数据：
1. 所有 `talk_*.str` → 对话脚本
2. 反编译的 Java 代码 → NPC ID 映射
3. MAP 文件里的 `npc.setPosition()` 调用 → NPC 在地图上的位置

生成完整的 `npc_config.js`（覆盖所有 NPC ID）和 `npc_sprite_map.js`。

### 第三步：实现 ANT 动画播放

1. 从反编译代码找到 ANT section 2/3 解析逻辑
2. 在 `ant_parser.js` 中实现完整解析
3. 在 `drawNpcs()` / `drawPlayer()` 中按帧播放动画
4. 根据玩家方向选择对应的 walk_up/walk_down/walk_left/walk_right 序列

### 第四步：清理

- 删除 test_a/, test_output/, test_output2/
- 删除 npc_config_new.js（临时文件）
- Python CLI 版（5-复刻引擎/*.py）如果不再维护可移除

---

## 八、Git 提交历史

```
cee59d8 角色渲染：用 ANT c_table 精确裁剪 NPC，chonglou 缩放适配视口
2e1bdf7 补交 viewport 测试截图
77f0929 添加 Web 复刻过程文档
c79bc43 添加源码模块（9 个 JS 游戏模块）
2babd82 添加背景音乐（10 首 MIDI）
056ddf3 添加游戏素材资源（392 张瓦片 PNG）
39fb34c 添加数据层（15 个 JS 数据模块）
2ddd4b6 重构游戏入口：单文件 → 模块化架构
99fa250 添加 Web 项目配置文件
2e15029 添加项目交接文档 HANDOVER.md
5fdc74d 添加结构化配置数据（物品、技能、敌人、任务等）
fefbe95 添加解包产物（解包树、剧本、类文件、图片、音乐）
6da7b01 添加逆向解包工具
cec8f73 添加原始游戏素材
99e58e1 补全全部69张地图数据至Web版
da67d26 修复Web版HTML结构：添加DOCTYPE和canvas容器
3c5561a 完成Web复刻版：全部游戏数据嵌入单HTML文件
d5afb13 初始化项目：逆向工程文档与Python复刻引擎
```

---

## 九、如何运行 Web 版

```bash
cd /mnt/shared/仙剑奇侠传忘情篇-逆向工程/5-复刻引擎/web
python3 -m http.server 8099
# 浏览器打开 http://localhost:8099/index.html
```

**操作**: WASD/方向键移动，E 交互，M 菜单，战斗中 1/2/3/4。

---

## 十、诚实总结

**做完了的**: 文件解包、地图渲染、战斗系统、物品/技能/音频/存档系统、69 张地图导航。

**没做完的（而且是大头）**: 
1. 角色动画（ANT section 2/3 没解析）
2. NPC 配置大面积缺失（地图上 13 种 NPC 只覆盖 2 种）
3. Java 字节码完全没反编译（74 个 class，最大的数据源没动）
4. 剧情脚本只解了一半

**为什么会这样**: 我一直在手动猜二进制格式、逐文件试错，没先反编译 Java 拿到原始逻辑。正确路线应该是第一步就反编译 class 文件，从源码理解格式，再写批量提取脚本。

---

## 十一、后续进展（2026-10-04，可玩闭环）

上面"四、没解决的问题"已全部解决，核心结论：

- 反编译：CFR 0.152 从原始 jar 反出 73 类 20273 行（`4-文档/反编译源码/`）；解包树类文件不可信（system.b 覆盖默认包 b）。
- ANT 裁剪表 18 字节/条 + `ag.java:241` flags 映射；MAP 地砖有符号 short；STR 为 `88STR+计数+{len,UTF-8}`；MID 用 `0x9n vel=0` 关音。
- 逻辑层 100%（`3-数据/07-逻辑/`）：行动条 W=750、伤害/闪避/暴击/变身/6 条原版怪癖、怪物 slv 恒 1、123 条 RPG 指令、48 条战斗/技能指令、表达式 7 细节。
- Web 链路（`5-复刻引擎/web/src/xj_*.js`）：开机进初始图 → 地图脚本落子（BGM/字幕/道具/剧情战斗/菜单）→ 移动碰撞 → NPC 对话/分支/商店/任务 → 触发区/传送 → 明怪追击接触开战 → 战斗（菜单/仙术消耗/物品/增益/治疗/偷窃/持续伤害/定身/秒杀/逃跑）→ 胜利结算（掉落≤3/经验/金钱/升级/阵亡扣好感）→ 存档 v2（队伍/技能/跟随/飞行）。
- 关键语义（源码出处写在代码注释里）：world.change 首条生效且 abort 后续；warp 进图跳过 change 行（ms_syt_1↔yw_syc 互指防乒乓）；openScriptList 只门控本批；怪物等级恒 1；技能消耗普通扣气/仙术扣神；宝箱累积权重；升级递归+45 封顶。
- 浏览器实测：开局片头 → 渔村三人入队 → 十里坡东战斗胜利（经验/金钱/掉落/升级写回），0 控制台错误。
- 标题画面（h.java）：corp/logo.ant+png+mid 进管线（01-ant/logo.json、sprites/logo、web/mid/logo.mid），
  开机黑底播 LOGO（music.play tag 处播音乐，播完/按键进游戏）；sp.png splash、icon.png、dcn.bin（短信计费，非游戏内容）一并归档。
- 内容审计：69 图全连通；67 NPC 全放置；30 对话（5 个无引用死文件，照收）；90 引用物品全在表（除 talk_66 文本错字"金疮药"，机制用金创药，零影响）；
  技能/怪物/BGM/ANT 引用全存在；MID 11 首含 logo.mid。
- 拼写错误是 23 行不是 21 行（`scripr.break` 实为 5 处，jar grep 实数）。
- 语义修正（源码级）：状态落子立即生效（markEvent 对后续批次可见，否则 H2 开场只播 2 段）；
  装配顺序先对象后地图脚本（过场 npc.* 才能找到演员）；fight 模态（战后切图战后执行）；
  H2 战前播对应条目再开战；render 帧内战斗结束防空指针；战后切图胜负都执行。
