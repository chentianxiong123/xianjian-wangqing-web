# 仙剑忘情 - 地图复刻项目

## 📁 项目结构

```
.
├── data/                  # 数据文件目录
│   ├── tiles/            # PNG素材 (18个目录, 392个文件)
│   ├── *.js              # 游戏数据 (15个JS文件)
│   └── assets_report.txt # 素材规范化报告
├── mid/                  # MIDI音乐文件 (10个)
├── src/                  # 源代码文件
├── index.html            # 游戏入口
├── CONTRACT.md           # 合同文档
└── README.md             # 项目说明
```

## 📊 素材统计

### ANT动画文件
- 文件数量: 75个
- 总帧数: 2,532帧
- 数据文件: `data/ants.js` (515KB)

### PNG素材文件
- 目录数量: 18个 (完整覆盖所有BIN类别)
- 文件总数: 392个
- 总大小: 1.9MB

### BIN类别分布
| 类别 | 数量 | 说明 |
|------|------|------|
| cs | 112 | 场景素材 |
| yw | 73 | 妖兽素材 |
| renwu | 34 | 人物素材 |
| ms | 31 | 门派素材 |
| sn | 29 | 寺庙素材 |
| chengshi | 22 | 城市素材 |
| fight | 25 | 战斗素材 |
| yewai | 15 | 野外素材 |
| ui | 10 | UI素材 |
| share | 8 | 共享素材 |
| shinei | 8 | 室内素材 |
| menu | 6 | 菜单素材 |
| mishi | 6 | 密室素材 |
| portrait | 6 | 肖像素材 |
| fight_beijing | 4 | 战斗背景 |
| fight_skill | 1 | 战斗技能 |
| fight_ui | 1 | 战斗UI |
| chonglou | 1 | 重楼素材 |

### MIDI音乐文件
- 数量: 10个
- 文件: boss.mid, menu.mid, ss.mid, ssm.mid, syc.mid, syg.mid, syt.mid, sz.mid, xg.mid, yw.mid

## 📝 数据文件说明

### 核心数据文件
- `maps.js` (1.2MB) - 地图数据
- `ants.js` (515KB) - 动画数据
- `talk_scripts.js` (62KB) - 对话脚本
- `items.js` (32KB) - 物品数据
- `enemies.js` (12KB) - 敌人数据
- `skills.js` (10KB) - 技能数据

### 配置文件
- `npc_config.js` - NPC配置
- `npc_sprite_map.js` - NPC精灵映射
- `bin_index.js` - BIN索引
- `game_cfg.js` - 游戏配置
- `fight_cfg.js` - 战斗配置

### 游戏系统数据
- `chars.js` - 角色数据
- `recipes.js` - 配方数据
- `shops.js` - 商店数据
- `tasks.js` - 任务数据

## 🔧 技术规格

### 文件格式
- ANT动画: gzip压缩, 88ANT magic, 版本2
- PNG素材: 标准PNG格式, 带透明度
- MIDI音乐: 标准MIDI格式

### 数据完整性
- ✓ 75/75 ANT文件解析成功
- ✓ 392/392 PNG格式有效
- ✓ 18/18 BIN类别完整
- ✓ JavaScript语法验证通过
- ✓ JSON结构完整性验证通过

## 📋 更新记录

### 2026-10-04
- ✓ 提取了7个缺失的BIN素材 (chonglou, menu, mishi, portrait, share, shinei, yewai)
- ✓ 修复了ants.js的JSON结构问题
- ✓ 生成了完整的素材规范化报告
- ✓ 清理了JSON备份文件
- ✓ 更新了bin_index.js (11→18个BIN类别)

## 🎮 使用说明

### 快速开始
1. 直接打开 `index.html` 即可运行游戏
2. 所有数据文件会自动加载
3. 素材文件按BIN类别分目录存放

### 数据更新
- 动画数据: 编辑 `data/ants.js`
- 地图数据: 编辑 `data/maps.js`
- 对话脚本: 编辑 `data/talk_scripts.js`
- 素材文件: 按BIN类别放在 `data/tiles/` 对应目录

---

**项目状态**: ✓ 素材规范化完成，可用于开发  
**最后更新**: 2026-10-04 14:05  
**规范版本**: 1.0
