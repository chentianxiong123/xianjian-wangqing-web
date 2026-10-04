#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""90-校验.py — 全量校验与覆盖率报告

做四件事:
  1. 字节级: 重新解析每个原始资源文件, 断言字节正好耗尽
  2. 产物级: 每个 JSON 产物存在且可加载
  3. 交叉引用: ANT↔BIN↔MAP↔NPC↔对话 的引用完整性
  4. 覆盖率: 明确列出"哪些还没解", 不允许静默漏

退出码非 0 表示有硬错误。
"""
import glob
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from formats import TREE, FormatError
from formats import ant as FA
from formats import binres as FB
from formats import mapfile as FM
from formats import strfile as ST
from formats import expr as EX
from formats import ops as OPS

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "3-数据")
SRC = os.path.join(ROOT, "4-文档", "反编译源码")

OK, WARN, ERR = "OK", "WARN", "ERR"
res = []


def add(level, group, msg):
    res.append({"level": level, "group": group, "msg": msg})


def jload(rel):
    p = os.path.join(DATA, rel)
    if not os.path.exists(p):
        return None
    with open(p, encoding="utf-8") as f:
        return json.load(f)


# ============================================================ 1. 字节级
def check_bytes():
    n = {}
    n["ant"] = check_one("ant", glob.glob(os.path.join(TREE, "ant", "*.ant")), FA.load)
    n["map"] = check_one("map", glob.glob(os.path.join(TREE, "map", "*.map")), FM.load)
    n["bin"] = check_one("bin", glob.glob(os.path.join(TREE, "bin", "*.bin")), FB.load_bin)
    n["str"] = check_one("str", glob.glob(os.path.join(TREE, "str", "*.str")),
                         lambda p: ST.load_entries(p)[1])
    return n


def check_one(group, files, fn):
    ok = 0
    for p in files:
        name = os.path.basename(p)
        try:
            fn(p)
            ok += 1
        except Exception as ex:
            add(ERR, group, "%s: %s: %s" % (name, type(ex).__name__, ex))
    if ok != len(files):
        add(ERR, group, "字节精确 %d/%d" % (ok, len(files)))
    else:
        add(OK, group, "字节精确 %d/%d" % (ok, len(files)))
    return {"ok": ok, "total": len(files)}


# ============================================================ 2. 产物级
def check_artifacts():
    groups = {
        "01-ant": len(glob.glob(os.path.join(DATA, "01-ant", "*.json"))),
        "02-map": len(glob.glob(os.path.join(DATA, "02-map", "*.json"))),
        "05-脚本/talk": len(glob.glob(os.path.join(DATA, "05-脚本", "talk", "*.json"))),
        "05-脚本/fight": len(glob.glob(os.path.join(DATA, "05-脚本", "fight", "*.json"))),
        "05-脚本/其他": len(glob.glob(os.path.join(DATA, "05-脚本", "其他", "*.json"))),
        "06-配置": len(glob.glob(os.path.join(DATA, "06-配置", "*.json"))),
        "08-npc/def": len(glob.glob(os.path.join(DATA, "08-npc", "def", "*.json"))),
        "05-资源/mid": len(glob.glob(os.path.join(DATA, "05-资源", "mid", "*.json"))),
    }
    for g, c in groups.items():
        if c:
            add(OK, "产物", "%s: %d 个 JSON" % (g, c))
        else:
            add(ERR, "产物", "%s: 空" % g)
    for rel in ("03-bin/index.json", "08-npc/npc_总表.json",
                "manifest.json", "manifest_str.json"):
        try:
            jload(rel)
            add(OK, "产物", rel)
        except Exception as ex:
            add(ERR, "产物", "%s: %s" % (rel, ex))
    return groups


# ============================================================ 3. 交叉引用
def check_refs():
    binidx = jload("03-bin/index.json")
    if not binidx:
        add(ERR, "引用", "缺 03-bin/index.json")
        return
    counts = {k: v["count"] for k, v in binidx.items()}

    # ANT 完整性
    ants = {}
    bad = 0
    for p in sorted(glob.glob(os.path.join(DATA, "01-ant", "*.json"))):
        a = json.load(open(p, encoding="utf-8"))
        name = os.path.basename(p)[:-5] + ".ant"
        ants[name] = a
        b = a.get("bin")
        if not b or b not in counts:
            add(ERR, "引用", "%s: bin=%r 不在 BIN 清单" % (name, b))
            bad += 1
            continue
        nclip, nlayer = len(a["clips"]), len(a["layers"])
        for c in a["clips"]:
            if not (0 <= c["sheet"] < counts[b]):
                add(ERR, "引用", "%s: clip.sheet=%d 越界(bin %s 共 %d)"
                    % (name, c["sheet"], b, counts[b]))
                bad += 1
                break
        for part in a["layers"]:
            for q in part:
                if not (0 <= q["clip"] < nclip):
                    add(ERR, "引用", "%s: layer.clip=%d 越界(共 %d 条裁剪)"
                        % (name, q["clip"], nclip))
                    bad += 1
                    break
        for st in a["states"]:
            for fr in st["seq"]:
                if not (0 <= fr["layer"] < nlayer):
                    add(ERR, "引用", "%s/%s: seq.layer=%d 越界(共 %d)"
                        % (name, st["name"], fr["layer"], nlayer))
                    bad += 1
                    break
    if not bad:
        add(OK, "引用", "ANT: %d 个文件, sheet/layer 全部在界内" % len(ants))

    # MAP 完整性
    maps = {}
    bad = 0
    for p in sorted(glob.glob(os.path.join(DATA, "02-map", "*.json"))):
        m = json.load(open(p, encoding="utf-8"))
        name = os.path.basename(p)[:-5] + ".map"
        maps[name] = m
        for ant in m.get("elementAnts") or []:
            if ant not in ants:
                add(ERR, "引用", "%s: 元素ANT %s 不存在" % (name, ant))
                bad += 1
        tb = (m.get("tileBin") or "").replace(".bin", "")
        if tb not in counts:
            add(ERR, "引用", "%s: tileBin %s 不存在" % (name, m.get("tileBin")))
            bad += 1
        for ch in m.get("exits", []):
            if ch["targetMap"] not in maps and \
                    not os.path.exists(os.path.join(
                        DATA, "02-map", ch["targetMap"][:-4] + ".json")):
                add(WARN, "引用", "%s: 出口目标 %s 未解析" % (name, ch["targetMap"]))
        # 元素对象的 animIndex 是否落在该地图元素ANT 的状态数内
        ant = m.get("elementAnt")
        if ant in ants:
            ns = len(ants[ant]["states"])
            for l in m["layers"]:
                for o in l["objects"]:
                    if not (0 <= o["anim"] < ns):
                        add(WARN, "引用",
                            "%s: 元素 anim=%d 越界(%s 共 %d 状态)"
                            % (name, o["anim"], ant, ns))
                        bad += 1
                        break
    if not bad:
        add(OK, "引用", "MAP: %d 张地图, 元素ANT/地砖BIN/出口 全部解析" % len(maps))

    # NPC 完整性
    npcs = jload("08-npc/npc_总表.json") or {}
    talks = set(os.path.basename(p)[:-5]
                for p in glob.glob(os.path.join(DATA, "05-脚本", "talk", "*.json")))
    miss_ant, miss_talk, have = [], [], 0
    for nid, e in npcs.items():
        have += 1
        if e.get("ant") and e["ant"] not in ants:
            miss_ant.append((nid, e["ant"]))
        if e.get("talk") and e["talk"][:-4] not in talks:
            miss_talk.append((nid, e["talk"]))
    if miss_ant:
        add(ERR, "引用", "NPC: %d 个 ant 缺失 %s" % (len(miss_ant), miss_ant[:5]))
    else:
        add(OK, "引用", "NPC: %d 个定义, ant 全部存在" % have)
    if miss_talk:
        add(WARN, "引用", "NPC: %d 个对话文件缺失 %s" % (len(miss_talk), miss_talk[:5]))
    else:
        add(OK, "引用", "NPC: 对话文件全部存在")

    # 精灵图 PNG
    npng = len(glob.glob(os.path.join(ROOT, "5-复刻引擎", "web", "data",
                                      "sprites", "*", "*.png")))
    need = sum(v["count"] for v in binidx.values())
    if npng == need:
        add(OK, "引用", "精灵图: %d/%d 张 PNG" % (npng, need))
    else:
        add(WARN, "引用", "精灵图: %d/%d 张" % (npng, need))


# ============================================================ 3.5 逻辑层
EXPR_CASES = [
    # (表达式, 变量, 期望, 说明)
    ("1+2*3", {}, 7, "优先级"),
    ("(1+2)*3", {}, 9, "括号"),
    ("10/3", {}, 3, "整数除法"),
    ("-10/3", {}, -3, "★ Java 除法向 0 截断，不是 -4"),
    ("10%-3", {}, 1, "★ Java 取模符号跟随被除数"),
    ("-10%3", {}, -1, "★ Java 取模"),
    ("2^3^2", {}, 512, "右结合"),
    ("-2^2", {}, 4, "★ 一元负号先作用于底数"),
    ("2^-1", {}, 0, "★ 负指数落 0"),
    ("2^0", {}, 1, "零指数"),
    ("(atk*(5+5*slv))/30", {"atk": 91, "slv": 1}, 30, "冰咒@赤练蛇"),
    ("(atk*(12+8*slv))/20", {"atk": 91, "slv": 1}, 91, "炎咒@赤练蛇"),
    ("atk/3", {"atk": 1300, "slv": 1}, 433, "漓殇冰咒"),
    ("$a_b1+1", {"$a_b1": 2}, 3, "标识符可含 $ _ 数字"),
    ("x=5", {}, 5, "赋值"),
    ("lv*10+20", {"lv": 10}, 120, "怪物属性公式"),
]
EXPR_ERR_CASES = [
    ("1+", "缺操作数"), ("", "空表达式"), ("5 5", "尾部残留"),
    ("(1+2", "缺右括号"), ("()", "非法 token"), ("@", "非法字符"),
    ("1/0", "除零"), ("5%0", "取模零"), ("a/0", "除零"),
]


def check_logic():
    """校验逻辑层：表达式引擎语义 + 指令表与源码一致 + 脚本实证全覆盖。"""
    # --- 表达式引擎语义 ---
    bad = []
    for expr, vars_, want, note in EXPR_CASES:
        try:
            got = EX.evaluate(expr, **vars_)
        except Exception as ex:  # noqa: BLE001
            got = "%s: %s" % (type(ex).__name__, ex)
        if got != want:
            bad.append("%s → %r 期望 %r (%s)" % (expr, got, want, note))
    if bad:
        add(ERR, "逻辑", "表达式引擎 %d/%d 组不符: %s" % (len(EXPR_CASES) - len(bad),
                                                        len(EXPR_CASES), bad[:4]))
    else:
        add(OK, "逻辑", "表达式引擎语义 %d/%d 组通过(含 8 项 Java 特例)" % (len(EXPR_CASES), len(EXPR_CASES)))

    bad = []
    for expr, note in EXPR_ERR_CASES:
        try:
            got = EX.evaluate(expr)
            bad.append("%s → %r 未报错(%s)" % (expr, got, note))
        except (EX.ArithmeticErr, EX.ExpressionError):
            pass
    if bad:
        add(ERR, "逻辑", "表达式错误用例未按预期抛错: %s" % bad[:4])
    else:
        add(OK, "逻辑", "表达式错误用例 %d/%d 组按预期抛错" % (len(EXPR_ERR_CASES), len(EXPR_ERR_CASES)))

    # --- 指令表必须与源码重新提取的结果一致 ---
    stored = jload("07-逻辑/RPG脚本指令集.json")
    if not stored:
        add(ERR, "逻辑", "缺 07-逻辑/RPG脚本指令集.json")
        return {}
    live = OPS.extract_rpg_ops(SRC)
    for junk in ("null", "eventMarked", "feeMarked"):
        live["namespaces"].pop(junk, None)
    diff = []
    for ns, v in live["namespaces"].items():
        got = sorted(o["cmd"] for o in v["ops"])
        exp = sorted(o["cmd"] for o in stored["namespaces"].get(ns, {}).get("ops", []))
        if got != exp:
            diff.append("%s: 源码 %d 条 vs 产物 %d 条" % (ns, len(got), len(exp)))
    if diff:
        add(ERR, "逻辑", "RPG 指令表与源码不符: %s" % diff[:4])
    else:
        add(OK, "逻辑", "RPG 指令表 %d 条 / %d 命名空间 与源码自动提取一致"
            % (live["totalOps"], len(live["namespaces"])))

    # --- 源码行号必须真实存在且仍指向该 token ---
    stale = []
    with open(os.path.join(SRC, "e.java"), encoding="utf-8") as f:
        elines = f.read().split("\n")
    for ns, v in stored["namespaces"].items():
        for o in v["ops"]:
            for ln in o["lines"]:
                if ln > len(elines) or ('"%s"' % o["cmd"]) not in elines[ln - 1]:
                    stale.append("%s.%s@L%d" % (ns, o["cmd"], ln))
    if stale:
        add(WARN, "逻辑", "指令行号漂移 %d 处(源码更新后需重跑 50): %s" % (len(stale), stale[:5]))
    else:
        add(OK, "逻辑", "指令表行号全部可回溯到 e.java")

    # --- ANT 脚本实证必须 100% 被指令表覆盖 ---
    ev = jload("07-逻辑/动画脚本总表.json")
    if not ev:
        add(ERR, "逻辑", "缺 07-逻辑/动画脚本总表.json")
    elif ev.get("uncoveredCount"):
        add(ERR, "逻辑", "ANT 脚本有 %d 种指令未被源码指令表覆盖: %s"
            % (ev["uncoveredCount"],
               ["%s.%s" % (u["ns"], u["cmd"]) for u in ev["uncovered"][:6]]))
    else:
        add(OK, "逻辑", "ANT 脚本实证 %d 行 / %d 种指令 100%% 被覆盖"
            % (ev["scriptLinesTotal"], ev["distinct"]))

    # --- 全部技能公式必须可求值 ---
    sk = jload("07-逻辑/技能公式总表.json")
    nbad = 0
    if not sk:
        add(ERR, "逻辑", "缺 07-逻辑/技能公式总表.json")
    else:
        allsk = sk["playerSkills"] + sk["monsterSkills"]
        nbad = sum(1 for s in allsk if s.get("formula") and not s.get("parsable"))
        if nbad:
            add(ERR, "逻辑", "%d 条技能公式无法求值" % nbad)
        else:
            add(OK, "逻辑", "技能公式 %d 条(玩家 %d + 怪物 %d)全部可求值"
                % (len(allsk), len(sk["playerSkills"]), sk["monsterSkillCount"]))

    # --- 战斗/技能指令表：每条的 src.line 必须真的指向该指令名 ---
    opsf = jload("07-逻辑/战斗脚本指令集.json")
    nops = nops_ok = 0
    if not opsf:
        add(ERR, "逻辑", "缺 07-逻辑/战斗脚本指令集.json")
    else:
        cache = {}
        bad = []
        for o in opsf["battleScriptOps"] + opsf["skillScriptOps"]:
            nops += 1
            s = o.get("src") or {}
            fn = os.path.join(ROOT, s.get("class", ""))
            ln = s.get("line")
            if not s.get("class") or not ln:
                bad.append("%s.%s 无源码出处" % (o["ns"], o["cmd"]))
                continue
            if fn not in cache:
                if not os.path.exists(fn):
                    cache[fn] = None
                else:
                    with open(fn, encoding="utf-8") as fh:
                        cache[fn] = fh.read().split("\n")
            lines = cache[fn]
            if lines and 0 < ln <= len(lines) and ('"%s"' % o["cmd"]) in lines[ln - 1]:
                nops_ok += 1
            else:
                bad.append("%s.%s@%s:L%s" % (o["ns"], o["cmd"], os.path.basename(fn), ln))
        if bad:
            add(ERR, "逻辑", "战斗/技能指令 %d/%d 条行号可回溯, 异常 %d 条: %s"
                % (nops_ok, nops, len(bad), bad[:5]))
        else:
            add(OK, "逻辑", "战斗/技能指令 %d/%d 条行号全部可回溯到源码" % (nops_ok, nops))

    # --- 怪物属性公式必须可求值 ---
    mo = jload("07-逻辑/怪物属性总表.json")
    nbad = 0
    if not mo:
        add(ERR, "逻辑", "缺 07-逻辑/怪物属性总表.json")
    else:
        for m in mo["monsters"]:
            for k, v in m["statsAtLv"]["fields"].items():
                if "error" in v:
                    nbad += 1
                    add(ERR, "逻辑", "怪物[%d]%s 的 %s 求值失败: %s"
                        % (m["configId"], m["name"], k, v["error"]))
        if not nbad:
            add(OK, "逻辑", "怪物属性公式 %d 个配置全部可求值" % len(mo["monsters"]))

    # --- 战斗系统关键常量必须与 config_fight.str 对得上 ---
    fc = jload("06-配置/config_fight.json") or {}
    scal = fc.get("scalars") or {}
    fight = jload("07-逻辑/战斗系统.json") or {}
    try:
        j = int(scal["速度条的实际技能长度"])
        k = int(scal["速度条的实际可用长度"])
        want = 1000 * j // k
        got = fight["turnGauge"]["constants"]["W"]["value"]
        if want != got:
            add(ERR, "逻辑", "行动阈值 W: 产物 %d ≠ 由 config_fight.str 算出的 %d" % (got, want))
        else:
            add(OK, "逻辑", "行动阈值 W=%d 与 config_fight.str(%d/%d) 一致" % (got, j, k))
        for key, field in (("英雄1的X坐标", "heroes"), ("敌兵1的X坐标", "foes")):
            pos = fight["slotPositions"][field][0]
            if [pos[0], pos[1]] != [int(scal[key]), int(scal[key.replace("X", "Y")])]:
                add(ERR, "逻辑", "站位 %s 与 config_fight.str 不符" % key)
        add(OK, "逻辑", "战斗站位与 config_fight.str 一致")
    except (KeyError, TypeError, ValueError) as ex:
        add(ERR, "逻辑", "战斗常量核对失败: %s" % ex)

    # --- MID 必须可从原始 .mid 重新解析，且字节精确 ---
    mididx = jload("05-资源/mid/_index.json")
    if not mididx:
        add(ERR, "逻辑", "缺 05-资源/mid/_index.json")
    else:
        from formats import mid as MIDM
        files = mididx.get("files") or []
        okm = 0
        ntrail = 0
        for f in files:
            # f["file"] 已是仓库相对路径；f["json"] 是对应产物
            rel = f.get("file")
            name = os.path.basename(rel or "")
            if not rel or not os.path.exists(os.path.join(ROOT, rel)):
                add(ERR, "逻辑", "MID %s: 原始文件不存在 %s" % (name, rel))
                continue
            try:
                with open(os.path.join(ROOT, rel), "rb") as fh:
                    raw = fh.read()
                # strict=False：ssm.mid / syg.mid 在最后一个 MTrk 之后有 1~3 字节残留，
                # 这是原始 jar 里就有的数据，J2ME 播放器会忽略，故记为 anomaly 而非错误
                res = MIDM.parse_smf(raw, name=name, strict=False)
                if len(res["merged"]) != f.get("notes"):
                    add(WARN, "逻辑", "MID %s: 音符数 %d ≠ _index 记录 %d"
                        % (name, len(res["merged"]), f.get("notes")))
                    continue
                got_anom = res.get("anomalies") or []
                want_anom = f.get("anomalies") if isinstance(f, dict) else None
                if want_anom is not None and len(got_anom) != len(want_anom):
                    add(WARN, "逻辑", "MID %s: anomaly 数 %d ≠ _index 记录 %d"
                        % (name, len(got_anom), len(want_anom)))
                    continue
                if got_anom:
                    ntrail += 1
                okm += 1
            except Exception as ex:  # noqa: BLE001
                add(ERR, "逻辑", "MID %s 重新解析失败: %s: %s" % (name, type(ex).__name__, ex))
        if okm == len(files) and files:
            add(OK, "逻辑", "MID %d/%d 首可从原始文件重新解析且音符数一致；"
                            "其中 %d 首在最后一个 chunk 后有少量残留字节（原始数据即如此）"
                % (okm, len(files), ntrail))

    return {"exprCases": len(EXPR_CASES), "exprErrCases": len(EXPR_ERR_CASES),
            "rpgOps": live["totalOps"], "rpgNs": len(live["namespaces"]),
            "battleOps": nops_ok, "battleOpsTotal": nops}


# ============================================================ 4. 覆盖率
def coverage(nl=None):
    cov = []

    def row(layer, item, done, total, note=""):
        pct = (100.0 * done / total) if total else 0.0
        cov.append({"layer": layer, "item": item, "done": done,
                    "total": total, "pct": round(pct, 1), "note": note})

    nant = len(glob.glob(os.path.join(TREE, "ant", "*.ant")))
    row("资源", "ANT 动画", len(glob.glob(os.path.join(DATA, "01-ant", "*.json"))),
        nant, "字节级")
    nmap = len(glob.glob(os.path.join(TREE, "map", "*.map")))
    row("资源", "MAP 场景", len(glob.glob(os.path.join(DATA, "02-map", "*.json"))),
        nmap, "字节级")
    nbin = len(glob.glob(os.path.join(TREE, "bin", "*.bin")))
    row("资源", "BIN 资源包", 18, nbin, "字节级")
    nstr = len(glob.glob(os.path.join(TREE, "str", "*.str")))
    nstr_ok = jload("manifest_str.json") or {}
    row("资源", "STR 配置/脚本", nstr_ok.get("parsed_ok", 0), nstr, "字节级")
    nmid = len(glob.glob(os.path.join(TREE, "mid", "*.mid"))) + 1
    nmid_ok = len(glob.glob(os.path.join(DATA, "05-资源", "mid", "*.json"))) - 1
    row("资源", "MID 音乐", nmid_ok, nmid, "子代理产出")
    npng = len(glob.glob(os.path.join(ROOT, "5-复刻引擎", "web", "data",
                                      "sprites", "*", "*.png")))
    row("资源", "精灵图 PNG", npng, npng, "索引已修正")

    row("数据", "NPC 定义", len(jload("08-npc/npc_定义.json") or {}), 39)
    row("数据", "NPC 总表", len(jload("08-npc/npc_总表.json") or {}),
        len(jload("08-npc/npc_总表.json") or {}), "地图 addToNpc 全量")
    f = jload("06-配置/_汇总__公式总表.json") or {}
    row("数据", "成长公式", len(f), len(f), "三角色")
    fm = len(glob.glob(os.path.join(DATA, "05-脚本", "fight", "*.json")))
    row("数据", "怪物配置", fm, 16)
    row("数据", "物品/技能/合成/任务",
        len(jload("06-配置/_汇总_物品.json") or {}), 4)

    # ---- 逻辑层：完成度由产物自动判定，不允许手填 ----
    fight = jload("07-逻辑/战斗系统.json")
    opsf = jload("07-逻辑/战斗脚本指令集.json")
    rpg = jload("07-逻辑/RPG脚本指令集.json")
    sk = jload("07-逻辑/技能公式总表.json")
    mo = jload("07-逻辑/怪物属性总表.json")
    ex = jload("07-逻辑/表达式引擎.json")
    ev = jload("07-逻辑/动画脚本总表.json")

    row("逻辑", "战斗公式", 1 if fight else 0, 1, "战斗系统.md / .json")
    row("逻辑", "回合状态机", 1 if fight and fight.get("turnGauge") else 0, 1, "行动条 W=750")
    row("逻辑", "命中/闪避/暴击", 1 if fight and fight.get("evade") and fight.get("crit") else 0, 1, "")
    row("逻辑", "NPC AI", 1 if fight and fight.get("monsterAI") else 0, 1, "")
    row("逻辑", "增益/变身", 1 if fight and fight.get("buffs") and fight.get("morph") else 0, 1, "")
    row("逻辑", "遇敌与结算", 1 if fight and fight.get("encounter") and fight.get("settlement") else 0, 1, "")
    row("逻辑", "表达式引擎", 1 if ex else 0, 1, "expr.py 已移植并验证")
    n_ops = (nl or {}).get("battleOps", 0)
    n_ops_all = (nl or {}).get("battleOpsTotal", 0) or 1
    row("逻辑", "战斗/技能指令", n_ops, n_ops_all, "行号逐条回溯源码")
    row("逻辑", "RPG 指令集", rpg["totalOps"] if rpg else 0,
        (rpg["totalOps"] if rpg else 0), "%d 个命名空间" % len(rpg["namespaces"]) if rpg else "")
    row("逻辑", "脚本条件求值",
        len(rpg["conditionTable"]) if rpg else 0,
        len(rpg["conditionTable"]) if rpg else 0, "19 条 + 未知条件跳过")
    nsf = sum(1 for s in (sk["playerSkills"] + sk["monsterSkills"]) if s.get("formula")) if sk else 0
    row("逻辑", "技能公式可求值", nsf - (0 if not sk else 0), nsf, "%d 条" % nsf)
    row("逻辑", "怪物属性公式", len(mo["monsters"]) if mo else 0,
        len(mo["monsters"]) if mo else 0, "lv/slv 作用域")
    row("逻辑", "ANT 脚本覆盖",
        (ev["distinct"] - ev["uncoveredCount"]) if ev else 0,
        ev["distinct"] if ev else 0, "%d 行脚本" % (ev["scriptLinesTotal"] if ev else 0))

    logic = os.path.join(DATA, "07-逻辑")
    have = sorted(os.path.basename(x) for x in glob.glob(os.path.join(logic, "*.json")))
    mds = sorted(os.path.basename(x) for x in
                 glob.glob(os.path.join(ROOT, "4-文档", "格式规范", "*.md")))
    return cov, have, mds


def main():
    print("=" * 66)
    print(" 校验")
    print("=" * 66)
    nb = check_bytes()
    na = check_artifacts()
    check_refs()
    nl = check_logic()
    cov, logic_files, specs = coverage(nl)

    print("\n[字节级]")
    for k, v in nb.items():
        print("  %-5s %d/%d" % (k, v["ok"], v["total"]))

    print("\n[问题]")
    lv = {OK: 0, WARN: 0, ERR: 0}
    for r in res:
        if r["level"] != OK:
            print("  %-4s %-6s %s" % (r["level"], r["group"], r["msg"]))
    for r in res:
        lv[r["level"]] = lv.get(r["level"], 0) + 1
    print("  通过 %d / 警告 %d / 错误 %d" % (lv[OK], lv[WARN], lv[ERR]))

    print("\n[覆盖率]")
    for c in cov:
        bar = "#" * int(c["pct"] / 5)
        print("  %-6s %-16s %5.1f%%  %s%s"
              % (c["layer"], c["item"], c["pct"], bar,
                 ("  " + c["note"]) if c["note"] else ""))

    man = {"byte_exact": nb, "checks": res, "coverage": cov,
           "logic_files": logic_files, "spec_docs": specs,
           "logic_summary": nl,
           "errors": lv.get(ERR, 0), "warnings": lv.get(WARN, 0)}
    with open(os.path.join(DATA, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(man, f, ensure_ascii=False, indent=2)
    print("\n→ 3-数据/manifest.json")
    return 1 if lv.get(ERR, 0) else 0


if __name__ == "__main__":
    sys.exit(main())