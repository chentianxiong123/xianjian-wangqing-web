# 文档目录

本目录包含项目的所有过程文档和参考资料。

## 📋 文档清单

| 文件 | 说明 | 大小 |
|------|------|------|
| `CONTRACT.md` | 合同文档 - 包含项目需求、技术规范、验收标准等 | 20KB |
| `PARALLEL_TASKS.md` | 并行任务文档 - 记录开发任务分配和进度 | 15KB |
| `assets_report.txt` | 素材规范化报告 - 记录素材提取和规范化处理过程 | 1KB |

## 📁 文档说明

### CONTRACT.md
- 项目合同文档
- 包含：
  - 项目概述
  - 技术要求
  - 设计规范
  - 验收标准
  - 交付物清单

### PARALLEL_TASKS.md
- 并行任务管理文档
- 包含：
  - 任务分配
  - 进度跟踪
  - 依赖关系
  - 完成状态

### assets_report.txt
- 素材规范化处理报告
- 包含：
  - ANT 动画文件解析统计
  - PNG 素材提取记录
  - BIN 类别分布
  - 验证结果

## 📝 文档使用

- **CONTRACT.md**: 项目启动和验收时参考
- **PARALLEL_TASKS.md**: 开发过程中跟踪任务进度
- **assets_report.txt**: 素材管理和问题排查时参考

## 📁 目录结构

```
.
├── docs/                 # 过程文档目录
│   ├── CONTRACT.md
│   ├── PARALLEL_TASKS.md
│   ├── assets_report.txt
│   └── README.md         # 文档目录说明
├── data/                  # 数据文件目录
│   ├── tiles/            # PNG素材 (18个目录, 392个文件)
│   └── ...               # 其他数据文件
├── mid/                  # 10个MIDI音乐文件
├── src/                  # 源码文件
├── index.html             # 游戏入口
├── CONTRACT.md            # 合同 (已移到 docs/)
├── PARALLEL_TASKS.md       # 任务文档 (已移到 docs/)
└── README.md              # 项目主文档
