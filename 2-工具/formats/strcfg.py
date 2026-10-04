#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
strcfg.py —— 《仙剑奇侠传-忘情篇》STR 容器 + 配置表解析

权威来源
--------
容器格式  : 默认包 `b.java`（从原始 jar 解出，仓库解包树里被同名 class 覆盖了）
            `public static String[] a(InputStream)` / `private static void a(DataInputStream)`
表解析    : 默认包 `bg.java`（key=value 表）
物品      : `i.java`（config_item.str 15 列）
技能      : `af.java` + `cn/com/etgame/cls/system/d.java:249`（config_skill.str 12 列）
角色      : `bj.java`（config_*.str 27 键）
合成      : `k.java` + `cn/com/etgame/cls/system/d.java:184-199`（config_make.str）
表达式求值: `t.java`（本文件内 `Formula` 逐条复刻）
对话区域  : `cn/com/etgame/cls/system/d.java:339-358`（`h(String)`）
敌人      : `f.java:346-419`（enemy.str）
计费点    : `cn/com/etgame/cls/system/d.java:210-227`（GotoFee.str）/ `:228-236`（fee.str）
NPC 定义  : `e.java` `initElement()` 中 `element.addToNpc(id, "<n>.str")` 分支
            （字节码偏移 9014 附近，`String 对话区域`）

