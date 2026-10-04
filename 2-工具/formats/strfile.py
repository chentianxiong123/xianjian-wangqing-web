# -*- coding: utf-8 -*-
"""STR 配置/脚本 `88STR` —— 已验证 101/101 文件字节精确耗尽

★ 正确结构 (暴力搜索 + 逐字节核对得出，1146 个条目全部对齐):

    '88' 'S' 'T' 'R'      4B   magic
    uint8  version         1B   实测恒为 6
    uint16 BE entryCount   2B   实测最大 90。★ 注意 version 只有 1 字节,
                                   count 的 uint16 从第 5 字节开始，
                                   所以第 5 字节恒为 0 —— 这正是旧实现
                                   "[\x00-\x1f] 切分"会把 0x00 当分隔符的原因
    entryCount × { uint16 BE length; byte[length] UTF-8 text }

  注: 子代理逆向(fightcfg.py)给出的是 "0x06 + int16BE count"，
  与本读法在全部 101 个文件上**完全等价**(byte5 恒为 0, count ≤ 90)。

★ 陷阱: 旧实现用 [\x00-\\x1f] 切分文本，结果把 int16 长度字段的高位字节
  (通常是 0x00) 当成了分隔符，于是每个条目前面都多出一个垃圾字节
  (键名变成 "Z对话区域"、"5最大生命"、"R木剑")。
  当 length < 256 时高字节恰为 0x00，看起来像分隔符，具有极大欺骗性；
  length >= 256 时(如 384)高字节是 0x01，直接暴露。

来源: 由 1-解包产物/解包树/str/ 全部 101 个文件反推校验。
"""
import re

from .binary import Reader, load_raw
from . import FormatError

MAGIC = b"\x88STR"
VERSION = 6


def parse(data, where="<str>"):
    """→ (entries: list[str], meta: dict)。顺序即文件内顺序。"""
    r = Reader(data)
    r.magic(MAGIC)
    ver = r.u8()
    if ver != VERSION:
        raise FormatError("%s: STR 版本 %d != %d" % (where, ver, VERSION))
    cnt = r.u16()
    entries = []
    for i in range(cnt):
        off = r.p
        ln = r.u16()
        entries.append({
            "i": i,
            "text": r.raw(ln).decode("utf-8", "replace"),
            "offset": off,
            "bytes": ln,
        })
    r.done(where)
    meta = {"version": ver, "count": cnt, "textBytes": len(data) - 7}
    return entries, meta


def texts(data, where="<str>"):
    return [e["text"] for e in parse(data, where)[0]]


def load_entries(path):
    data = load_raw(path)
    return parse(data, where=path)


def load(path):
    """→ {key: value}。同 key 后者覆盖前者。"""
    out = {}
    for e in load_entries(path)[0]:
        t = e["text"]
        if "=" not in t:
            continue
        k, v = t.split("=", 1)
        k = k.strip()
        if k and not k.startswith("#"):
            out[k] = v.strip()
    return out


# ---------------------------------------------------------------- 分类

NUMERIC = re.compile(r"^\d+\.str$")

CATEGORIES = (
    ("config", lambda n: n.startswith("config_")),
    ("talk", lambda n: n.startswith("talk_")),
    ("fight", lambda n: n.startswith("fight_")),
    ("numeric", lambda n: bool(NUMERIC.match(n))),
    ("other", lambda n: True),
)


def category(name):
    for cat, test in CATEGORIES:
        if test(name):
            return cat
    return "other"


# ---------------------------------------------------------------- 各类 schema

#: NPC 定义 str 的字段 (来自 21.str 等 39 个数字命名文件的实测)
NPC_DEF_KEYS = ("名字", "名字高度", "动画文件", "对话文件", "对话区域",
                "上下移动", "左右移动")


def parse_npc_def(cfg):
    """NPC 定义 str → 结构化。`对话区域` 语法:
       {-13,8,27,7,up},{14,-7,15,15,left},{-13,-16,27,9,down},{-28,-7,15,15,right}
       每组 = {dx, dy, w, h, dir}
    """
    regions = []
    raw = None
    for k, v in cfg.items():
        if k.endswith("对话区域"):
            raw = v
            break
    if raw:
        for grp in re.findall(r"\{([^}]*)\}", raw):
            parts = [p.strip() for p in grp.split(",")]
            if len(parts) == 5:
                regions.append({"dx": int(parts[0]), "dy": int(parts[1]),
                                "w": int(parts[2]), "h": int(parts[3]),
                                "dir": parts[4]})
    return {
        "name": cfg.get("名字"),
        "nameHeight": int(cfg.get("名字高度", 0) or 0),
        "ant": cfg.get("动画文件"),
        "talk": cfg.get("对话文件"),
        "moveUD": cfg.get("上下移动") == "是",
        "moveLR": cfg.get("左右移动") == "是",
        "dialogRegions": regions,
    }


def parse_columns(lines, sep="#", skip_header=False):
    """`#` 分列的配置表 → list[list[str]]。"""
    rows = []
    for i, ln in enumerate(lines):
        if skip_header and i == 0:
            continue
        rows.append([c.strip() for c in ln.split(sep)])
    return rows


def parse_formula(text):
    """把 `20+(lv-1)*30` 拆成 {expr, vars}。变量 = 标识符(排除函数名与数字)。"""
    expr = text.strip()
    funcs = set(re.findall(r"\b([a-zA-Z_][a-zA-Z_0-9]*)\s*\(", expr))
    vs = set(re.findall(r"\b([a-zA-Z_][a-zA-Z_0-9]*)\b", expr)) - funcs
    return {"expr": expr, "vars": sorted(vs)}


def is_formula(v):
    """公式 = 变量参与算术运算。

    必须排除: 纯路径(/map/)、十六进制色(0x000000)、文件名(config_chonglou.str)
    —— 它们同样含字母与符号，但不是公式。
    """
    if not v:
        return False
    if v.startswith("0x") or "." in v and "/" in v:
        return False
    if "/" in v and " " not in v:
        return False
    if not re.fullmatch(r"[\s\d.+\-*/()a-zA-Z_]+", v):
        return False
    return bool(re.search(r"[a-zA-Z_][a-zA-Z_0-9]*\s*[-+*/)]"
                         r"|[-+*/(]\s*[a-zA-Z_]", v))