# -*- coding: utf-8 -*-
"""脚本语言 → 统一 AST

语法:  对象.指令(参数,...)[条件,条件];
条件里的对象/指令语义由 4-文档/格式规范/脚本指令集.md 定义(专项逆向产出)。

★ 条件后缀在行尾 ';' 之后也能出现，所以先剥分号再抓条件。
"""
import re

CMD_RE = re.compile(r"^([A-Za-z_][A-Za-z_0-9]*)\.([A-Za-z_][A-Za-z_0-9]*)\s*\((.*)\)$",
                    re.S)
COND_RE = re.compile(r"\[([^\[\]]*)\]\s*$", re.S)
IDENT_RE = re.compile(r"\b([A-Za-z_][A-Za-z_0-9]*)\b")

#: 已从 Java 确认的方向值 (cn.../system/d.java → b(String))
DIRECTION = {"up": 1, "down": 2, "left": 4, "right": 8, "keep": -1}

#: 已从 Java 确认的对象前缀 (e.java startsWith 分支)
OBJECTS = ("camera", "countdownTimer", "dialogBox", "element", "fee",
           "feeMarked", "game", "guide", "item", "midi", "npc", "partner",
           "player", "script", "system", "user", "world")


def split_args(s):
    """按顶层逗号切分，忽略 ()[]{} 与引号内部。"""
    out, depth, cur, q = [], 0, [], False
    for ch in s:
        if q:
            cur.append(ch)
            if ch == "'":
                q = False
            continue
        if ch == "'":
            q = True
            cur.append(ch)
            continue
        if ch in "([{":
            depth += 1
        elif ch in ")]}":
            depth -= 1
        if ch == "," and depth == 0:
            out.append("".join(cur).strip())
            cur = []
        else:
            cur.append(ch)
    if cur:
        out.append("".join(cur).strip())
    return out


def split_top(s, sep):
    """按顶层 sep 切分。"""
    out, depth, cur, q = [], 0, [], False
    for ch in s:
        if q:
            cur.append(ch)
            if ch == "'":
                q = False
            continue
        if ch == "'":
            q = True; cur.append(ch); continue
        if ch in "([{":
            depth += 1
        elif ch in ")]}":
            depth -= 1
        if ch == sep and depth == 0:
            out.append("".join(cur).strip()); cur = []
        else:
            cur.append(ch)
    if cur:
        out.append("".join(cur).strip())
    return out


def parse_arg(a):
    """把参数文本归一化: {type, value}。"""
    s = a.strip()
    if not s:
        return {"type": "empty", "value": ""}
    if re.fullmatch(r"-?\d+", s):
        return {"type": "int", "value": int(s)}
    if re.fullmatch(r"-?\d*\.\d+", s):
        return {"type": "float", "value": float(s)}
    if s in ("true", "false"):
        return {"type": "bool", "value": (s == "true")}
    if s in ("null", "nil"):
        return {"type": "null", "value": None}
    if s in DIRECTION:
        return {"type": "direction", "value": s, "code": DIRECTION[s]}
    if s.startswith("'") and s.endswith("'") and len(s) >= 2:
        return {"type": "string", "value": s[1:-1]}
    if s.startswith("/") and "/" in s[1:]:
        # 对话行: /说话人/:文本
        m = re.match(r"^/([^/]*)/[:：](.*)$", s, re.S)
        if m:
            return {"type": "dialog", "speaker": m.group(1), "value": m.group(2)}
    # 表达式: 含变量引用
    idents = IDENT_RE.findall(s)
    if idents:
        return {"type": "expr", "value": s, "vars": idents}
    return {"type": "token", "value": s}


def parse_condition(cond):
    """条件后缀 → AST。

    语法糖: eventMarked(N) / !eventMarked(N)，顶层逗号分隔。
    ★ 求值规则(AND/OR 优先级)尚未从 Java 完全确认，见脚本指令集.md「未确认」。
    这里保留原始项序列，不做语义合并。
    """
    if not cond:
        return None
    terms = []
    for raw in split_top(cond, ","):
        t = raw.strip()
        if not t:
            continue
        neg = t.startswith("!")
        if neg:
            t = t[1:].strip()
        m = re.match(r"^([A-Za-z_][A-Za-z_0-9]*)\s*\((.*)\)$", t)
        if m:
            terms.append({"fn": m.group(1), "args": [parse_arg(a) for a in
                                                     split_args(m.group(2))],
                          "neg": neg, "raw": raw.strip()})
        else:
            terms.append({"fn": None, "args": [parse_arg(t)], "neg": neg,
                          "raw": raw.strip()})
    return {"terms": terms, "raw": cond,
            "semantics": "unconfirmed"}


def parse_line(raw):
    s = raw.strip()
    while s.endswith(";"):
        s = s[:-1].strip()
    if not s:
        return None
    cond = None
    m = COND_RE.search(s)
    if m:
        cond = m.group(1)
        s = s[:m.start()].strip()
    if not s:
        return None
    m = CMD_RE.match(s)
    if m:
        return {"kind": "cmd", "obj": m.group(1), "cmd": m.group(2),
                "args": [parse_arg(a) for a in split_args(m.group(3))],
                "raw_args": split_args(m.group(3)),
                "cond": parse_condition(cond), "raw": s}
    return {"kind": "opaque", "obj": None, "cmd": None, "args": [],
            "raw_args": [s], "cond": parse_condition(cond), "raw": s}


def split_statements(text):
    """★ 脚本正文通常是**单行、用 ';' 分隔**的(不是按换行)。

    例: "script.openScriptList();  player.setState(stand);dialogBox.setText(...);"
    所以必须按顶层 ';' 切分，再按换行切分。只认换行会让正则贪婪匹配
    从第一个 '(' 吃到最后一个 ')'，整段脚本塌成一条指令。
    """
    out, cur, depth, q = [], [], 0, False
    for ch in text:
        if q:
            cur.append(ch)
            if ch == "'":
                q = False
            continue
        if ch == "'":
            q = True
            cur.append(ch)
            continue
        if ch in "([{":
            depth += 1
        elif ch in ")]}":
            depth -= 1
        if depth == 0 and ch == ";":
            out.append("".join(cur))
            cur = []
        elif depth == 0 and ch in "\r\n":
            if cur:
                out.append("".join(cur))
                cur = []
        else:
            cur.append(ch)
    if cur:
        out.append("".join(cur))
    return out


def parse(text):
    """脚本文本 → [AST] 列表。"""
    out = []
    for i, raw in enumerate(split_statements(text)):
        node = parse_line(raw)
        if node:
            node["stmt"] = i + 1
            out.append(node)
    return out


# ---------------------------------------------------------------- 常用抽取

CHANGE_RE = re.compile(
    r"world\.change\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*"
    r"([^,]+),\s*([^,]+),\s*([^)]+)\)")


def find_changes(text):
    """world.change(目标map, 地砖bin, 元素ant, 元素bin, x, y, dir)"""
    out = []
    for g in CHANGE_RE.finditer(text):
        out.append({"targetMap": g.group(1).strip(),
                    "tileBin": g.group(2).strip(),
                    "elementAnt": g.group(3).strip(),
                    "elementBin": g.group(4).strip(),
                    "x": int(g.group(5)), "y": int(g.group(6)),
                    "dir": g.group(7).strip()})
    return out


def walk(nodes):
    for n in nodes:
        yield n