#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""60-生成web数据.py —— 由 3-数据/*.json 生成 5-复刻引擎/web/data/xj_*.js

原则：
  · 唯一数据源是 3-数据/ 下的权威 JSON，不重新解析任何二进制
  · 每个模块只挂一个 window.XJ_* 全局量，引擎侧只读不猜
  · 精灵图 URL 由 03-bin/index.json 的 png 字段直接给出，不做运行时推导
  · 体积优化：地砖用 RLE 游程编码，字符串表去重

产出：
  xj_bin.js       BIN 索引 + 精灵图 URL 表
  xj_ant.js       全部 ANT 的 clips/layers/states（含每段动画的脚本）
  xj_maps.js      地图：地砖(RLE)、元素对象、区域、出口、脚本 AST
  xj_npc.js       NPC 总表 + 定义
  xj_config.js    物品/技能/合成/任务/角色/怪物/游戏配置
  xj_logic.js     战斗常量与公式（来自 07-逻辑）
  xj_scripts.js   对话脚本
"""
from __future__ import annotations

import json
import os
import glob

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "3-数据")
WEB = os.path.join(ROOT, "5-复刻引擎", "web", "data")
GEN = "2-工具/60-生成web数据.py"


def jload(*rel):
    p = os.path.join(DATA, *rel)
    if not os.path.exists(p):
        return None
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def dumps(obj, compact=False):
    if compact:
        return json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    return json.dumps(obj, ensure_ascii=False, indent=1, sort_keys=False)


def emit(name, var, obj, note, compact=True):
    os.makedirs(WEB, exist_ok=True)
    p = os.path.join(WEB, name)
    body = "/* 由 %s 自动生成，请勿手改 */\n" % GEN
    if note:
        body += "/* %s */\n" % note
    body += "window.%s = %s;\n" % (var, dumps(obj, compact))
    with open(p, "w", encoding="utf-8") as f:
        f.write(body)
    return os.path.getsize(p), p


# --------------------------------------------------------------- BIN / 精灵图
def gen_bin():
    idx = jload("03-bin", "index.json") or {}
    bins = {}
    urls = []
    total = 0
    for name in sorted(idx):
        v = idx[name]
        ents = []
        for e in v["entries"]:
            png = e.get("png") or ""
            rel = png.split("sprites/")[-1] if "sprites/" in png else ""
            url = "data/sprites/" + rel if rel else None
            ents.append({"i": e["index"], "e": e.get("entry"), "k": e.get("kind"),
                         "r": e.get("resolved"), "u": url})
            if url:
                urls.append(url)
            total += 1
        bins[name] = ents
    # ★ 标题图：03-bin/logo.json（corp/logo.png，非 BIN 包，单 sheet 直引）
    logo = jload("03-bin", "logo.json") or {}
    for e in (logo.get("entries") or []):
        png = e.get("png") or ""
        rel = png.split("sprites/")[-1] if "sprites/" in png else ""
        url = "data/sprites/" + rel if rel else None
        bins.setdefault("logo", []).append({"i": e["index"], "e": e.get("entry"),
                                             "k": e.get("kind"), "r": e.get("resolved"), "u": url})
        if url:
            urls.append(url)
        total += 1
    out = {
        "count": total,
        "bins": bins,
        "urls": sorted(set(urls)),
        "note": "u 为精灵图 URL；k=kind(png/pix)；r=resolved(处理跨包引用后的真名)",
    }
    return emit("xj_bin.js", "XJ_BIN", out,
                "BIN 索引 %d 个包 / %d 个条目" % (len(bins), total))


# --------------------------------------------------------------- ANT
def gen_ant():
    ants = {}
    nclip = nstate = nscript = 0
    for p in sorted(glob.glob(os.path.join(DATA, "01-ant", "*.json"))):
        d = json.load(open(p, encoding="utf-8"))
        name = os.path.basename(p)[:-5]
        clips = [[c["sheet"], c["srcX"], c["srcY"], c["w"], c["h"]] for c in d["clips"]]
        layers = [[[q["clip"], q["x"], q["y"], q["flags"]] for q in part] for part in d["layers"]]
        states = []
        for st in d["states"]:
            seq = []
            for s in st["seq"]:
                seq.append([s["layer"], s["offX"], s["offY"], s["duration"], s.get("tag")])
            states.append({"n": st["name"], "t": st.get("tag"), "q": seq})
            for s in st["seq"]:
                if s.get("tag"):
                    nscript += 1
        ants[name] = {"bin": d["bin"], "clips": clips, "layers": layers, "states": states}
        nclip += len(clips)
        nstate += len(states)
    out = {"count": len(ants), "ants": ants,
           "note": "clips=[sheet,sx,sy,w,h]；layers=[[clip,x,y,flags]]；"
                   "states[].q=[layer,offX,offY,duration,tag脚本]"}
    return emit("xj_ant.js", "XJ_ANT", out,
                "ANT %d 个 / 裁剪 %d / 状态 %d / 带脚本段 %d" % (len(ants), nclip, nstate, nscript))


# --------------------------------------------------------------- MAP
def rle(row):
    """行游程编码：返回 [值, 连续个数, ...]"""
    out = []
    for v in row:
        if out and out[-2] == v:
            out[-1] += 1
        else:
            out.append(v)
            out.append(1)
    return out


def gen_maps():
    maps = {}
    nobj = nscript = nempty = nobjscript = 0
    for p in sorted(glob.glob(os.path.join(DATA, "02-map", "*.json"))):
        d = json.load(open(p, encoding="utf-8"))
        name = os.path.basename(p)[:-5]
        layers = []
        for L in d["layers"]:
            tiles = L.get("tiles")
            if not tiles:          # 元素层/遮挡层本就没有地砖网格，字节级已验证
                nempty += 1
            layers.append({
                "i": L["index"], "n": L["name"],
                "tw": d["tileW"], "th": d["tileH"],
                "cols": d["cols"], "rows": d["rows"],
                "t": [rle(r) for r in tiles] if tiles else None,
                "o": [[ob["anim"], ob["x"], ob["y"], ob.get("scriptAst")]
                      for ob in (L.get("objects") or [])],
                "r": L.get("regions") or [],
                "g": L.get("triggers") or [],
            })
            nobj += len(L.get("objects") or [])
            nobjscript += sum(1 for ob in (L.get("objects") or []) if ob.get("scriptAst"))
        ast = d.get("scriptAst") or []
        nscript += len(ast)
        maps[name] = {
            "res": d["res"], "tw": d["tileW"], "th": d["tileH"],
            "cols": d["cols"], "rows": d["rows"],
            "tileBin": (d.get("tileBin") or "").replace(".bin", ""),
            "elementAnt": (d.get("elementAnt") or "").replace(".ant", ""),
            "elementAnts": [a.replace(".ant", "") for a in (d.get("elementAnts") or [])],
            "layers": layers,
            "exits": [{"to": e["targetMap"][:-4], "x": e["x"], "y": e["y"], "dir": e["dir"]}
                      for e in (d.get("exits") or [])],
            "script": ast,
        }
    out = {"count": len(maps), "maps": maps, "emptyTileLayers": nempty,
           "objectScripts": nobjscript,
           "note": "层 t 为逐行 RLE([值,次数,值,次数…])，t=null 表示该层无地砖网格；"
                   "o=[anim,x,y,scriptAst] —— 对象级脚本已解析为 AST，"
                   "element.addToNpc 等 NPC 定义就在其中；"
                   "script 为地图级脚本 AST（含类型化参数与条件）"}
    return emit("xj_maps.js", "XJ_MAPS", out,
                "地图 %d 张 / 元素对象 %d / 带脚本对象 %d / 地图级指令 %d / 无网格层 %d"
                % (len(maps), nobj, nobjscript, nscript, nempty))


# --------------------------------------------------------------- NPC
def gen_npc():
    npcs = jload("08-npc", "npc_总表.json") or {}
    defs = jload("08-npc", "npc_定义.json") or {}
    out = {"count": len(npcs), "npcs": npcs, "defs": defs,
           "note": "npcs[id] = {ant, talk, name, ...}；defs 为 21.str 等 NPC 定义实例"}
    return emit("xj_npc.js", "XJ_NPC", out, "NPC 总表 %d / 定义 %d" % (len(npcs), len(defs)))


# --------------------------------------------------------------- 配置
CONFIG_MAP = [
    ("items", ("06-配置", "_汇总_物品.json"), "物品"),
    ("skills", ("06-配置", "_汇总_技能.json"), "技能"),
    ("recipes", ("06-配置", "_汇总_合成.json"), "合成"),
    ("tasks", ("06-配置", "_汇总_任务.json"), "任务"),
    ("roles", ("06-配置", "_汇总_角色.json"), "角色"),
    ("formulas", ("06-配置", "_汇总__公式总表.json"), "成长公式"),
    ("fee", ("06-配置", "_汇总_计费.json"), "计费"),
    ("instruction", ("06-配置", "_汇总_指令配置.json"), "指令配置"),
    ("battleLayout", ("06-配置", "_汇总_战斗布局.json"), "战斗布局"),
    ("enemyDist", ("06-配置", "_汇总_敌人分布.json"), "敌人分布"),
    ("gameCfg", ("06-配置", "config_game.json"), "游戏配置"),
    ("fightCfg", ("06-配置", "config_fight.json"), "战斗配置"),
    ("itemCfg", ("06-配置", "config_item.json"), "物品原始表"),
    ("skillCfg", ("06-配置", "config_skill.json"), "技能原始表"),
    ("roleCfg", ("06-配置", "config_liyiru.json"), "角色原始表"),
    ("zixuanCfg", ("06-配置", "config_zixuan.json"), "自选仙术"),
    ("makeCfg", ("06-配置", "config_make.json"), "合成原始表"),
]


def gen_config():
    out = {}
    # enemy.str 的原始键值表（键 = 地图名 或 boss1/liyao/…），战斗遇敌直接查它
    ed = jload("06-配置", "_汇总_敌人分布.json") or {}
    raw = {}
    for r in ed.get("rows") or []:
        k = r.get("map")
        if k:
            raw[k] = r.get("raw") or ",".join(r.get("cols") or [])
    if raw:
        out["enemyDistRaw"] = raw
        out["_enemyKeys"] = len(raw)
    miss = []
    for key, rel, label in CONFIG_MAP:
        d = jload(*rel)
        if d is None:
            miss.append(label)
            continue
        out[key] = d
    out["_note"] = "各 key 对应 3-数据/06-配置/ 下的同名汇总或原始表"
    if miss:
        out["_missing"] = miss
    return emit("xj_config.js", "XJ_CONFIG", out,
                "配置 %d 组（含 enemy.str 键值表 %d 条）"
                % (len(out) - 3, out.get("_enemyKeys", 0)))


# --------------------------------------------------------------- 逻辑
def gen_logic():
    fight = jload("07-逻辑", "战斗系统.json") or {}
    skills = jload("07-逻辑", "技能公式总表.json") or {}
    monsters = jload("07-逻辑", "怪物属性总表.json") or {}
    ops = jload("07-逻辑", "战斗脚本指令集.json") or {}
    expr = jload("07-逻辑", "表达式引擎.json") or {}
    out = {
        "combat": fight,
        "skillFormulas": {
            "contract": skills.get("formulaContract"),
            "player": skills.get("playerSkills"),
        },
        "monsters": monsters,
        "ops": {
            "battleScript": ops.get("battleScriptOps"),
            "skillScript": ops.get("skillScriptOps"),
            "conditions": ops.get("conditions"),
            "parsing": ops.get("parsing"),
        },
        "expr": {"precedence": expr.get("precedence"), "quirks": expr.get("quirks")},
        "_note": "战斗常量与公式全部来自 07-逻辑，引擎侧不得内嵌任何魔法数",
    }
    return emit("xj_logic.js", "XJ_LOGIC", out, "战斗/技能/脚本逻辑（源自 07-逻辑）")


# --------------------------------------------------------------- 对话脚本
def gen_scripts():
    out = {}
    for kind in ("talk", "fight", "其他"):
        d = os.path.join(DATA, "05-脚本", kind)
        if not os.path.isdir(d):
            continue
        out[kind] = {}
        for p in sorted(glob.glob(os.path.join(d, "*.json"))):
            out[kind][os.path.basename(p)[:-5]] = json.load(open(p, encoding="utf-8"))
    out["_note"] = "每条对话已解析为 AST；raw 保留原始文本以便回溯"
    return emit("xj_scripts.js", "XJ_SCRIPTS", out,
                "脚本 %s" % " / ".join("%s %d" % (k, len(v)) for k, v in out.items() if k != "_note"))


def main() -> int:
    print("[60] 生成 Web 数据")
    if not os.path.isdir(DATA):
        print("  ✗ 缺 3-数据/，请先跑 20/25/30/40/50")
        return 1
    files = [
        gen_bin(), gen_ant(), gen_maps(), gen_npc(),
        gen_config(), gen_logic(), gen_scripts(),
    ]
    total = 0
    for size, p in files:
        total += size
        print("  %-28s %8.1f KB" % (os.path.relpath(p, ROOT), size / 1024))
    print("  合计 %.1f KB" % (total / 1024))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())