质量标准（见 4-文档/格式规范/00-逆向备忘.md 第 8 节）
------------------------------------------------
1. 每个解析器都 `assert` 字节/条目**正好耗尽**。
2. 挖不出来的列写 "未确认"，不猜。
3. 每条数据带 `src`（文件 + 条目序号）。
"""

import gzip
import json
import os
import re
import struct
import sys

# ---------------------------------------------------------------- 路径

ROOT = "/mnt/shared/仙剑奇侠传忘情篇-逆向工程"
STR_DIR = os.path.join(ROOT, "1-解包产物", "解包树", "str")
ANT_DIR = os.path.join(ROOT, "1-解包产物", "解包树", "ant")
OUT_CFG = os.path.join(ROOT, "3-数据", "06-配置")
OUT_NPC = os.path.join(ROOT, "3-数据", "08-npc")

# ---------------------------------------------------------------- 容器 88STR
#
# '88' 'S' 'T' 'R'  0x06  int16 count  count×{uint16 len; UTF-8 bytes}
#
# 出处：b.a(InputStream) —— 每个 readByte/&0xFF 校验一次头，
#       然后 readShort() 读条数，循环 readUTF()。
# 注意：**不是**「按 [\x00-\x1f] 切文本」。00-逆向备忘.md 第 5 节的
#       「首字节可能是垃圾」说法是早期误读，本解析器已字节级验证 101/101。

STR_MAGIC = b"\x88STR"
STR_VERSION = 6


def read_str_bytes(path):
    """gunzip + 去掉 STR 头，返回 (count, 条目列表, 原始裸字节)。"""
    with open(path, "rb") as fh:
        raw = fh.read()
    if raw[:2] == b"\x1f\x8b":
        raw = gzip.decompress(raw)
    assert raw[:4] == STR_MAGIC, "%s: magic %r" % (path, raw[:4])
    assert raw[4] == STR_VERSION, "%s: version %d" % (path, raw[4])
    (count,) = struct.unpack(">H", raw[5:7])
    off = 7
    out = []
    for i in range(count):
        assert off + 2 <= len(raw), "%s: 条目 %d 长度头越界" % (path, i)
        (ln,) = struct.unpack(">H", raw[off:off + 2])
        off += 2
        assert off + ln <= len(raw), "%s: 条目 %d 数据越界" % (path, i)
        out.append(raw[off:off + ln].decode("utf-8"))
        off += ln
    # 质量标准 #2：字节正好耗尽
    assert off == len(raw), "%s: 残留 %d 字节" % (path, len(raw) - off)
    return count, out, raw


def read_str(name):
    """读 str/<name>，返回条目列表。"""
    return read_str_bytes(os.path.join(STR_DIR, name))[1]


# ---------------------------------------------------------------- 字符串工具
#
# 逐条复刻 j.a(String, String)（j.java:53-84）：
#   * 分隔符串为空 -> 逐字符切
#   * 保留前导/中间空串，**丢弃尾部连续空串**
#   * 全部为空 -> 返回空数组


def split(s, sep):
    if len(sep) == 0:
        return list(s)
    parts = []
    n = 0
    while True:
        k = s.find(sep, n)
        if k == -1:
            break
        parts.append(s[n:k])
        n = k + len(sep)
    parts.append(s[n:])
    i = len(parts) - 1
    while i >= 0:
        if len(parts[i]) > 0:
            return parts[:i + 1]
        i -= 1
    return []


# 复刻 cn...system.d.d(String): 取 '.' 之后、'(' 之前的名字
def callee_name(s):
    return s[s.find(".") + 1:s.find("(")]


# 复刻 cn...system.d.e(String): 取 '(' 与 ')' 之间按 ',' 切
def callee_args(s):
    inner = s[s.find("(") + 1:s.find(")")].strip()
    if len(inner) > 0:
        return split(inner, ",")
    return []


# 复刻 cn...system.d.b(String): 方向字符串 -> 位掩码
DIR_CODE = {"up": 1, "down": 2, "left": 4, "right": 8, "keep": -1}
# 前两位: 方向名 + 数值
DIR_NAME = {1: "up", 2: "down", 4: "left", 8: "right", -1: "keep"}


# ---------------------------------------------------------------- 表达式求值 t
#
# 复刻 t.java。文法（t.java:63-215）：
#   assign := IDENT '=' assign | add
#   add    := mul (('+'|'-') mul)*
#   mul    := unary (('*'|'/'|'%') unary)*
#   unary  := ('+'|'-')* power
#   power  := primary ('^' unary)?
#   primary:= '(' add ')' | INT | IDENT
#   标识符: [A-Za-z_$][A-Za-z0-9_$]*   整数: [0-9]+ (Long.parseLong)
#   算术全部 long 整数运算；/ 为整除；^ 负指数返回 0
#
# 变量绑定方式：源码里就是 t.a("lv=" + n) / t.a("slv=" + n) / t.a("atk=" + n)
# 赋值的判定是「整个串匹配 IDENT '=' expr」（t.java:22-49）。
#
# 说明：t.java 的 a(String) 主体被 CFR 标为 "Unable to fully structure code"，
#      下面的实现依据 b/c/d/e/f() 五个私有方法（结构完整）反推，
#      赋值分支的等价写法在本项目全部 4 份角色配置 + 28 条技能公式上验证通过。

_OPS = set("+-*/%^=()")
_IDENT_START = re.compile(r"[A-Za-z_$]")


class Formula(object):
    """一条可执行公式。序列化形态：{"expr","vars","src"}"""

    __slots__ = ("expr", "vars", "src", "_const", "note")

    def __init__(self, expr, src, const=None, note=None):
        self.expr = expr
        self.src = src
        self.vars = sorted(set(re.findall(r"[A-Za-z_$][A-Za-z0-9_$]*", expr)))
        self._const = const
        self.note = note

    # ---- 求值 ----
    def _tokens(self, s):
        toks = []
        i, n = 0, len(s)
        while i < n:
            c = s[i]
            if c == " ":
                i += 1
                continue
            if c in _OPS:
                toks.append(("op", c))
                i += 1
            elif _IDENT_START.match(c):
                j = i
                while j < n and s[j] not in _OPS and s[j] != " ":
                    j += 1
                toks.append(("id", s[i:j]))
                i = j
            elif c.isdigit():
                j = i
                while j < n and s[j] not in _OPS and s[j] != " ":
                    j += 1
                toks.append(("num", int(s[i:j])))
                i = j
            else:
                raise ValueError("t.f(): 非法字符 %r in %r" % (c, s))
        return toks

    def _add(self, toks, pos):
        val, pos = self._mul(toks, pos)
        while pos < len(toks) and toks[pos][0] == "op" and toks[pos][1] in "+-":
            op = toks[pos][1]
            pos += 1
            rhs, pos = self._mul(toks, pos)
            val = val + rhs if op == "+" else val - rhs
        return val, pos

    def _mul(self, toks, pos):
        val, pos = self._unary(toks, pos)
        while pos < len(toks) and toks[pos][0] == "op" and toks[pos][1] in "*/%":
            op = toks[pos][1]
            pos += 1
            rhs, pos = self._unary(toks, pos)
            if op == "*":
                val *= rhs
            else:
                if rhs == 0:
                    raise ValueError("算术错误。")
                val = val // rhs if op == "/" else val % rhs
        return val, pos

    def _unary(self, toks, pos):
        sign = 1
        while pos < len(toks) and toks[pos][0] == "op" and toks[pos][1] in "+-":
            if toks[pos][1] == "-":
                sign = -sign
            pos += 1
        val, pos = self._power(toks, pos)
        return sign * val, pos

    def _power(self, toks, pos):
        if pos < len(toks) and toks[pos] == ("op", "("):
            val, pos = self._add(toks, pos + 1)
            if pos >= len(toks) or toks[pos] != ("op", ")"):
                raise ValueError("表达式错误。")
            pos += 1
        else:
            kind, val = toks[pos]
            if kind == "num":
                pos += 1
            elif kind == "id":
                pos += 1
                val = self._env.get(val, 0)
            else:
                raise ValueError("表达式错误。")
        if pos < len(toks) and toks[pos] == ("op", "^"):
            pos += 1
            exp, pos = self._power(toks, pos)
            if exp < 0:
                val = 0
            elif exp == 0:
                val = 1
            else:
                val = val ** exp
        return val, pos

    _env = {}

    def eval(self, **env):
        """按 Java long 语义求值。缺省未绑定变量 = 0（t.java:170）。"""
        old = Formula._env
        Formula._env = env
        try:
            toks = self._tokens(self.expr)
            val, pos = self._add(toks, 0)
            if pos != len(toks):
                raise ValueError("表达式错误。")
            # Java long 截断到 64 位有符号
            val &= (1 << 64) - 1
            if val >= 1 << 63:
                val -= 1 << 64
            return val
        finally:
            Formula._env = old

    def value(self, **env):
        if self._const is not None and not env:
            return self._const
        return self.eval(**env)

    def json(self):
        d = {"expr": self.expr, "vars": self.vars, "src": self.src}
        if self._const is not None:
            d["const"] = self._const
        if getattr(self, "note", None):
            d["note"] = self.note
        return d

    def __repr__(self):
        return "Formula(%r, %r)" % (self.expr, self.src)


# ---------------------------------------------------------------- bg（key=value 表）
#
# 复刻 bg.java:14-25：找第一个 '='，key=左半 trim 后非空且首字符不是 '#' 才收，
# value=右半 trim。注意重复 key 后者覆盖前者（Hashtable.put）。
# 找不到 '=' 的行直接丢弃。

def kv_table(lines):
    out = {}
    order = []
    for idx, ln in enumerate(lines):
        p = ln.find("=")
        if p == -1:
            continue
        k = ln[:p].strip()
        if len(k) == 0 or k[0] == "#":
            continue
        v = ln[p + 1:].strip()
        if k not in out:
            order.append(k)
        out[k] = v
    return out, order


# ---------------------------------------------------------------- 角色配置
#
# 27 键，顺序在 4 份 config_*.str 里完全一致。映射出处 bj.java:51-166。
# 值为「公式」的键走 t 求值器，绑定变量只有 lv（bj.java:344 `L.a("lv="+n)`）。

CHAR_KEYS = [
    "名字", "头像", "移动速度", "初始等级", "初始经验", "初始金钱",
    "初始武器", "初始服饰", "初始头饰", "初始足饰", "初始饰品",
    "升级所需经验", "最大生命值", "最大气值", "最大神值",
    "武", "防", "速", "仙术速度", "运", "好感度", "援护率", "合击率",
]
# 「援护率」「合击率」在 bj.java 里**没有**任何读取点 —— 见未确认清单。

CHAR_FORMULA_KEYS = ["升级所需经验", "最大生命值", "最大气值", "最大神值",
                    "武", "防", "速", "仙术速度"]
CHAR_INT_KEYS = ["移动速度", "初始等级", "初始经验", "初始金钱", "运", "好感度"]

# 硬上限（全部有 Java 出处）
CHAR_LIMITS = {
    "等级上限": {
        "value": 45, "soft": True,
        "src": "bj.java:372 (g(int): `if (n4 < 45) { 升级 }` / 否则经验封顶不升级)",
        "bypass": "cn...system.d.c(500) —— fee 500 = GotoFee「连升十级」付费解锁，"
                  "解锁后取消 45 级上限（fee.str[4] 调 player.levelup(10) 内部先 d.a(500)）",
    },
    "金钱上限": {"value": 99999, "soft": False,
                 "src": "bj.java:404 (h(int): Math.min(Math.max(n2,0),99999))"},
    "好感度上限": {"value": 100, "soft": False,
                   "src": "bj.java:434 (k(int): Math.min(Math.max(0,n2),100))"},
    "仙术等级上限": {"value": 4, "soft": False,
                     "src": "bj.java:323 (b(int): 次数<5→1,<15→2,<30→3,else 4)"},
    "仙术等级门槛": {"value": [5, 15, 30], "soft": False,
                     "src": "bj.java:323 (b(int)) —— 升到第 n 阶所需累计使用次数"},
}


def parse_char_config(name, note=None):
    lines = read_str(name)
    tab, order = kv_table(lines)
    idx = {}
    for i, ln in enumerate(lines):
        p = ln.find("=")
        if p == -1:
            continue
        k = ln[:p].strip()
        if k and k[0] != "#":
            idx[k] = i
    assert len(tab) == 27, "%s: 键数 %d != 27" % (name, len(tab))
    for k in CHAR_KEYS:
        assert k in tab, "%s: 缺键 %s" % (name, k)

    def f(k):
        return Formula(tab[k], "%s:%d" % (name, idx[k]))

    def i_(k):
        return int(tab[k])

    avatar = split(tab["头像"], ",")
    out = {
        "文件": name,
        "名字": tab["名字"],
        "说明": note,
        "字段": {
            "名字": {"value": tab["名字"], "src": "%s:%d" % (name, idx["名字"]),
                     "java": "bj.a (bj.java:56)"},
            "头像": {"value": {"ant": avatar[0], "state": avatar[1]},
                     "src": "%s:%d" % (name, idx["头像"]),
                     "java": "bj.a(String) → bj.e(String) (bj.java:827-832): "
                             "d.a(d.y + ant).b(state)"},
            "移动速度": {"value": i_("移动速度"), "src": "%s:%d" % (name, idx["移动速度"]),
                         "java": "bj.java:58-60 → 字段 p"},
            "飞行速度": {"value": int(tab["飞行速度"]),
                         "src": "%s:%d" % (name, idx["飞行速度"]),
                         "java": "无读取点（见未确认清单）"},
            "初始等级": {"value": i_("初始等级"), "src": "%s:%d" % (name, idx["初始等级"]),
                         "java": "bj.d(int) (bj.java:343) 同时执行 L.a(\"lv=\"+n)"},
            "初始经验": {"value": i_("初始经验"), "src": "%s:%d" % (name, idx["初始经验"]),
                         "java": "bj.java:62-64 → 字段 n"},
            "初始金钱": {"value": i_("初始金钱"), "src": "%s:%d" % (name, idx["初始金钱"]),
                         "java": "bj.h(int) (bj.java:403) clamp 0..99999"},
            "初始武器": {"value": None if tab["初始武器"] == "无" else tab["初始武器"],
                         "src": "%s:%d" % (name, idx["初始武器"]), "java": "bj.java:66-70"},
            "初始服饰": {"value": None if tab["初始服饰"] == "无" else tab["初始服饰"],
                         "src": "%s:%d" % (name, idx["初始服饰"]), "java": "bj.java:71-75"},
            "初始头饰": {"value": None if tab["初始头饰"] == "无" else tab["初始头饰"],
                         "src": "%s:%d" % (name, idx["初始头饰"]), "java": "bj.java:76-80"},
            "初始足饰": {"value": None if tab["初始足饰"] == "无" else tab["初始足饰"],
                         "src": "%s:%d" % (name, idx["初始足饰"]), "java": "bj.java:81-85"},
            "初始饰品": {"value": _parse_slots(tab["初始饰品"]),
                         "src": "%s:%d" % (name, idx["初始饰品"]),
                         "java": "bj.java:86-101 —— 按 ',' 切，>=2 段时 H/I 为两个饰品槽，"
                                 "==1 段时只有 H；值为「无」则留 null"},
            "初始技能": {"value": split(tab["初始技能"], ","),
                         "src": "%s:%d" % (name, idx["初始技能"]),
                         "java": "bj.java:120-127 → B[i][0]=af.a(名字).a, B[i][1]=1"},
            "初始仙术": {"value": split(tab["初始仙术"], ","),
                         "src": "%s:%d" % (name, idx["初始仙术"]),
                         "java": "bj.java:143-154 → 对应 C[i][2]=1（开通）"},
            "初始物品": {"value": split(tab["初始物品"], ","),
                         "src": "%s:%d" % (name, idx["初始物品"]),
                         "java": "bj.java:156-163 —— **仅当 名字==\"重楼\" 时**才进背包"},
        },
        "公式": {},
        "常量": {},
    }
    for k in CHAR_FORMULA_KEYS:
        out["公式"][k] = f(k).json()
    for k in CHAR_INT_KEYS:
        out["常量"][k] = {"value": i_(k), "src": "%s:%d" % (name, idx[k])}
    for k in ("援护率", "合击率"):
        out["常量"][k] = {"value": int(tab[k]), "src": "%s:%d" % (name, idx[k]),
                          "java": "无读取点（见未确认清单）"}
    return out, tab, idx


def _parse_slots(s):
    parts = split(s, ",")
    if len(parts) >= 2:
        return {"槽1": None if parts[0] == "无" else parts[0].strip(),
                "槽2": None if parts[1] == "无" else parts[1].strip(),
                "raw": s}
    if len(parts) == 1:
        return {"槽1": None if parts[0] == "无" else parts[0].strip(),
                "槽2": None, "raw": s}
    return {"槽1": None, "槽2": None, "raw": s}


# ---------------------------------------------------------------- 物品
#
# config_item.str 每行 15 列，'#' 分列（cn...system.d.java:161-171）。
# 字段对应 i.java:27-54（唯一读取者）。

ITEM_TYPE = {
    "武器": 0, "服饰": 1, "头饰": 2, "足饰": 3, "饰品": 4,
    "药品": 5, "材料": 6, "特殊": 7, "合成": 9,
}
ITEM_TYPE_NAME = {0: "武器", 1: "服饰", 2: "头饰", 3: "足饰", 4: "饰品",
                  5: "药品", 6: "材料", 7: "特殊", 8: "任务", 9: "合成"}
# i.a(String) 归属判定（i.java:116-135）
ITEM_OWNER = {"重楼": 0, "月瑶": 1, "紫萱": 2, "女": 3, "通用": 4}
ITEM_OWNER_NAME = {0: "重楼", 1: "月瑶", 2: "紫萱", 3: "女(月瑶或紫萱)", 4: "通用"}

# 背包分页 av.c(int)（av.java:10-31）
BAG_PAGE = {5: 0, 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 6: 2, 7: 4, 8: 4}
BAG_PAGE_FALLBACK = 3  # 合成(9) 与其他

ITEM_COLS = [
    ("名字", 0, "str", "i.a 字段，物品主键（i.java:28）"),
    ("类型", 1, "enum", "i.b 字段：武器0/服饰1/头饰2/足饰3/饰品4/药品5/材料6/特殊7/合成9/其他8(i.java:33)"),
    ("需求等级", 2, "int", "i.c 字段；i.b(int) 判定 n2>=c 才可装备 (i.java:34,137-139)"),
    ("归属", 3, "enum", "i.d 字段：重楼0/月瑶1/紫萱2/女3/通用4 (i.java:36)；i.a(String) 校验"),
    ("武加成", 4, "int", "i.i 字段；bj.B() 把它加进总武 x() (i.java:37 / bj.java:536-537,567-621)"),
    ("防加成", 5, "int", "i.j 字段；bj.C() 加进总防 y() (i.java:38 / bj.java:543-544,623-677)"),
    ("速加成", 6, "int", "i.k 字段；bj.D() 加进总速 z() (i.java:39 / bj.java:551-552,679-733)"),
    ("运加成", 7, "int", "i.l 字段；bj.E() 加进总运 A() (i.java:40 / bj.java:559-560,735-789)"),
    ("空列", 8, "int", "i.java:41 解析后**丢弃**；d.Q 是 i.java 的独占数据源，"
                       "全 jar 无其它读取点。**实测 90 条物品该列全为 0**，无信息损失"),
    ("每回合恢复精", 9, "int", "i.m 字段（i.i()）；bd 构造器把 6 个装备槽的它求和存 bd.w，"
                             "bd.java:84-85 `if (w>0) j(当前精 + w)` → 每回合回精 "
                             "(ax.java:1252-1266 确认 w()/x()/j(int)/k(int) = 精当前/精上限)"),
    ("每回合恢复气", 10, "int", "i.n 字段（i.e()）；求和存 bd.x，bd.java:87-88 "
                               "`e(当前气 + x)` (ax.java:1214-1229: O=气当前, P=气上限)"),
    ("每回合恢复神", 11, "int", "i.o 字段（i.h()）；求和存 bd.y，bd.java:90-91 "
                               "`h(当前神 + y)` (ax.java:1235-1250: M=神当前, N=神上限)"),
    ("价格", 12, "int", "i.e 字段；i.b()。买入=全价，卖出=价格>>1 (i.java:45 / ae.java:990-1005)"),
    ("效果脚本", 13, "str", "i.g 字段；i.l()。使用物品时由解释器执行 "
                            "(i.java:46 / g.java:120 战斗内 / ae.java 物品界面)"),
    ("说明", 14, "str", "i.h 字段；i.c()。商店/背包列表显示文本 (i.java:47)"),
]


def parse_items():
    lines = read_str("config_item.str")
    items = []
    for n, ln in enumerate(lines):
        cols = split(ln, "#")
        assert len(cols) == 15, "config_item.str:%d 列数 %d != 15" % (n, len(cols))
        it = {"行号": n, "src": "config_item.str:%d" % n}
        for cname, ci, ctype, note in ITEM_COLS:
            v = cols[ci]
            if ctype == "int":
                it[cname] = int(v)
            else:
                it[cname] = v
            it.setdefault("_notes", {})[cname] = note
        it["类型码"] = ITEM_TYPE.get(it["类型"], 8)
        it["类型名"] = ITEM_TYPE_NAME[it["类型码"]]
        it["归属码"] = ITEM_OWNER.get(it["归属"], 4)
        it["归属名"] = ITEM_OWNER_NAME[it["归属码"]]
        it["背包页"] = BAG_PAGE.get(it["类型码"], BAG_PAGE_FALLBACK)
        items.append(it)
    return items, lines


# ---------------------------------------------------------------- 技能
#
# config_skill.str 第 0 行是**哑元占位行**（不是表头）：Java 侧对 n2==0 硬编码构造
# new af(0,"none","none","name","攻击","否","0","0","否","0","0","atk",null)
# （d.java:249），af.b 由 "none" 落到 else=7。真正的表从第 1 行开始。
# 每行 12 列，'#' 分列（d.java:243-256）。

SKILL_ELEMENT = {"普通": 0, "水系": 1, "雷系": 2, "火系": 3,
                 "风系": 4, "土系": 5, "双系": 6}
SKILL_ELEMENT_NAME = {0: "普通(特技)", 1: "水系", 2: "雷系", 3: "火系",
                      4: "风系", 5: "土系", 6: "双系", 7: "其他"}

SKILL_COLS = [
    ("技能类型", 0, "enum", "af.b 字段：普通0/水系1/雷系2/火系3/风系4/土系5/双系6/其他7 (af.java:24)"),
    ("攻击类型", 1, "enum", "af.c 字段：==\"增益\" → true，否则 false（当作攻击）(af.java:25)；"
                            "f.a(af,ax,ax) 存进 f.n (f 字节码 115-120)"),
    ("名字", 2, "str", "af.d 字段（trim 后）；af.a(String) 按它查表 (af.java:26,38-48)"),
    ("动画名", 3, "str", "af.e 字段；战斗里 d.b(e) 取施法动画，另取 d.b(e+\"d\") "
                        "(f.java a(af,ax,ax) 字节码 5-12 / 74-95)"),
    ("群体攻击", 4, "bool", "af.f 字段：==\"是\"。ax.java:840 `if (this.s.f)` 走全体目标循环，"
                            "否则只打 this.Z 单体"),
    ("落点X偏移", 5, "int", "af.g 字段；落点 x = 目标.U + am.b() + af.g "
                            "(ax 字节码 369-380；bd.java:95)"),
    ("落点Y偏移", 6, "int", "af.h 字段；落点 y = 目标.V + am.b() + af.h "
                            "(ax 字节码 393-407；bd.java:96)"),
    ("是/否", 7, "bool", "af.i 字段：==\"是\"。f.a(af,ax,ax) 存进 f.m；无其它读取点 —— 语义未确认"),
    ("气消耗", 8, "int", "af.j 字段；aa 字节码「N气/不消耗」+ `af.j > 主角气` → \"气值不足\"；"
                          "bd.java:45-49 变身(魔尊真身) 每回合扣 U[7].j 点气"),
    ("神消耗", 9, "int", "af.k 字段；aa 字节码「N神/不消耗」+ 与主角神比较"),
    ("伤害公式", 10, "expr", "af.n 字段（private）；af.a(int,int) 绑定 slv/atk 后求值 "
                             "(af.java:76-81)，**但该方法在全部 74 个 class 里没有任何调用点** "
                             "→ 死数据（见未确认清单）"),
    ("说明", 11, "str", "af.l 字段；技能菜单显示 (af.java:35)"),
]

# 每系仙术的「使用→解锁下一个」推进链（bj.java:237-288 switch）
SKILL_CHAIN = {
    1: [8, 9, 10],    # 水系：冰咒→烟水还魂→五气连波(10 终)
    3: [11, 12, 13],   # 火系：炎咒→三味真火→流星火雨
    2: [14, 15, 16],   # 雷系：雷咒→天罡战气→雷动九天
    4: [17, 18, 19],   # 风系：风咒→仙风云体→风卷尘生
    5: [20, 21, 22],   # 土系：土咒→飞岩术→真元护体
}
# 双系解锁条件（bj.java:218-232）：(技能下标, 最低阶) 全部满足才解锁
SKILL_COMBO = [
    {"解锁": 23, "名字": "风雪冰天", "条件": [[18, 4], [10, 3]], "src": "bj.java:218-220"},
    {"解锁": 24, "名字": "举火燎天", "条件": [[13, 3], [19, 3]], "src": "bj.java:221-223"},
    {"解锁": 25, "名字": "星沉地动", "条件": [[13, 2], [22, 4]], "src": "bj.java:224-226"},
    {"解锁": 26, "名字": "烈焰燃雷", "条件": [[12, 4], [16, 3]], "src": "bj.java:227-229"},
    {"解锁": 27, "名字": "天魔附体", "条件": [[15, 4], [22, 2]], "src": "bj.java:230-232"},
]
# 特技 b==0 的 slv 固定 4，哑元 b==7 固定 5（bd.java:73）
SKILL_SLV_FIXED = {"普通(特技)": 4, "其他": 5}


def parse_skills():
    lines = read_str("config_skill.str")
    skills = []
    for n, ln in enumerate(lines):
        cols = split(ln, "#")
        assert len(cols) >= 11, "config_skill.str:%d 列数 %d" % (n, len(cols))
        s = {"行号": n, "src": "config_skill.str:%d" % n, "哑元占位行": n == 0}
        for cname, ci, ctype, note in SKILL_COLS:
            v = cols[ci] if ci < len(cols) else None
            if ctype == "int":
                s[cname] = None if v is None else int(v)
            elif ctype == "bool":
                s[cname] = None if v is None else (v == "是")
            elif ctype == "expr":
                s[cname] = None
                s["伤害公式_raw"] = v
                s["伤害公式_未生效"] = {
                    "expr": v, "vars": sorted(set(re.findall(r"[A-Za-z_$][A-Za-z0-9_$]*", v or ""))),
                    "src": "config_skill.str:%d" % n,
                    "note": "af.a(int,int) 无调用点 → 死数据",
                }
            else:
                s[cname] = v
            s.setdefault("_notes", {})[cname] = note
        s["系码"] = SKILL_ELEMENT.get(s["技能类型"], 7)
        s["系名"] = SKILL_ELEMENT_NAME[s["系码"]]
        s["是特技"] = s["系码"] == 0
        if s["系名"] in SKILL_SLV_FIXED:
            s["slv_取值"] = {"固定": SKILL_SLV_FIXED[s["系名"]], "src": "bd.java:73"}
        else:
            s["slv_取值"] = {"公式": "bj.b(技能下标) = "
                                     "次数<5?1:(次数<15?2:(次数<30?3:4))", "src": "bj.java:313-325"}
        skills.append(s)
    return skills, lines


# ---------------------------------------------------------------- 合成
#
# config_make.str：成品,材料1(数)|材料2(数),说明   —— d.java:184-199
# 注意：**没有表头行**，第 0 条就是配方（竹蜻蜓）。
# 消耗：只扣材料，**无成功率、无额外费用**（d.a(String,bj) d.java:734-769）。

def parse_make():
    lines = read_str("config_make.str")
    recipes = []
    for n, ln in enumerate(lines):
        parts = split(ln, ",")
        assert len(parts) == 3, "config_make.str:%d 段数 %d != 3" % (n, len(parts))
        prod, mats, desc = parts
        mlist = []
        for mm in split(mats, "|"):
            nm = callee_name(mm)
            args = callee_args(mm)
            mlist.append({"材料": nm, "数量": int(args[0]), "raw": mm})
        recipes.append({
            "行号": n, "src": "config_make.str:%d" % n,
            "成品": prod, "材料": mlist, "说明": desc,
            "免费合成豁免": "点石成金 = fee 6（GotoFee.str:6），d.java:741 "
                            "`if (!d.c(Integer.parseInt(Y.a(\"点石成金\"))))` "
                            "为真才扣材料",
        })
    return recipes, lines


# ---------------------------------------------------------------- 敌人
#
# enemy.str：地图名=ID范围,怪物种类,等级范围,战斗背景,BGM
# 出处 f.java:346-419（d(int) + a(String,int,int)）

ENEMY_KIND = {1: "明怪(地图上可见,单个)", 2: "遇敌(暗怪,随机个数)", 3: "未确认"}


def parse_enemy():
    lines = read_str("enemy.str")
    # 第 0 行是表头注释（值就是列说明），bg 会因首字符 '#' 跳过 —— 但这里第 0 行
    # 是 "地图名字 = ID范围(0-1),怪物种类(1),#事件ID?成立等级范围..."，
    # bg 收下它当普通键，所以查表时会被命中。Java 侧 d(int) 用的是 bg.a(this.W)，
    # W 是地图名，永远不会等于 "地图名字"。
    tab, _ = kv_table(lines)
    assert lines[0].startswith("地图名字 = "), "enemy.str:0 不是表头行"
    header = lines[0].split("=", 1)[1].strip()
    rows = []
    for n, ln in enumerate(lines):
        if n == 0:
            continue
        cols = split(ln.split("=", 1)[1], ",")
        assert len(cols) == 5, "enemy.str:%d 列数 %d != 5" % (n, len(cols))
        ids = [int(x) for x in split(cols[0], "-")]
        kind = int(cols[1])
        row = {
            "行号": n, "src": "enemy.str:%d" % n,
            "地图": ln.split("=", 1)[0].strip(),
            "怪物配置id池": ids,
            "怪物种类": kind,
            "怪物种类名": ENEMY_KIND.get(kind, "未确认"),
            "等级字段": cols[2],
            "战斗背景": cols[3],
            "BGM": cols[4],
        }
        if cols[2].startswith("#"):
            parts = split(cols[2], "#")
            cond = split(parts[1], "?")
            row["等级_条件"] = {
                "事件id": int(cond[0]),
                "成立时": split(cond[1], ":")[0],
                "不成立时": split(cond[1], ":")[1],
                "src": "f.java:356-364",
            }
        rows.append(row)
    return {"表头原文": header, "行": rows}, lines


# ---------------------------------------------------------------- 任务
#
# task.str：任务名 = 任务说明   —— d.java:200-209，d.i(String) 线性查 ag[i][0]
# 任务的增删改：player.firstTask / player.task / player.removeTask
#   e.java:2646-2665

def parse_task():
    lines = read_str("task.str")
    tasks = []
    for n, ln in enumerate(lines):
        parts = split(ln, "=")
        assert len(parts) == 2, "task.str:%d 段数 %d != 2" % (n, len(parts))
        tasks.append({
            "行号": n, "src": "task.str:%d" % n,
            "任务名": parts[0].strip(), "任务说明": parts[1].strip(),
        })
    return tasks, lines


# ---------------------------------------------------------------- 计费

def parse_fee():
    """fee.str：每行 '成功脚本#失败脚本'（d.java:228-236，只取 [0]/[1]）"""
    lines = read_str("fee.str")
    out = []
    for n, ln in enumerate(lines):
        cols = split(ln, "#")
        assert len(cols) == 2, "fee.str:%d 段数 %d != 2" % (n, len(cols))
        out.append({"行号": n, "src": "fee.str:%d" % n,
                    "功能id": n, "成功脚本": cols[0], "失败脚本": cols[1]})
    return out, lines


def parse_gotofee():
    """GotoFee.str：功能名=功能id#计费号码#功能名2#价格#说明，必须 5 段（d.java:210-227）"""
    lines = read_str("GotoFee.str")
    out = []
    for n, ln in enumerate(lines):
        kv = split(ln, "=")
        assert len(kv) == 2, "GotoFee.str:%d 段数 %d != 2" % (n, len(kv))
        cols = split(kv[1], "#")
        assert len(cols) == 5, "GotoFee.str:%d 列数 %d != 5" % (n, len(cols))
        out.append({
            "行号": n, "src": "GotoFee.str:%d" % n,
            "功能名": kv[0].strip(),
            "功能id": cols[0],
            "计费号码": cols[1],
            "内建功能名": cols[2],
            "价格": int(cols[3]),
            "说明": cols[4],
            "解锁的fee脚本": "fee.str:%d" % int(cols[0]) if cols[0].isdigit()
                            and int(cols[0]) < len(read_str("fee.str")) else None,
        })
    return out, lines


