#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fightcfg.py — 《仙剑奇侠传-忘情篇》战斗配置/战斗脚本解析器

权威出处（反编译源码，CFR 0.152）
------------------------------------------------------------------
STR 容器格式 ('88STR')
    b.java:49-126   public static String[] a(InputStream)
      b.java:122    private static void a(DataInputStream)   ← magic 校验
      b.java:58     readShort()   → 条目数
      b.java:61     readUTF()     → 每个条目
    ⇒ 结构：
        '88' 'S' 'T' 'R' 0x06
        int16BE  count
        count × { int16BE len ; len 字节 modified-UTF8 }
    ⇒ 全程大端；UTF 为 DataInputStream.readUTF（modified UTF-8，
      BMP 中文与标准 UTF-8 同形，故直接 decode('utf-8') 可得）。

key=value 拆分（Hashtable 化）
    bg.java:14-25   private bg(String[])
      bg.java:19    indexOf(61)   ← 第一个 '='
      bg.java:20    key = substring(0,idx).trim()；key 为空或以 '#' 开头则丢弃
      bg.java:21    value = substring(idx+1).trim()

怪物属性表 (fight_N.str)  →  bm.java
战斗配置     (config_fight.str) → am.java:22-54
技能记录 12 列（'#' 分列，记录间 ',' 分隔） → bm.java:47 / af.java:22-36
战斗脚本（attacker.* / skill.* / player.*）
    ★ 不在任何 .str 里，而在 ANT 帧事件 tag 里：
      q.java:43-52   每帧播放时把 be.d（tag 字符串）回调给 aj 实现
      ax.java:779    a(Object,Object)  ← 脚本解释器
      d.java:81-90   be.d 的读取处（readBoolean → readUTF）
    ⇒ 本工具顺带解析 ANT 以取出这些脚本。

