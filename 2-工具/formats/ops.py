"""从反编译源码自动提取脚本指令表 —— 逆向自 e.java / f.java / ax.java

做法不是硬编码指令清单，而是扫源码里的两处结构：
  1) 命名空间分发：xxx.startsWith("<ns>")
  2) 指令分派：    .equals("<cmd>")
再按行号落在哪个命名空间区间内归类，并滤掉「参数取值」型 token
（形如 xxx.equals("true")、equals("left") 这类是被比较的字面量而非指令名）。

这样得到的表可随源码变化重新生成，也便于逐条回溯行号。
"""
from __future__ import annotations

import os
import re
import collections

# 形如 .equals("x") 但 x 是「取值」而非「指令名」的 token。
#
# ★ 只收录真正的【参数取值】。曾误把 in / out / clear / reverse / gray /
#   black / ybdx / verse 当成取值过滤掉，导致自动提取的指令表漏掉了
#   npc.in、partner.in、partner.out、game.clear 四条真指令 ——
#   已在 e.java:2760 / 2800 / 2814 / 3038 逐条确认它们是独立指令分支。
VALUE_TOKENS = {
    # 布尔/空值
    "true", "false", "yes", "no", "none", "null",
    # setState / setType / setFlyEnabled 的取值
    "type_right", "stand", "walk", "fly",
    # setDirection 与 game.waitForKey 的键位取值
    "left", "right", "up", "down", "fire",
    # 数字字面量比较
    "0", "1",
}

CMD_RE = re.compile(r'\.equals\("([^"]*)"\)')
NS_RE = re.compile(r'startsWith\("([^"]*)"\)')
TOKEN_OK = re.compile(r"[A-Za-z_][A-Za-z0-9_\-]*")


class Dispatcher:
    """一个类里的命名空间 → 指令 映射。"""

    def __init__(self, path: str, cli: str):
        self.path = path
        self.cls = cli
        with open(path, encoding="utf-8") as f:
            self.lines = f.read().split("\n")

    def namespaces(self, ignore: set[str] | None = None) -> list[tuple[int, str]]:
        """返回 [(行号, 命名空间)]，按行号升序。"""
        ignore = ignore or set()
        out = []
        for i, line in enumerate(self.lines, 1):
            for m in NS_RE.finditer(line):
                ns = m.group(1)
                if ns in ignore or not TOKEN_OK.fullmatch(ns):
                    continue
                out.append((i, ns))
        return out

    def ns_at(self, line: int, ignore: set[str] | None = None) -> str | None:
        cur = None
        for start, ns in self.namespaces(ignore):
            if line >= start:
                cur = ns
        return cur

    def commands(self, ignore_values: bool = True) -> dict[str, dict[str, list[int]]]:
        """命名空间 → {指令名: [行号,...]}"""
        out: dict[str, dict[str, list[int]]] = collections.defaultdict(lambda: collections.defaultdict(list))
        for i, line in enumerate(self.lines, 1):
            ns = self.ns_at(i)
            if ns is None:
                continue
            for m in CMD_RE.finditer(line):
                tok = m.group(1)
                if not TOKEN_OK.fullmatch(tok):
                    continue
                if ignore_values and tok in VALUE_TOKENS:
                    continue
                out[ns][tok].append(i)
        return {k: dict(v) for k, v in out.items()}

    def block(self, start: int, end: int) -> str:
        return "\n".join(self.lines[start - 1:end])

    def conditions(self) -> list[dict]:
        """提取 startsWith 形式的条件判断（eventMarked / player.xxx / partner.xxx ...）。"""
        out = []
        for i, line in enumerate(self.lines, 1):
            s = line.strip()
            m = re.search(r'startsWith\("([^"]+)"\)', s)
            if not m:
                continue
            tok = m.group(1)
            if not (tok.startswith("!") or "Marked" in tok or tok.startswith(("player.", "partner.", "element", "npc"))):
                continue
            out.append({"cond": tok, "line": i, "code": s})
        return out


def source_ref(base: str, cls: str, line: int, note: str = "") -> dict:
    d = {"class": "%s/%s.java" % (base, cls), "line": line}
    if note:
        d["note"] = note
    return d


def extract_rpg_ops(src_root: str) -> dict:
    """e.java：RPG 主解释器。"""
    base = "4-文档/反编译源码"
    d = Dispatcher(os.path.join(src_root, "e.java"), "e")
    ns_lines = d.namespaces()
    cmds = d.commands()
    conds = d.conditions()
    return {
        "dispatcher": {
            "namespaces": [{"ns": ns, "line": ln} for ln, ns in ns_lines],
            "method": "a(Object, Object) — 逐行解析并按命名空间分派",
            "note": "同一命名空间可能出现多次（如 script 在 2469 与 2908），"
                    "后者是同一 if/else 链上的补充分支，提取时按区间归并",
        },
        "namespaces": {
            ns: {
                "ops": sorted(
                    ({"cmd": c, "lines": ls, "src": source_ref(base, "e", min(ls))} for c, ls in sorted(cs.items())),
                    key=lambda r: min(r["lines"]),
                ),
                "count": len(cs),
            }
            for ns, cs in sorted(cmds.items())
        },
        "conditions": [{"cond": c["cond"], "src": source_ref(base, "e", c["line"])} for c in conds],
        "totalOps": sum(len(v) for v in cmds.values()),
    }


def extract_fight_ops(src_root: str) -> dict:
    """f.java：战斗画面脚本解释器。"""
    base = "4-文档/反编译源码"
    d = Dispatcher(os.path.join(src_root, "f.java"), "f")
    cmds = d.commands()
    return {
        "namespaces": {
            ns: {
                "ops": sorted(
                    ({"cmd": c, "lines": ls, "src": source_ref(base, "f", min(ls))} for c, ls in sorted(cs.items())),
                    key=lambda r: min(r["lines"]),
                ),
                "count": len(cs),
            }
            for ns, cs in sorted(cmds.items())
        },
        "totalOps": sum(len(v) for v in cmds.values()),
    }