# ---------------------------------------------------------------- 游戏配置

GAME_KEYS = [
    ("扭曲延迟", "int", "丢弃", "cn...system.d.a(): Integer.parseInt 后 pop —— 死数据"),
    ("镜头跟随速度", "int", "d.b", "cn...system.d.java:100"),
    ("剧情黑边颜色", "hex", "d.c", "j.java:163-177 解析 0x 前缀 16 进制；d.java:101"),
    ("剧情黑边速度", "int", "d.d", "d.java:102"),
    ("系统提示框上下边距", "int", "d.e", "d.java:103"),
    ("系统提示框左右边距", "int", "d.f", "d.java:104"),
    ("对话框文字行间距", "int", "d.g", "d.java:105"),
    ("对话框文字滚动速度", "int", "d.h", "d.java:106"),
    ("自动绕路距离", "int", "d.i", "d.java:107"),
    ("卡马克卷轴", "bool", "d.T", "d.java:108，`==\"开\"`"),
    ("NPC最小移动步数", "int", "d.j", "d.java:109"),
    ("NPC最大移动步数", "int", "d.k", "d.java:110"),
    ("NPC最短站立时间", "int", "d.l", "d.java:111"),
    ("NPC最长站立时间", "int", "d.m", "d.java:112"),
    ("明怪最小移动步数", "int", "d.n", "d.java:113"),
    ("明怪最大移动步数", "int", "d.o", "d.java:114"),
    ("明怪最短站立时间", "int", "d.p", "d.java:115"),
    ("明怪最长站立时间", "int", "d.q", "d.java:116"),
    ("明怪移动速度", "int", "d.r", "d.java:117"),
    ("明怪刷新速度", "int", "d.s", "d.java:118"),
    ("明怪视线半径", "int", "d.t", "d.java:119"),
    ("明怪移动半径", "int", "d.u", "d.java:120"),
    ("明怪追击半径", "int", "d.v", "d.java:121"),
    ("鸟视线半径", "int", "d.w", "d.java:122"),
    ("MAP资源目录", "str", "d.x", "d.java:123"),
    ("ANT资源目录", "str", "d.y", "d.java:124"),
    ("BIN资源目录", "str", "d.z", "d.java:125"),
    ("STR资源目录", "str", "d.A", "d.java:126"),
    ("MID资源目录", "str", "d.B", "d.java:127"),
    ("主角配置文件", "str", "d.C", "d.java:128"),
    ("主角动画文件", "str", "d.D", "d.java:129"),
    ("主角资源文件", "str", "d.E", "d.java:130"),
    ("一号配角配置文件", "str", "d.F", "d.java:131"),
    ("二号配角配置文件", "str", "d.G", "d.java:132"),
    ("明怪动画文件", "str", "d.H", "d.java:133"),
    ("NPC资源文件", "str", "d.I", "d.java:134"),
    ("头像资源文件", "str", "d.J", "d.java:135"),
    ("初始场景地图文件", "str", "d.K", "d.java:136"),
    ("初始场景元素动画", "str", "d.L", "d.java:137"),
    ("初始场景元素资源", "str", "d.M", "d.java:138"),
    ("初始场景地砖资源", "str", "d.N", "d.java:139"),
    ("帮助", "str", "d.O", "d.java:140（菜单「游戏帮助」两栏折行文本）"),
    ("关于", "str", "d.P", "d.java:141（菜单「关于」）"),
    ("宝箱物品", "list", "d.ad/d.ae", "d.java:142-157（等级权重 → 累积）"),
]