【质量要求】每个解析器都 assert 字节正好耗尽。
"""

import gzip
import json
import os
import struct
import sys

# ----------------------------------------------------------------------
# 路径
# ----------------------------------------------------------------------
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
STR_DIR = os.path.join(ROOT, "1-解包产物", "解包树", "str")
ANT_DIR = os.path.join(ROOT, "1-解包产物", "解包树", "ant")
OUT_DIR = os.path.join(ROOT, "3-数据", "06-配置")

FIGHT_STR = ["config_fight.str"] + ["fight_%d.str" % i for i in range(15)] + ["fight_egui.str"]

# 技能记录 12 列的权威列名（config_skill.str 第 0 行是表头，
# d.java:249 用同一套下标构造 af）
SKILL_COLS = [
    "技能类型",     # [0] af.b 元素/系
    "攻击类型",     # [1] af.c 是否「增益」
    "名字",         # [2] af.d 技能名
    "攻击",         # [3] af.e 动画名
    "群体",         # [4] af.f 「是」= 群体
    "接近X",        # [5] af.g
    "接近Y",        # [6] af.h
    "标志2",        # [7] af.i
    "气消耗",       # [8] af.j
    "神消耗",       # [9] af.k
    "伤害公式",     # [10] af.n  ★表达式
    "技能介绍",     # [11] af.l
]

# config_fight.str 的键 → am.java 静态字段（am.java:27-47）
CONFIG_FIGHT_KEYS = {
    "战斗背景W":               ("bgW",            "am.java:44", "读取但未使用"),
    "战斗背景H":               ("bgH",            "am.java:45", "读取但未使用"),
    "英雄1的X坐标":            ("heroX0",         "am.java:27", "am.a[0]"),
    "英雄1的Y坐标":            ("heroY0",         "am.java:28", "am.b[0]"),
    "英雄2的X坐标":            ("heroX1",         "am.java:27", "am.a[1]"),
    "英雄2的Y坐标":            ("heroY1",         "am.java:28", "am.b[1]"),
    "英雄3的X坐标":            ("heroX2",         "am.java:27", "am.a[2]"),
    "英雄3的Y坐标":            ("heroY2",         "am.java:28", "am.b[2]"),
    "敌兵1的X坐标":            ("foeX0",          "am.java:33", "am.c[0]"),
    "敌兵1的Y坐标":            ("foeY0",          "am.java:34", "am.d[0]"),
    "敌兵2的X坐标":            ("foeX1",          "am.java:33", "am.c[1]"),
    "敌兵2的Y坐标":            ("foeY1",          "am.java:34", "am.d[1]"),
    "敌兵3的X坐标":            ("foeX2",          "am.java:33", "am.c[2]"),
    "敌兵3的Y坐标":            ("foeY2",          "am.java:34", "am.d[2]"),
    "攻击距离":                ("attackRange",    "am.java:37", "am.l"),
    "战斗数值水平最大速度":    ("_unused_hmax",   "am.java:38", "★读取后丢弃"),
    "战斗数值垂直速度":        ("numRiseV",       "am.java:39", "am.f"),
    "战斗数值垂直加速度":      ("_unused_vacc",   "am.java:40", "★读取后丢弃"),
    "战斗数值的水平偏移量":    ("numOffX",        "am.java:41", "am.g"),
    "战斗数值的垂直偏移量":    ("numOffY",        "am.java:42", "am.h"),
    "战斗数值的显示时间":      ("numLifeMs",      "am.java:43", "am.i"),
    "速度条的实际可用长度":    ("gaugeLenUsable", "am.java:46", "am.j"),
    "速度条的实际技能长度":    ("gaugeLenSkill",  "am.java:47", "am.k"),
}

# fight_N.str 的键 → bm.java 字段
MONSTER_KEYS = {
    "名字":                ("name",         "bm.java:28", "bm.c → g.b（战斗显示名）"),
    "ID":                  ("antId",        "bm.java:29", "bm.a → 决定 fight_<antId>.ant"),
    "战斗位置":            ("_unused_pos",  "bm.java:31", "★读取后丢弃"),
    "使用药品的概率":      ("drugPct",      "bm.java:32", "bm.l → g.w"),
    "最小生命":            ("hpMin",        "bm.java:33", "bm.d → g.k(J) / g.j(I)"),
    "最大生命":            ("hpMax",        "bm.java:33", "同���"),
    "最小速度":            ("spdMin",       "bm.java:35", "bm.e → g.n(Q)"),
    "最大速度":            ("spdMax",       "bm.java:35", "同���"),
    "仙术速度":            ("slvSpeed",     "bm.java:36", "bm.f → g.c（ax.c 仙术速度）"),
    "攻击值":              ("atk",          "bm.java:37", "bm.g → g.g(K)"),
    "运":                  ("luck",         "bm.java:38", "bm.h → g.p(S)"),
    "攻击时增加的气值":    ("qGain",        "bm.java:39", "bm.k → g.o(R)"),
    "最小经验":            ("expMin",       "bm.java:40", "bm.i"),
    "最大经验":            ("expMax",       "bm.java:40", "同���"),
    "最小金钱":            ("goldMin",      "bm.java:41", "bm.j"),
    "最大金钱":            ("goldMax",      "bm.java:41", "同���"),
    "普通技能":            ("skillsBasic",  "bm.java:42-49", "bm.m → g.t"),
    "仙术技能":            ("skillsSpell",  "bm.java:50-57", "bm.n → g.u"),
    "携带物品":            ("carry",        "bm.java:58-64", "bm.p → g.k（背包）"),
    "掉落物品":            ("drop",         "bm.java:65-71", "bm.o"),
}


# ----------------------------------------------------------------------
# 1. STR 容器  (b.java:49-126)
# ----------------------------------------------------------------------
def gunzip(path):
    raw = open(path, "rb").read()
    if raw[:2] == b"\x1f\x8b":
        return gzip.decompress(raw)
    return raw


def parse_str_raw(data):
    """返回 (条目字符串列表, 消耗字节数)。不解释 key=value。"""
    # b.java:122  private static void a(DataInputStream)  ← magic 校验
    if len(data) < 5:
        raise ValueError("STR 太短")
    if data[0] != 0x88 or data[1:4] != b"STR" or data[4] != 6:
        raise ValueError("STR magic/版本不正确: %r" % data[:5])
    p = 5
    # b.java:58  readShort() → 条目数（大端）
    count = struct.unpack_from(">H", data, p)[0]
    p += 2
    out = []
    for _ in range(count):
        # b.java:61  readUTF() = int16 长度 + 字节
        ln = struct.unpack_from(">H", data, p)[0]
        p += 2
        out.append(data[p:p + ln].decode("utf-8"))
        p += ln
    # 质量标准 8.2：字节正好耗尽
    assert p == len(data), "STR 残留 %d 字节 (已读 %d / 共 %d)" % (len(data) - p, p, len(data))
    return out, p


def parse_str_kv(data):
    """bg.java:14-25 的 key=value 语义。返回 {key: value}（有序 dict）。"""
    items, _ = parse_str_raw(data)
    kv = {}
    for it in items:                                    # bg.java:17
        i = it.find("=")                                # bg.java:19  indexOf(61)
        if i == -1:
            continue
        k = it[:i].strip()                              # bg.java:20
        if not k or k[0] == "#":                        # bg.java:20
            continue
        kv[k] = it[i + 1:].strip()                      # bg.java:21
    return kv


# ----------------------------------------------------------------------
# 2. ANT 容器（只为取战斗脚本 tag）  d.java:20-123
# ----------------------------------------------------------------------
class _R(object):
    __slots__ = ("b", "p")

    def __init__(self, b):
        self.b = b
        self.p = 0

    def raw(self, n):
        v = self.b[self.p:self.p + n]
        if len(v) != n:
            raise EOFError("ANT 提前结束 @%d want %d" % (self.p, n))
        self.p += n
        return v

    def u1(self):
        return struct.unpack(">B", self.raw(1))[0]

    def i2(self):
        return struct.unpack(">h", self.raw(2))[0]

    def i4(self):
        return struct.unpack(">i", self.raw(4))[0]

    def i8(self):
        return struct.unpack(">q", self.raw(8))[0]

    def utf(self):
        n = struct.unpack(">H", self.raw(2))[0]        # readUTF 的 2 字节长度
        return self.raw(n).decode("utf-8", "replace")


def parse_ant(data):
    """d.java:20-123。返回 dict；只保留命名状态与帧事件 tag（战斗脚本用）。"""
    r = _R(data)
    if r.raw(4) != b"\x88ANT":
        raise ValueError("ANT magic 错误")
    if r.u1() != 2:                                     # d.java:32  版本必须 2
        raise ValueError("ANT 版本 != 2")
    if r.u1():                                         # d.java:35  扩展头
        r.i2()
        r.i2()
    n = r.i2()                                          # d.java:39  裁剪表条数
    for _ in range(n):
        r.i2(); r.i4(); r.i4(); r.i4(); r.i4()          # d.java:42
    m = r.i2()                                          # d.java:45  图层组数
    for _ in range(m):
        c = r.i2()                                      # d.java:48
        for _ in range(c):
            r.i2(); r.i4(); r.i4(); r.u1()              # d.java:51  末位是 flags
    s = r.i2()                                          # d.java:57  命名状态数
    states = []
    for _ in range(s):
        name = r.utf()                                  # d.java:61
        tag = r.utf() if r.u1() else None               # d.java:62
        nb = r.i2()                                     # d.java:73
        frames = []
        for _ in range(nb):
            r.i2(); r.i4(); r.i4(); r.i8()              # d.java:77-80
            ftag = r.utf() if r.u1() else None          # d.java:81-83  ★be.d
            for _ in range(r.i2()):                     # d.java:93-95  正向事件盒
                r.i4(); r.i4(); r.i4(); r.i4()
                if r.u1():
                    r.utf()
            for _ in range(r.i2()):                     # d.java:99-101 反向事件盒
                r.i4(); r.i4(); r.i4(); r.i4()
                r.utf()
            frames.append({"durMs": None, "tag": ftag})
        states.append({"name": name, "tag": tag, "frames": frames})
    assert r.p == len(data), "ANT 残留 %d 字节" % (len(data) - r.p)
    return {"states": states}


def ant_battle_scripts(path):
    """返回 [(状态名, 帧序号, 脚本文本)]，脚本文本含 '\\n' 分隔的多条指令。"""
    a = parse_ant(gunzip(path))
    out = []
    for st in a["states"]:
        for k, fr in enumerate(st["frames"]):
            if fr["tag"]:
                out.append((st["name"], k, fr["tag"]))
    return out


# ----------------------------------------------------------------------
# 3. 技能记录 12 列  (bm.java:47 / af.java:22-36)
# ----------------------------------------------------------------------
ELEMENT_MAP = [("普通", 0), ("水系", 1), ("雷系", 2), ("火系", 3),
               ("风系", 4), ("土系", 5), ("双系", 6)]   # af.java:24，其余→7


def parse_skill_record(rec, index):
    f = rec.split("#")                                  # bm.java:46  j.a(rec,"#")
    if len(f) < 11:
        raise ValueError("技能记录列数不足(%d): %r" % (len(f), rec))
    g = lambda k: f[k] if k < len(f) else None          # bm.java:47 f.length>11?f[11]:null
    elem = 7                                            # af.java:24 else 分支
    for name, code in ELEMENT_MAP:
        if f[0] == name:
            elem = code
            break
    return {
        "index": index,                                  # af.a ← bm.java:47 第 1 参
        "elemName": f[0].strip(),
        "elem": elem,
        "elemSrc": "af.java:24",
        "isBuff": f[1].strip() == "增益",                 # af.java:25
        "name": f[2].strip(),                            # af.java:26 (bm.java:47 .trim())
        "anim": f[3].strip(),                            # af.java:27
        "isAoE": f[4].strip() == "是",                    # af.java:28  af.f
        "approachX": _try_int(f[5]),                     # af.java:29  af.g
        "approachY": _try_int(f[6]),                     # af.java:30  af.h
        "flag2": f[7].strip() == "是",                    # af.java:31  af.i
        "qiCost": _try_int(f[8]),                        # af.java:32  af.j  气消耗
        "shenCost": _try_int(f[9]),                      # af.java:33  af.k  神消耗
        "dmgExpr": g(10),                                # af.java:34  af.n ★
        "script": g(11),                                 # af.java:35  af.l
        "cols": len(f),
        "src": "bm.java:47",
    }


def _try_int(s):
    try:
        return int(s.strip())
    except Exception:
        return None


# ----------------------------------------------------------------------
# 4. config_fight.str / fight_N.str
# ----------------------------------------------------------------------
def load_config_fight():
    kv = parse_str_kv(gunzip(os.path.join(STR_DIR, "config_fight.str")))
    out = {"_src": "am.java:22-54", "_keys": {}}
    for k, (field, src, note) in CONFIG_FIGHT_KEYS.items():
        if k not in kv:
            continue
        out[field] = _try_int(kv[k])
        out["_keys"][field] = {"key": k, "src": src, "note": note}
    # ax.java:49  W = 1000 * am.k / am.j   ← 类加载时算一次，整数除法
    j = out.get("gaugeLenUsable")
    k_ = out.get("gaugeLenSkill")
    out["gaugeTriggerW"] = (1000 * k_) // j if (j and k_ is not None) else None
    out["_keys"]["gaugeTriggerW"] = {
        "key": "(derived)",
        "src": "ax.java:49",
        "note": "W = 1000 * 速度条的实际技能长度 / 速度条的实际可用长度 = 1000*135/180 = 750",
    }
    return out


def load_monster(fname):
    kv = parse_str_kv(gunzip(os.path.join(STR_DIR, fname)))
    m = {"_file": fname, "_src": "bm.java:25-72", "_keys": {}}
    for k, (field, src, note) in MONSTER_KEYS.items():
        if k not in kv:
            continue
        raw = kv[k]
        m[field] = raw
        m["_keys"][field] = {"key": k, "src": src, "note": note}
    # bm.java:42-49 / 50-57
    m["skillsBasicParsed"] = [
        parse_skill_record(r, i)
        for i, r in enumerate((kv.get("普通技能") or "").split(","))
    ]
    m["skillsSpellParsed"] = [
        parse_skill_record(r, i)
        for i, r in enumerate((kv.get("仙术技能") or "").split(","))
    ]
    # bm.java:58-71  物品「名(数量)」；f.java:323 只取括号里的整数
    def items(s):
        out = []
        for r in (s or "").split(","):
            r = r.strip()
            if "(" in r:
                nm = r[:r.index("(")]
                q = _try_int(r[r.index("(") + 1:r.rindex(")")])
            else:
                nm, q = r, None
            out.append({"name": nm, "qty": q})
        return out
    m["carryParsed"] = items(kv.get("携带物品"))
    m["dropParsed"] = items(kv.get("掉落物品"))
    return m


# ----------------------------------------------------------------------
# 5. 战斗脚本（从 ANT 帧事件 tag 提取）
# ----------------------------------------------------------------------
def load_battle_scripts():
    """ax.java:779 a(Object,Object) 支持的全部指令 + 各技能实际脚本。

    脚本宿主：q.java:43-52 在每帧播放时把 be.d 回调给 aj；
    战斗中实际的实现类是 ax（玩家 bd / 怪物 g）。
    """
    files = ["fight_skill.ant", "fight_cl.ant", "fight_lyr.ant", "fight_zx.ant"]
    files += sorted(f for f in os.listdir(ANT_DIR)
                    if f.startswith("fight_") and f.endswith(".ant")
                    and f not in files and f != "fight_ui.ant")
    res = {}
    for fn in files:
        p = os.path.join(ANT_DIR, fn)
        if not os.path.exists(p):
            continue
        res[fn] = [{"state": st, "frame": k, "script": sc}
                   for st, k, sc in ant_battle_scripts(p)]
    return res


# ----------------------------------------------------------------------
# main
# ----------------------------------------------------------------------
def main():
    # 覆盖率报告（质量标准 8.3）
    report = {"str": {}, "ant": {}}
    for fn in FIGHT_STR:
        p = os.path.join(STR_DIR, fn)
        if not os.path.exists(p):
            report["str"][fn] = "缺失"
            continue
        items, used = parse_str_raw(gunzip(p))
        report["str"][fn] = {"entries": len(items), "bytes": used, "exhausted": True}

    data = {
        "_format": {
            "str": {
                "magic": "88 53 54 52 06",
                "layout": "int16BE count; count × { int16BE len ; len bytes modified-UTF8 }",
                "endian": "big",
                "src": "b.java:49-126",
                "kvSplit": "bg.java:14-25  第一个 '='；key 以 '#' 开头则丢弃",
            },
            "skillRecord": {
                "sepRecord": ",",
                "sepCol": "#",
                "cols": SKILL_COLS,
                "src": "bm.java:42-57 / af.java:22-36",
            },
            "battleScript": {
                "location": "ANT 帧事件 tag（不是 .str）",
                "readAt": "d.java:81-83 (be.d)",
                "dispatchAt": "q.java:43-52 → aj.a(tag, actor)",
                "interpretAt": "ax.java:779-1145",
            },
        },
        "coverage": report,
        "configFight": load_config_fight(),
        "monsters": {},
        "battleScripts": load_battle_scripts(),
    }
    for fn in FIGHT_STR:
        if fn == "config_fight.str":
            continue
        if os.path.exists(os.path.join(STR_DIR, fn)):
            data["monsters"][fn] = load_monster(fn)

    if not os.path.isdir(OUT_DIR):
        os.makedirs(OUT_DIR)
    dst = os.path.join(OUT_DIR, "战斗配置.json")
    with open(dst, "w") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=1)
    print("写出 %s" % dst)
    for fn, v in sorted(report["str"].items()):
        print("  %-20s %s" % (fn, v))
    return 0


if __name__ == "__main__":
    sys.exit(main())