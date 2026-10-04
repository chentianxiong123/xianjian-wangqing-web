#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""30-解析脚本与配置.py — 101 个 STR 全量提取

输入: 1-解包产物/解包树/str/*.str   (101 个, 1146 个条目)
输出: 3-数据/
    05-脚本/talk/<name>.json      NPC 对话 → AST + 对话行抽取
    05-脚本/fight/<name>.json     战斗脚本 → AST
    05-脚本/其他/<name>.json      xuanze/H2/fee/GotoFee/tips 等
    06-配置/*.json                config_* 按表结构解析 + 公式提取
    08-npc/npc_定义.json          39 个数字命名 str 的 NPC 定义
    08-npc/npc_总表.json          地图 addToNpc × str 定义 合并
    manifest_str.json             覆盖率 + 每文件 sha256
"""
import glob
import hashlib
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from formats import TREE, FormatError
from formats import script as FS
from formats import strfile as ST

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "3-数据")
STRDIR = os.path.join(TREE, "str")


def sha(b):
    return hashlib.sha256(b).hexdigest()


def dump(rel, obj):
    p = os.path.join(DATA, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))
    return p


# ---------------------------------------------------------------- 对话脚本

#: talk_*.str 每条目形如  [条件] #脚本正文
#: 条件用 `#` 与脚本正文分隔；脚本正文自身是多条 `;` 分隔的指令。
COND_SPLIT = re.compile(r"^(?P<cond>[^#]*)#(?P<body>.*)$", re.S)


def parse_talk(entries, meta):
    """NPC 对话 str → [{cond, nodes:[AST], dialogues:[{speaker,text}]}]"""
    blocks = []
    for e in entries:
        t = e["text"].strip()
        if not t:
            continue
        m = COND_SPLIT.match(t)
        cond = m.group("cond").strip() if m else None
        body = m.group("body") if m else t
        # 去掉行尾多余分号后逐行/逐指令解析
        nodes = FS.parse(body)
        dlg = []
        for n in nodes:
            for a in n.get("args", []):
                if a.get("type") == "dialog":
                    dlg.append({"speaker": a.get("speaker") or "",
                                "text": a.get("value") or ""})
        blocks.append({"entry": e["i"], "condRaw": cond,
                       "cond": FS.parse_condition(cond),
                       "nodes": nodes, "dialogues": dlg,
                       "bytes": e["bytes"], "offset": e["offset"]})
    return {"kind": "talk", "meta": meta, "blocks": blocks,
            "dialogueCount": sum(len(b["dialogues"]) for b in blocks)}


# ---------------------------------------------------------------- 配置表

def split_kv(t):
    if "=" not in t:
        return None
    k, v = t.split("=", 1)
    return k.strip(), v.strip()


def is_table_value(v):
    """`键 = 值` 形式但值本身是 # 分列的表(技能表/掉落表)。"""
    return "#" in v and len(v.split("#")) >= 3


def add_formula(dst, k, v, entry):
    f = ST.parse_formula(v)
    f["entry"] = entry
    dst[k] = f


def _consume(entries, scalars, formulas, tables, key_hint=None):
    """逐条目分派: 纯表行 / 键=表值 / 键=公式 / 键=标量"""
    for e in entries:
        t = e["text"]
        if "#" in t and "=" not in t:
            tables.append({"entry": e["i"], "key": None,
                           "cols": [c.strip() for c in t.split("#")]})
            continue
        kv = split_kv(t)
        if not kv:
            continue
        k, v = kv
        if is_table_value(v):
            tables.append({"entry": e["i"], "key": k,
                           "cols": [c.strip() for c in v.split("#")]})
        elif ST.is_formula(v):
            add_formula(formulas, k, v, e["i"])
        else:
            scalars[k] = v


def parse_config(name, entries, meta):
    """config_*.str → {scalars, formulas, tables}"""
    scalars, formulas, tables = {}, {}, []
    _consume(entries, scalars, formulas, tables)
    # config_item / config_skill 的首条目是表头: cols 里第0列是名字
    for t in tables:
        if t["key"] is None and t["cols"] and t["cols"][0] in (
                "名称", "名字", "技能类型", "物品名称"):
            t["isHeader"] = True
    return {"kind": "config", "file": name, "meta": meta,
            "scalars": scalars, "formulas": formulas, "tables": tables}


def parse_fight_def(name, entries, meta):
    """fight_*.str = 怪物配置: 键=值(含公式) + # 分列表"""
    scalars, formulas, tables = {}, {}, []
    _consume(entries, scalars, formulas, tables)
    return {"kind": "fight_def", "file": name, "meta": meta,
            "scalars": scalars, "formulas": formulas, "tables": tables}


def parse_generic_script(name, entries, meta):
    """xuanze / H2 / fee / GotoFee / tips_in_loading 等纯脚本文件"""
    blocks = []
    for e in entries:
        t = e["text"].strip()
        if not t:
            continue
        m = COND_SPLIT.match(t)
        cond = m.group("cond").strip() if m else None
        body = m.group("body") if m else t
        blocks.append({"entry": e["i"], "condRaw": cond,
                       "cond": FS.parse_condition(cond),
                       "nodes": FS.parse(body),
                       "raw": t, "bytes": e["bytes"], "offset": e["offset"]})
    return {"kind": "script", "file": name, "meta": meta, "blocks": blocks}


# ---------------------------------------------------------------- 主流程

def main():
    rep = {"ok": 0, "fail": 0, "errors": []}
    files = {}
    counts = {"talk": 0, "fight_def": 0, "config": 0,
              "npc_def": 0, "script": 0, "other": 0}
    cfg_tables = {}
    npc_defs = {}

    for p in sorted(glob.glob(os.path.join(STRDIR, "*.str"))):
        name = os.path.basename(p)
        raw = open(p, "rb").read()
        try:
            entries, meta = ST.parse(ST.load_raw(p), where=name)
            meta["sha256"] = sha(raw)
            meta["file"] = name
            meta["bytes"] = len(ST.load_raw(p))
            cat = ST.category(name)

            if cat == "talk":
                obj = parse_talk(entries, meta)
                dump("05-脚本/talk/%s.json" % name[:-4], obj)
                counts["talk"] += 1
            elif cat == "fight":
                obj = parse_fight_def(name, entries, meta)
                dump("05-脚本/fight/%s.json" % name[:-4], obj)
                counts["fight_def"] += 1
            elif cat == "config":
                obj = parse_config(name, entries, meta)
                dump("06-配置/%s.json" % name[:-4], obj)
                cfg_tables[name[:-4]] = obj
                counts["config"] += 1
            elif cat == "numeric":
                cfg = {}
                for e in entries:
                    kv = split_kv(e["text"])
                    if kv:
                        cfg[kv[0]] = kv[1]
                d = ST.parse_npc_def(cfg)
                d["file"] = name
                d["meta"] = meta
                d["raw"] = cfg
                npc_defs[name[:-4]] = d
                dump("08-npc/def/%s.json" % name[:-4], d)
                counts["npc_def"] += 1
            else:
                obj = parse_generic_script(name, entries, meta)
                dump("05-脚本/其他/%s.json" % name[:-4], obj)
                counts["script"] += 1
            files[name] = {"category": cat, "entries": meta["count"],
                           "bytes": meta["bytes"], "sha256": meta["sha256"]}
            rep["ok"] += 1
        except Exception as ex:
            rep["fail"] += 1
            rep["errors"].append("%s: %s: %s" % (name, type(ex).__name__, ex))

    # 数字命名 str 里不全是 NPC 定义(有些是别的)，挑出有 动画文件 的
    real_npc = {k: v for k, v in npc_defs.items() if v.get("ant")}
    dump("08-npc/npc_定义.json", real_npc)

    # NPC 总表: 地图 addToNpc × str 定义
    npc_table = build_npc_table(real_npc)
    dump("08-npc/npc_总表.json", npc_table)

    man = {"group": "str", "total": len(files), "counts": counts,
           "parsed_ok": rep["ok"], "failed": rep["fail"],
           "errors": rep["errors"], "files": files,
           "npc_defs": len(real_npc), "npc_table": len(npc_table)}
    dump("manifest_str.json", man)

    print("STR 全量: %d 个文件, 成功 %d 失败 %d" % (len(files), rep["ok"], rep["fail"]))
    for k, v in counts.items():
        print("   %-10s %d" % (k, v))
    print("   NPC 定义 %d, NPC 总表 %d" % (len(real_npc), len(npc_table)))
    for e in rep["errors"][:10]:
        print("  !", e)
    return 1 if rep["fail"] else 0


ADD_NPC = re.compile(r"element\.addToNpc\(\s*([^,]+),\s*([^)]+)\)")
SET_POS = re.compile(r"npc\.setPosition\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)")


def as_int(s):
    """坐标可能是字面量，也可能是 player.x 这类表达式。"""
    s = s.strip()
    try:
        return int(s)
    except ValueError:
        return {"expr": s}


def build_npc_table(defs):
    """扫全部地图脚本的 element.addToNpc / npc.setPosition，合并 str 定义。"""
    tbl = {}
    for p in sorted(glob.glob(os.path.join(TREE, "map", "*.map"))):
        mname = os.path.basename(p)
        from formats import mapfile as FM
        m = FM.load(p)
        texts = [m["script"]]
        for l in m["layers"]:
            texts += [o["script"] for o in l["objects"] if o["script"]]
            texts += [r["script"] for r in l["regions"] if r["script"]]
            texts += [t["script"] for t in l["triggers"] if t["script"]]
        for t in texts:
            for g in ADD_NPC.finditer(t):
                try:
                    nid = int(g.group(1))
                except ValueError:
                    continue
                src = g.group(2).strip()
                e = tbl.setdefault(nid, {"id": nid, "srcStr": None, "srcAnt": None,
                                        "maps": [], "positions": []})
                # .str 与 .ant 分开记录：.str 才是定义来源，.ant 只是贴图
                if src.endswith(".str"):
                    e["srcStr"] = src
                else:
                    e["srcAnt"] = src
                if mname not in e["maps"]:
                    e["maps"].append(mname)
            for g in SET_POS.finditer(t):
                try:
                    nid = int(g.group(1))
                except ValueError:
                    continue
                e = tbl.setdefault(nid, {"id": nid, "src": None, "maps": [],
                                        "positions": []})
                e["positions"].append({"map": mname,
                                       "x": as_int(g.group(2)),
                                       "y": as_int(g.group(3))})
    # 合并 str 定义
    #
    # ★ 同一个 NPC id 可能被两种形式引用：
    #     element.addToNpc(17, 17.str)      ← 带定义（名字/对话文件/对话区域）
    #     element.addToNpc(34, npc_34.ant)  ← 仅贴图
    #   两者可以出现在不同地图里。之前用单个 src 字段后写覆盖，
    #   结果 .ant 把 .str 的定义整个抹掉（39 个定义里丢了 23 个 talk）。
    #   正确做法：分开记录 srcStr / srcAnt，定义一律以 .str 为准。
    for nid, e in tbl.items():
        src_str = e.get("srcStr")
        src_ant = e.get("srcAnt")
        if not src_str and str(nid) in defs:
            # 没有 addToNpc(...str) 引用，但地图里用 npc.setPosition(<id>,x,y) 直接放置。
            # 这种 NPC 的定义就在 id.str 里（defs 以数字为键）。
            src_str = "%d.str" % nid
            e["srcStr"] = src_str
            e["placedBy"] = "setPosition"
        if src_str:
            d = defs.get(src_str[:-4])
            if d:
                e.update({"name": d["name"], "ant": d["ant"],
                          "talk": d["talk"], "nameHeight": d["nameHeight"],
                          "moveUD": d["moveUD"], "moveLR": d["moveLR"],
                          "dialogRegions": d["dialogRegions"],
                          "defFile": src_str})
            else:
                e.update({"name": None, "talk": None, "defFile": src_str})
        else:
            # 没有 .str 定义 → 只能拿到贴图名，其余未知
            e.update({"name": None, "talk": None, "defFile": None,
                      "ant": src_ant or None})
        e["src"] = src_str or src_ant
    return {str(k): v for k, v in sorted(tbl.items())}


if __name__ == "__main__":
    sys.exit(main())