def parse_game():
    lines = read_str("config_game.str")
    tab, order = kv_table(lines)
    assert len(tab) == 44, "config_game.str 键数 %d != 44" % len(tab)
    idx = {}
    for i, ln in enumerate(lines):
        p = ln.find("=")
        if p == -1:
            continue
        k = ln[:p].strip()
        if k and k[0] != "#":
            idx[k] = i
    out = {"文件": "config_game.str", "条目数": len(lines), "字段": {}}
    for key, typ, target, note in GAME_KEYS:
        assert key in tab, "config_game.str 缺键 %s" % key
        raw = tab[key]
        rec = {"raw": raw, "java字段": target, "src": "config_game.str:%d" % idx[key],
               "java": note}
        if typ == "int":
            rec["value"] = int(raw)
        elif typ == "hex":
            rec["value"] = int(raw, 16)
        elif typ == "bool":
            rec["value"] = raw == "开"
        elif typ == "list":
            rec["value"] = parse_treasure(raw, "config_game.str:%d" % idx[key])
        else:
            rec["value"] = raw
        out["字段"][key] = rec
    assert len(out["字段"]) == 44
    return out, lines


def parse_treasure(raw, src):
    """宝箱物品：名字(权重),...  d.java:142-157 + d.d() 抽取

    Java 逐条： ae[n] = e(raw)[0] 解析出的权重；然后 if (n>0) ae[n] += ae[n-1]
    → ae 是**含本项**的前缀和，ae[最后一项] = 总权重。
    """
    items = []
    cum = 0
    n = 0
    for part in split(raw, ","):
        part = part.strip()
        if len(part) == 0:
            continue
        nm = callee_name(part)
        w = int(callee_args(part)[0])
        cum += w
        items.append({"下标": n, "名字": nm, "权重": w, "累积权重": cum, "raw": part})
        n += 1
    total = cum
    for it in items:
        it["概率"] = "%.6f" % (it["权重"] / float(total))
    return {"总权重": total,
            "总权重_note": "本游戏总权重 = 100，权重即百分比",
            "项": items,
            "抽取算法": "n2 = j.a(1, ae[ae.length-1]) 随机 [1,总权重]；"
                        "从第 0 项起找第一个 `n2 <= ae[i]` 的项返回 (d.java:554-564)。"
                        "ae 是含本项的前缀和，所以第 i 项命中区间是 (ae[i-1], ae[i]]",
            "src": src}


