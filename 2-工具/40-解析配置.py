#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""40-解析配置.py — config_*.str 的表结构解析与公式汇总

把 9 个 config_*.str 变成引擎能直接用的结构:
    角色(重楼/李忆如/紫萱)  物品  技能  合成  战斗  指令  游戏
并抽出全部可执行公式，汇总到 06-配置/_公式总表.json

公式保持原样输出(不简化、不改写)，引擎侧直接求值。
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from formats import TREE
from formats import strfile as ST

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "3-数据")
STRDIR = os.path.join(TREE, "str")

# ---------------------------------------------------------------- 列语义
# 全部来自反编译源码，不是猜的。src 为出处。
ITEM_COLS = [
    ("名称", "a",  "i.java:31  查表键"),
    ("类型", "b",  "i.java:32  武器=0 服饰=1 头饰=2 足饰=3 饰品=4 药品=5 "
                   "材料=6 特殊=7 (默认8) 合成=9"),
    ("价格", "c",  "i.java:34  背包.c() 是金钱"),
    ("限定角色", "d", "i.java:35  重楼=0 月瑶=1 紫萱=2 女=3 (默认4=不限)"),
    ("属性4", "i", "i.java:36  木剑=50 且说明为『武+50』→ 疑为武/攻击"),
    ("属性5", "j", "i.java:37  语义未确认"),
    ("属性6", "k", "i.java:38  语义未确认"),
    ("属性7", "l", "i.java:39  语义未确认"),
    ("属性8", None, "i.java:40  解析后丢弃，疑为废弃列"),
    ("属性9", "m", "i.java:42  语义未确认"),
    ("属性10", "n", "i.java:43  语义未确认"),
    ("属性11", "o", "i.java:44  语义未确认"),
    ("效果值", "e", "i.java:45 / d.java:170  药品表取此列作效果"),
    ("效果文本", "g", "i.java:46"),
    ("说明", "h", "i.java:47 / d.java:171  i.c() 返回此列"),
]

SKILL_COLS = [
    ("技能类型", "b", "af.java:31  普通=0 水系=1 雷系=2 火系=3 风系=4 土系=5 双系=6"),
    ("增益?", "c", "af.java:32  是否等于『增益』"),
    ("名字", "d", "af.java:33  af.a(String) 按此列查找"),
    ("攻击名", "e", "af.java:34"),
    ("全体?", "f", "af.java:35  是否等于『是』"),
    ("参数6", "g", "af.java:36"),
    ("参数7", "h", "af.java:37"),
    ("可用?", "i", "af.java:38  是否等于『是』"),
    ("参数9", "j", "af.java:39"),
    ("参数10", "k", "af.java:40"),
    ("公式", "n", "af.java:41  伤害表达式字符串，如 (atk*8)/10"),
    ("介绍", "l", "af.java:42"),
]

#: 哪些 config_*.str 的第 0 行是表头(而非数据)
#: d.java:159 的 `U[n2] = n2 == 0 ? new af(...dummy...) : new af(...)`
#: 证明 config_skill 第 0 行是表头(被替换为哑值)。
HAS_HEADER = {"config_skill.str": True, "config_item.str": False}


def load(name):
    return ST.load_entries(os.path.join(STRDIR, name))


def entries_texts(name):
    e, _ = load(name)
    return e


def rows_of(entries, skip_header=True):
    """纯 # 分列表 → (header, rows)"""
    header, rows = None, []
    for e in entries:
        t = e["text"]
        if "#" in t and "=" not in t:
            cols = [c.strip() for c in t.split("#")]
            if header is None and skip_header:
                header = cols
            else:
                rows.append(cols)
    return header, rows


def kv_of(entries):
    """键=值 / 键=公式"""
    scalars, formulas, tables = {}, {}, {}
    for e in entries:
        t = e["text"]
        if "#" in t and "=" not in t:
            continue
        if "=" not in t:
            continue
        k, v = t.split("=", 1)
        k, v = k.strip(), v.strip()
        if "#" in v:
            tables[k] = [c.strip() for c in v.split("#")]
        elif ST.is_formula(v):
            f = ST.parse_formula(v)
            f["entry"] = e["i"]
            formulas[k] = f
        else:
            scalars[k] = v
    return scalars, formulas, tables


def zip_rows(header, rows):
    if not header:
        return [dict(enumerate(r)) for r in rows]
    return [{header[i] if i < len(header) else "c%d" % i: c
             for i, c in enumerate(r)} for r in rows]