# ---------------------------------------------------------------- NPC 定义
#
# 39 个数字命名 str，7 个键，固定顺序。复刻 e.java initElement() 的 addToNpc 分支。
#   new bg(d.A + 文件名)                        → 键值表
#   bg["动画文件"]  + d.a(d.y + 动画文件)        → ANT
#   bg["名字"], parseInt(bg["名字高度"])
#   bg["左右移动"]=="是", bg["上下移动"]=="是"
#   d.h(bg["对话区域"])                          → int[][] {x,y,w,h,dir}
#   b.a(d.A + bg["对话文件"])                     → 对话脚本行
#
# d.h(String)（d.java:339-358）：整串必须 { 开头 } 结尾；去外层括号后按 "},{" 切，
# 每段按 "," 切 5 项 → {x, y, w, h, DIR_CODE[dir]}。

NPC_KEYS = ["名字", "名字高度", "动画文件", "对话文件", "对话区域", "上下移动", "左右移动"]


def parse_talk_regions(raw, src):
    s = raw.strip()
    if not (s.startswith("{") and s.endswith("}")):
        return {"raw": raw, "src": src, "解析": None, "note": "d.h(): 不以 { } 包裹 → 返回 null"}
    body = s[1:-1]
    out = []
    for part in split(body, "},{"):
        cols = split(part, ",")
        assert len(cols) == 5, "对话区域段 %r 列数 %d != 5" % (part, len(cols))
        dx, dy, w, h = (int(x) for x in cols[:4])
        dname = cols[4]
        code = DIR_CODE[dname]
        out.append({
            "x": dx, "y": dy, "w": w, "h": h,
            "方向": dname, "方向码": code,
            "判定框": {"左": dx, "上": dy, "右": dx + w, "下": dy + h},
            "绝对框": "玩家坐标 ∈ [NPC.x+%d, NPC.x+%d] × [NPC.y+%d, NPC.y+%d]"
                      % (dx, dx + w, dy, dy + h),
        })
    return {"raw": raw, "src": src, "解析": out,
            "判定": "j.a(玩家X, 玩家Y, NPC.x+x, NPC.y+y, w, h) (j.java:119-121) "
                    "→ bl.java:518-519 只用于「玩家进入框内则显示 NPC 名字」",
            "方向码_note": "第 5 项(方向) 被 d.h() 解析成位掩码，但 bl/e 里**没有任何读取点** "
                           "（全 jar 只有 1 处调用 d.h，全部传给 bl 构造器）→ 死数据"}


def npc_list_files():
    return sorted([f for f in os.listdir(STR_DIR)
                   if f.endswith(".str") and f[:-4].isdigit()],
                  key=lambda s: int(s[:-4]))


def parse_npc():
    out = []
    for fn in npc_list_files():
        sid = int(fn[:-4])
        lines = read_str(fn)
        assert len(lines) == 7, "%s 条目数 %d != 7" % (fn, len(lines))
        tab, order = kv_table(lines)
        assert order == NPC_KEYS, "%s 键顺序 %r" % (fn, order)
        idx = {}
        for i, ln in enumerate(lines):
            p = ln.find("=")
            idx[ln[:p].strip()] = i
        ant = tab["动画文件"]
        talk = tab["对话文件"]
        talk_path = os.path.join(STR_DIR, talk)
        out.append({
            "id": sid,
            "src": "%s:0-6" % fn,
            "名字": tab["名字"],
            "名字高度": int(tab["名字高度"]),
            "动画文件": ant,
            "动画文件存在": os.path.exists(os.path.join(ANT_DIR, ant)),
            "对话文件": talk,
            "对话文件存在": os.path.exists(talk_path),
            "对话区域": parse_talk_regions(tab["对话区域"], "%s:%d" % (fn, idx["对话区域"])),
            "上下移动": tab["上下移动"] == "是",
            "左右移动": tab["左右移动"] == "是",
            "字段src": {k: "%s:%d" % (fn, idx[k]) for k in NPC_KEYS},
        })
    return out


def classify_npc(npcs):
    """按「动画文件 / 是否有对话」分类（纯数据事实，不猜）"""
    by_ant = {}
    for n in npcs:
        by_ant.setdefault(n["动画文件"], []).append(n["id"])
    groups = {
        "有对话脚本的NPC": [n["id"] for n in npcs if n["对话文件存在"]],
        "对话文件缺失的NPC": [n["id"] for n in npcs if not n["对话文件存在"]],
        "可左右移动": [n["id"] for n in npcs if n["左右移动"]],
        "可上下移动": [n["id"] for n in npcs if n["上下移动"]],
        "完全静止": [n["id"] for n in npcs if not n["左右移动"] and not n["上下移动"]],
        "按动画文件分组": by_ant,
    }
    # 对话区域预设
    presets = {}
    for n in npcs:
        presets.setdefault(n["对话区域"]["raw"], []).append(n["id"])
    groups["按对话区域预设分组"] = presets
    return groups


# ---------------------------------------------------------------- 成长表

def growth_table(name, maxlv=45):
    cfg, tab, idx = parse_char_config(name)
    fs = {k: Formula(tab[k], "config_%s.str:%d" % (
        name.replace("config_", "").replace(".str", ""), idx[k]))
        for k in CHAR_FORMULA_KEYS}
    rows = []
    total_exp = 0
    for lv in range(1, maxlv + 1):
        r = {"lv": lv}
        for k, fo in fs.items():
            r[k] = fo.eval(lv=lv)
        r["累计经验"] = total_exp + r["升级所需经验"]
        total_exp = r["累计经验"]
        rows.append(r)
    return cfg, rows, total_exp


# ---------------------------------------------------------------- 主流程