def main():
    out = {}

    # ---------------- 角色 (config_chonglou / liyiru / zixuan)
    chars = {}
    for f, key in (("config_chonglou.str", "chonglou"),
                   ("config_liyiru.str", "liyiru"),
                   ("config_zixuan.str", "zixuan")):
        e = entries_texts(f)
        sc, fo, tb = kv_of(e)
        chars[key] = {"file": f, "name": sc.get("名字"),
                      "scalars": sc, "formulas": fo, "tables": tb,
                      "initialSkills": [s.strip() for s in
                                        sc.get("初始技能", "").split(",") if s.strip()],
                      "initialArts": [s.strip() for s in
                                      sc.get("初始仙术", "").split(",") if s.strip()],
                      "initialItems": [s.strip() for s in
                                       sc.get("初始物品", "").split(",") if s.strip()],
                      "portrait": sc.get("头像")}
    out["角色"] = chars

    # ---------------- 物品 (config_item)
    e = entries_texts("config_item.str")
    header, rows = rows_of(e, skip_header=HAS_HEADER["config_item.str"])
    if not header:
        header = [c[0] for c in ITEM_COLS]
    items = [{(header[i] if i < len(header) else "c%d" % i): c
              for i, c in enumerate(r)} for r in rows]
    out["物品"] = {"header": header, "cols": ITEM_COLS,
                   "count": len(items), "rows": items}

    # ---------------- 技能 (config_skill)
    e = entries_texts("config_skill.str")
    raw_header, rows = rows_of(e, skip_header=HAS_HEADER["config_skill.str"])
    header = [c[0] for c in SKILL_COLS]
    skills = [{(header[i] if i < len(header) else "c%d" % i): c
               for i, c in enumerate(r)} for r in rows]
    out["技能"] = {"header": header, "rawHeader": raw_header,
                   "cols": SKILL_COLS,
                   "count": len(skills), "rows": skills}

    # ---------------- 合成 (config_make)  语法: 成品,材料(数量)|材料(数量),说明
    e = entries_texts("config_make.str")
    recipes = []
    for x in e:
        t = x["text"]
        if "=" in t:
            continue
        parts = t.split(",")
        if len(parts) < 3:
            continue
        prod = parts[0].strip()
        mats = []
        for g in parts[1].split("|"):
            g = g.strip()
            m = re.match(r"^(.*)\((\d+)\)$", g)
            if m:
                mats.append({"item": m.group(1).strip(),
                             "count": int(m.group(2))})
        recipes.append({"entry": x["i"], "product": prod, "materials": mats,
                        "desc": parts[2].strip(),
                        "raw": t})
    out["合成"] = {"count": len(recipes), "rows": recipes}

    # ---------------- 任务 (task.str)  语法: 任务名 = 说明
    e = entries_texts("task.str")
    tasks = []
    for x in e:
        t = x["text"]
        if "=" not in t:
            continue
        k, v = t.split("=", 1)
        if not k.strip():
            continue
        tasks.append({"entry": x["i"], "name": k.strip(), "desc": v.strip()})
    out["任务"] = {"count": len(tasks), "rows": tasks}

    # ---------------- 敌人分布 (enemy.str)
    #   地图名字 = ID范围,怪物种类,#事件ID?成立等级范围:不成立的等级,战斗背景,bgm
    e = entries_texts("enemy.str")
    zones, header2 = [], None
    for x in e:
        t = x["text"]
        if "=" not in t:
            continue
        k, v = t.split("=", 1)
        k, v = k.strip(), v.strip()
        if "ID" in v and "范围" in v and header2 is None:
            header2 = [c.strip() for c in v.split(",")]
            continue
        parts = [p.strip() for p in v.split(",")]
        zones.append({"map": k, "cols": parts, "raw": v})
    out["敌人分布"] = {"header": header2, "count": len(zones), "rows": zones}

    # ---------------- 计费 (fee.str / GotoFee.str)
    e = entries_texts("fee.str")
    fees = []
    for x in e:
        t = x["text"]
        marks = re.findall(r"system\.markFee\((\d+)\)", t)
        lv = re.findall(r"player\.levelup\((\d+)\)", t)
        gold = re.findall(r"player\.addGold\((\d+)\)", t)
        fees.append({"entry": x["i"], "markFee": marks, "levelup": lv,
                     "addGold": gold, "script": t})
    out["计费"] = {"fee_str": fees}

    g = entries_texts("GotoFee.str")
    gotofee = []
    for x in g:
        t = x["text"]
        if "=" not in t:
            continue
        k, v = t.split("=", 1)
        cols = [c.strip() for c in v.split("#")]
        gotofee.append({"key": k.strip(), "cols": cols})
    out["计费"]["GotoFee"] = gotofee

    # ---------------- 指令配置 (config_instruction) —— 实为一份满级角色配置
    e = entries_texts("config_instruction.str")
    sc3, fo3, tb3 = kv_of(e)
    out["指令配置"] = {"scalars": sc3, "formulas": fo3, "tables": tb3}

    # ---------------- 战斗布局 (config_fight) —— 纯坐标常量, 无公式
    e = entries_texts("config_fight.str")
    scf, fof, tbf = kv_of(e)
    out["战斗布局"] = {"scalars": scf, "tables": tbf}

    # ---------------- 游戏配置 (config_game)
    e = entries_texts("config_game.str")
    sc, fo, tb = kv_of(e)
    out["游戏配置"] = {"scalars": sc, "formulas": fo}

    # ---------------- 公式总表
    allf = {}
    for key, c in chars.items():
        for k, f in c["formulas"].items():
            allf["角色/%s/%s" % (key, k)] = f
    for k, f in out["游戏配置"]["formulas"].items():
        allf["游戏配置/%s" % k] = f
    e = entries_texts("config_fight.str")
    sc2, fo2, tb2 = kv_of(e)
    for k, f in fo2.items():
        allf["战斗配置/%s" % k] = f
    out["_公式总表"] = allf
    out["_公式总表_说明"] = {
        "expr": "原始表达式文本，未做任何改写；变量见 vars",
        "求值约定": "整数除法按 Java 语义(向零取整)；lv=等级 slv=仙术等级",
        "count": len(allf),
    }

    os.makedirs(os.path.join(DATA, "06-配置"), exist_ok=True)
    for k, v in out.items():
        p = os.path.join(DATA, "06-配置", "_汇总_%s.json" % k)
        with open(p, "w", encoding="utf-8") as f:
            json.dump(v, f, ensure_ascii=False, separators=(",", ":"))
    print("配置汇总:")
    for k, v in out.items():
        p = os.path.join(DATA, "06-配置", "_汇总_%s.json" % k)
        print("   %-10s %8.1f KB" % (k, os.path.getsize(p) / 1024))
    print("   公式总数 %d" % len(allf))


if __name__ == "__main__":
    main()