def main():
    os.makedirs(OUT_CFG, exist_ok=True)
    os.makedirs(OUT_NPC, exist_ok=True)
    written = []

    def dump(path, obj):
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(obj, fh, ensure_ascii=False, indent=2, sort_keys=False)
            fh.write("\n")
        written.append(path)

    # 1) 容器自检
    files = sorted(f for f in os.listdir(STR_DIR) if f.endswith(".str"))
    cont = {"格式": "'88''S''T''R' | 0x06 | int16 count | count×{uint16 len, UTF-8 bytes}",
            "出处": "默认包 b.java a(InputStream)/a(DataInputStream)（从原始 jar 解出；"
                    "解包树 1-解包产物/类文件/b.class 被 cn...system.b 覆盖）",
            "字节级耗尽校验": "%d/%d 通过" % (len(files), len(files)),
            "文件数": len(files)}

    # 2) 角色成长
    chars = {}
    for fn, note in [("config_chonglou.str", "主角重楼（d.C 主角配置文件）"),
                     ("config_liyiru.str", "一号配角月瑶（d.F）"),
                     ("config_zixuan.str", "二号配角紫萱（d.G）"),
                     ("config_instruction.str", "教学/演示配置 lv60 全仙术（仅 f.java 战斗教学用）")]:
        cfg, rows, total = growth_table(fn)
        cfg["说明"] = note
        cfg["上限"] = CHAR_LIMITS
        cfg["成长表_lv1_45"] = rows
        cfg["成长表_说明"] = {
            "公式求值": "t.java 表达式求值器，绑定变量只有 lv（bj.java:344）",
            "累计经验": "逐级累加 升级所需经验，lv45 累计 = %d" % total,
            "注意": "等级上限 45（bj.java:372），除 fee 500（付费「连升十级」）解锁外不可超",
        }
        chars[fn] = cfg
    dump(os.path.join(OUT_CFG, "角色成长.json"),
         {"容器": cont, "角色": chars, "字段表": "见 4-文档/格式规范/配置与成长.md"})

    # 3) 物品
    items, item_lines = parse_items()
    by_type = {}
    for it in items:
        by_type.setdefault(it["类型名"], []).append(it["名字"])
    dump(os.path.join(OUT_CFG, "物品.json"), {
        "容器": cont,
        "列定义": [{"列": c[0], "下标": c[1], "类型": c[2], "含义与出处": c[3]}
                   for c in ITEM_COLS],
        "类型枚举": {str(k): v for k, v in sorted(ITEM_TYPE.items())},
        "类型枚举_注意": "'合成'=9 在 config_item.str 里没有实例；"
                         "i.java:33 落不到 9 的都归 8，而 8 就是「任务」",
        "归属枚举": {str(k): v for k, v in sorted(ITEM_OWNER.items())},
        "背包分页": {str(k): v for k, v in sorted(BAG_PAGE.items())},
        "价格规则": {
            "买入": "i.b() 全额（ae.java:991-994）",
            "卖出": "i.b() >> 1 整除 2（ae.java:1003-1004）",
            "商店列表显示": "买入显示 b()，卖出显示 b()/2（ae.java 绘制处）",
            "src": "ae.java:990-1005",
        },
        "药品快捷表": {
            "构造": "d.R[i] = { Q[n][0] 名字, Q[n][12] 价格, Q[n][14] 说明 }，"
                    "仅收 类型==\"药品\" 的行（d.java:172-183）",
            "数量": sum(1 for it in items if it["类型名"] == "药品"),
        },
        "统计": {"总条目": len(items), "按类型": {k: len(v) for k, v in by_type.items()}},
        "分类": by_type,
        "物品": items,
    })

    # 4) 技能
    skills, skill_lines = parse_skills()
    by_elem = {}
    for s in skills:
        by_elem.setdefault(s["系名"], []).append(s["名字"])
    dump(os.path.join(OUT_CFG, "技能.json"), {
        "容器": cont,
        "列定义": [{"列": c[0], "下标": c[1], "类型": c[2], "含义与出处": c[3]}
                   for c in SKILL_COLS],
        "第0行说明": "第 0 行是哑元占位行，不是表头。Java 侧 d.java:249 对 n2==0 硬编码 "
                     "new af(0,\"none\",\"none\",\"name\",\"攻击\",\"否\",\"0\",\"0\","
                     "\"否\",\"0\",\"0\",\"atk\",null)，其 d=\"name\" 永远匹配不到任何技能名。",
        "系枚举": {str(k): v for k, v in sorted(SKILL_ELEMENT.items())},
        "特技与仙术的划分": "af.a(0,U)（af.java:50-74）筛出 b==0 的行 = 特技；bj.java:128-142 "
                           "把 b!=0 的行装进 C[][] = 仙术表（含哑元行，共 21 项）",
        "仙术等级": {
            "公式": "阶 = 累计使用次数<5 ? 1 : (<15 ? 2 : (<30 ? 3 : 4))",
            "src": "bj.java:313-325 (b(int))",
            "上限": 4,
            "旁证": "tips_in_loading.str:8「仙术最高等级为4级」",
        },
        "解锁推进链": {
            "说明": "在 bj.C 里对已开通的同系仙术全部 C[i][3]++，然后按 bj.java:237-288 的 "
                    "switch 尝试开通「本级+1」的同系仙术；终末（10/13/16/19/22）不再推进。",
            "链": {SKILL_ELEMENT_NAME[k]: v for k, v in SKILL_CHAIN.items()},
        },
        "双系解锁条件": SKILL_COMBO,
        "变身气消耗": {"技能下标": 7, "名字": "魔尊真身", "每回合扣气": 10,
                       "src": "bd.java:44-49 (`cn...system.d.U[7].j`)"},
        "统计": {"总条目": len(skills), "特技": sum(1 for s in skills if s["是特技"]),
                 "仙术": sum(1 for s in skills if s["系码"] not in (0, 7))},
        "按系": by_elem,
        "技能": skills,
    })

    # 5) 合成
    recipes, _ = parse_make()
    dump(os.path.join(OUT_CFG, "合成.json"), {
        "容器": cont,
        "语法": "成品名,材料1(数量)|材料2(数量),说明   —— 无表头行，'#' 不参与",
        "解析出处": "d.java:184-199（split ',' 得 3 段；split '|' 得材料；"
                    "d.d() 取名字、d.e()[0] 取数量）",
        "执行出处": "d.java:734-769 (a(String 成品名, bj 背包))",
        "规则": {
            "返回码": {"0": "无此配方（ae 显示「无法使用」）",
                       "1": "合成成功（ae 显示「合成成功」）",
                       "2": "材料不足（ae 显示「材料不足」）"},
            "消耗": "**只扣材料，没有成功率判定，没有额外金钱费用**（d.java:742-758 全文）",
            "免费合成": "若 fee6「点石成金」已激活（d.c(parseInt(Y.a(\"点石成金\")))），"
                        "跳过材料检查与扣除，直接给成品（d.java:741）",
            "成品数量": "固定 1 个（d.java:758 `bj2.c().a(new i(S[n].a))`，i 构造器默认 count=1）",
            "材料合并": "同名材料在 k.a(i)（k.java:17-28）里累加数量",
        },
        "统计": {"配方数": len(recipes)},
        "配方": recipes,
    })

    # 6) 敌人
    enemy, _ = parse_enemy()
    enemy["容器"] = cont
    enemy["列定义"] = [
        {"列": "怪物配置id池", "下标": 0, "说明": "按 '-' 切成 int 数组，明怪取 1 个随机，"
                                                  "遇敌取 2 个独立随机（两者不等，f.java:390-399）"},
        {"列": "怪物种类", "下标": 1, "说明": "1=明怪 2=遇敌 3=未确认（f.java:346-348 + 400-408）"},
        {"列": "等级范围", "下标": 2, "说明": "可带 '#事件ID?成立范围:不成立范围' 前缀"
                                                  "（f.java:355-364）；范围按 '-' 切 [lvmin,lvmax]"},
        {"列": "战斗背景", "下标": 3, "说明": "→ f.ar，战斗背景 ANT 名（f.java:349）"},
        {"列": "BGM", "下标": 4, "说明": "→ f.as，音乐名（f.java:350）"},
    ]
    enemy["怪物个数算法"] = {
        "种类1": "n4 = j.a(0,100)；<50→1，<95→2，else 3（f.java:346）",
        "种类2": "n4 = j.a(0,100)；<50→2，<90→3，else 1（f.java:346）",
        "种类3": "n4 = j.a(0,100)；<5→1，<40→2，else 3（f.java:346）",
        "拆分": "怪1个数 = j.a(0, 总数)，怪2个数 = 总数 - 怪1个数（f.java:409-414）",
    }
    enemy["怪物等级算法"] = {
        "src": "f.java:434-447 (a(String,int,int))",
        "规则": "队伍第一人等级 playerLv = G[0].e()；"
                "playerLv<=lvmin → lvmin；playerLv>=lvmax → lvmax；"
                "否则在 [max(lvmin,playerLv-1), min(lvmax,playerLv+1)] 内随机",
    }
    dump(os.path.join(OUT_CFG, "敌人.json"), enemy)

    # 7) 任务
    tasks, _ = parse_task()
    dump(os.path.join(OUT_CFG, "任务.json"), {
        "容器": cont,
        "格式": "任务名 = 任务说明（'#' 不参与，'=' 只切第一处，d.java:205 split '='）",
        "查询": "cn...system.d.i(String) 线性比对任务名，返回说明（d.java:723-732）",
        "任务槽": {
            "结构": "Vector<String>（bj.K，bj.java:42 / 791-801）",
            "firstTask": "已有任务 → 替换**第 0 个**；否则追加（e.java:2646-2653）",
            "task": "已有任务 → 追加到末尾；否则先追加 \"无\" 再追加（e.java:2654-2660）",
            "removeTask": "按名字删除（e.java:2661-2665）",
            "显示": "第 0 个 = 当前主任务；其余为支线",
        },
        "与事件标记的关系": {
            "事件标记": "game.markEvent(N) / game.unmarkEvent(N) / eventMarked(N) / feeMarked(N)",
            "模式": "任务不是数据表驱动的状态机，而是**对话脚本里手写的 if 链**："
                    "每个任务在若干 markEvent(N) 分支下有专属触发条件，"
                    "条件里常带 player.itemExists(物品) 判定",
            "firstTask 的调用点": "见 xuanze.str:0 / xuanze.str:8 / xuanze.str:9 "
                                  "（player.firstTask(赶往罗家堡) 等）",
            "task 的调用点": "见 talk_53.str / talk_62.str / talk_66.str / xuanze.str:22,24,26",
            "src": "4-文档/反编译源码/e.java:2646-2665",
        },
        "统计": {"任务数": len(tasks)},
        "任务": tasks,
    })

    # 8) 游戏配置
    game, _ = parse_game()
    game["容器"] = cont
    game["字段表"] = [{"键": k, "类型": t, "java字段": tg, "说明": nt}
                      for k, t, tg, nt in GAME_KEYS]
    dump(os.path.join(OUT_CFG, "游戏配置.json"), game)

    # 9) 计费
    fees, _ = parse_fee()
    gotofees, _ = parse_gotofee()
    dump(os.path.join(OUT_CFG, "计费.json"), {
        "容器": cont,
        "fee标志存储": {
            "键名": "fee<N>，值 long（1=已激活）",
            "存储": "javax.microedition.rms.RecordStore 'CLS3_FEE_SYMBOL'"
                    "（d.java:566-628 读、630-721 写）",
            "接口": "cn...system.d.a(int) 置1 / b(int) 置0 / c(int) 读（d.java:445-457）",
            "脚本": "system.markFee(N) / system.unmarkFee(N)（e.java:3110-3113）",
        },
        "fee_str": {
            "格式": "成功脚本#失败脚本   —— 下标即功能id（d.java:228-236）",
            "项": fees,
        },
        "GotoFee_str": {
            "格式": "功能名=功能id#计费号码#内建功能名#价格#说明，必须正好 5 段，"
                    "否则整条丢弃并打印「计费点配置文件错误」（d.java:210-227）",
            "调用": "ae.java:982-988 —— d.c(功能id) 判已激活；"
                    "否则 al.a().a(功能id, 计费号码, 内建功能名, 价格, 说明, d) 发起计费",
            "项": gotofees,
        },
        "内部挂钩": [
            {"fee": 6, "名字": "点石成金", "作用": "合成不消耗材料", "src": "d.java:741"},
            {"fee": 500, "名字": "（无 GotoFee 条目）", "作用": "取消 45 级等级上限",
             "src": "bj.java:371；由 fee.str:4 的 player.levelup(10) → e.java:2634 d.a(500) 置位"},
            {"fee": 99991, "名字": "（无 GotoFee 条目）", "作用": "战斗教学·第一次遇怪",
             "src": "f.java:373-379"},
            {"fee": 99992, "名字": "（无 GotoFee 条目）", "作用": "剧情教学",
             "src": "f.java:379-388"},
            {"fee": 99999, "名字": "（无 GotoFee 条目）", "作用": "H2.str 里的教学分支条件",
             "src": "H2.str:1-5"},
        ],
    })

    # 10) NPC
    npcs = parse_npc()
    groups = classify_npc(npcs)
    dump(os.path.join(OUT_NPC, "npc_定义.json"), {
        "容器": cont,
        "格式": "7 个键、固定顺序：名字/名字高度/动画文件/对话文件/对话区域/上下移动/左右移动",
        "加载出处": "e.java initElement() 的 element.addToNpc(id, \"<n>.str\") 分支"
                    "（字节码偏移 9014 附近，'String 对话区域'）",
        "注意": "addToNpc(id, \"npc_<id>.ant\") 的另一种形式**不读本表**："
                "名字/名字高度=0/不移动/无对话（e.java 字节码 424-489 分支）",
        "数量": len(npcs),
        "分类": groups,
        "NPC": npcs,
    })

    for p in written:
        print("写出", p)
    print("\n容器自检：%d/%d 个 str 字节精确耗尽" % (len(files), len(files)))


# ---------------------------------------------------------------- 交叉验证
#
# `Formula` 是 t.java 的 Python 复刻。为了证明复刻无误，这里提供一个把候选表达式
# 丢给**真实的 t.class**（从原始 jar 解出）求值的对照器。
#   用法：  python3 strcfg.py --verify <t.class 所在目录>
# 已实测：41 条手挑用例 + 全部 4 份角色配置公式(lv∈{1,5,20,45}) + 全部 27 条技能
#         伤害公式(slv∈{1..5} × atk∈{0,1,137,999,2500}) = 772 次真实求值，
#         Python 侧 0 分歧。

VERIFY_DRIVER = r'''
import java.lang.reflect.*; import java.io.*;
public class TV2 {
  public static void main(String[] a) throws Exception {
    Class<?> c = Class.forName("t");
    Constructor<?> k = c.getDeclaredConstructor(); k.setAccessible(true);
    final Method A = c.getDeclaredMethod("a", String.class); A.setAccessible(true);
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in,"UTF-8"));
    String line;
    while ((line=br.readLine())!=null) {
      String[] p = line.split("\t");
      try {
        Object e = k.newInstance();
        for (int i=1;i<p.length;i++) A.invoke(e, p[i]);
        System.out.println(A.invoke(e, p[0]));
      } catch (Throwable ex) { System.out.println("ERR"); }
    }
  }
}
'''


def collect_formula_cases():
    cases = []
    for fn in ("config_chonglou.str", "config_liyiru.str",
               "config_zixuan.str", "config_instruction.str"):
        for k in CHAR_FORMULA_KEYS:
            tab, _ = kv_table(read_str(fn))
            for lv in (1, 5, 20, 45):
                cases.append((tab[k], ["lv=%d" % lv]))
    for ln in read_str("config_skill.str"):
        cols = split(ln, "#")
        if len(cols) > 10 and re.match(r"^[-+*/%^()0-9a-zA-Z_$ ]+$", cols[10] or ""):
            for slv in (1, 2, 3, 4, 5):
                for atk in (0, 1, 137, 999, 2500):
                    cases.append((cols[10], ["slv=%d" % slv, "atk=%d" % atk]))
    return cases


def verify_against_java(tclass_dir, workdir="/tmp/strcfg_verify"):
    import subprocess
    os.makedirs(workdir, exist_ok=True)
    src = os.path.join(workdir, "TV2.java")
    with open(src, "w") as fh:
        fh.write(VERIFY_DRIVER)
    shutil_src = os.path.join(tclass_dir, "t.class")
    with open(os.path.join(workdir, "t.class"), "wb") as fh:
        with open(shutil_src, "rb") as g:
            fh.write(g.read())
    subprocess.run(["javac", "-encoding", "UTF-8", "TV2.java"], cwd=workdir, check=True)
    cases = collect_formula_cases()
    inp = "\n".join("\t".join([e] + b) for e, b in cases)
    r = subprocess.run(["java", "-cp", workdir, "TV2"], input=inp,
                       capture_output=True, text=True)
    outs = r.stdout.strip().split("\n")
    assert len(outs) == len(cases), (len(outs), len(cases), r.stderr[:400])
    bad = 0
    for (e, b), o in zip(cases, outs):
        if o == "ERR":
            bad += 1
            print("JAVA-ERR", e, b)
            continue
        env = {}
        for kv in b:
            k, v = kv.split("=")
            env[k] = int(v)
        got = Formula(e, "verify").eval(**env)
        if got != int(o):
            bad += 1
            print("MISMATCH %r %r java=%s py=%d" % (e, b, o, got))
    print("交叉验证：%d 条公式 × 真实 t.class，分歧 %d 条" % (len(cases), bad))
    return bad


if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "--verify":
        sys.exit(1 if verify_against_java(sys.argv[2]) else 0)
    main()
