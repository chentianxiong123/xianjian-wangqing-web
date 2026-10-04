#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""20-解析资源.py — 资源层全量提取

输入: 1-解包产物/解包树/{ant,bin,map,str}
输出: 3-数据/
    01-ant/<name>.ant.json          75 个动画(裁剪表/图层组/命名状态)
    02-map/<name>.map.json          69 张地图(瓦片/元素/遮挡/区域/触发器/脚本AST)
    03-bin/index.json               资源包清单 + 跨包引用解析表
    04-资源/sprites/<bin>/<idx>.png 每个条目一张 PNG(含 .pix 解码与 #引用解析)
    08-npc/npc_定义.json            39 个数字命名 str 的 NPC 定义
    manifest.json                   覆盖率 + 每文件 sha256

铁律: 每个解析器都 assert 字节精确耗尽(见 formats/)。
"""
import glob
import hashlib
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from formats import TREE, FormatError
from formats import ant as F_ant
from formats import binres as F_bin
from formats import mapfile as F_map
from formats import script as F_script
from formats import strfile as F_str

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "3-数据")
WEB_SPRITES = os.path.join(ROOT, "5-复刻引擎", "web", "data", "sprites")


def sha(b):
    return hashlib.sha256(b).hexdigest()


def write_json(rel, obj):
    p = os.path.join(DATA, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))
    return p, os.path.getsize(p)


def main():
    report = {"ok": 0, "fail": 0, "errors": []}
    manifest = {"format": "仙剑奇侠传-忘情篇 资源层提取",
                "source_jar": "0-原始素材/仙剑奇侠传-忘情篇.jar",
                "spec": "4-文档/格式规范/00-逆向备忘.md",
                "groups": {}}

    # ============================================================ BIN
    print("== BIN 资源包 ==")
    bins = {}
    for p in sorted(glob.glob(os.path.join(TREE, "bin", "*.bin"))):
        stem = os.path.basename(p)[:-4]
        raw = open(p, "rb").read()
        bins[stem] = F_bin.parse_bin(
            F_bin.load_raw(p), where=stem)
    resolver = F_bin.BinResolver(bins)
    counts = {k: len(v) for k, v in bins.items()}

    bin_index = {}
    for stem, entries in bins.items():
        outdir = os.path.join(WEB_SPRITES, stem)
        os.makedirs(outdir, exist_ok=True)
        rows = []
        for e in entries:
            name, png, w, h = resolver.resolve(stem, e["index"])
            dst = os.path.join(outdir, "%03d.png" % e["index"])
            with open(dst, "wb") as f:
                f.write(png)
            rows.append({"index": e["index"], "entry": e["name"],
                         "kind": F_bin.entry_kind(e["name"]),
                         "resolved": name, "png": os.path.relpath(dst, ROOT),
                         "sha256": sha(png)})
        bin_index[stem] = {"count": len(entries), "entries": rows}
    npng = sum(1 for s in bin_index.values() for r in s["entries"])
    print("   %d 个 BIN / %d 个条目 → %d 张 PNG"
          % (len(bins), npng, npng))
    write_json("03-bin/index.json", bin_index)

    # ============================================================ ANT
    print("== ANT 动画 ==")
    ants = {}
    for p in sorted(glob.glob(os.path.join(TREE, "ant", "*.ant"))):
        name = os.path.basename(p)
        try:
            a = F_ant.load(p)
            need = max(c["sheet"] for c in a["clips"]) if a["clips"] else -1
            b = F_ant.resolve_bin(name, need, counts)
            if not b or counts.get(b, 0) <= need:
                raise FormatError("无法归属 BIN (最大 sheet=%d)" % need)
            a["file"] = name
            a["bin"] = b
            a["binCount"] = counts[b]
            a["sha256"] = sha(open(p, "rb").read())
            ants[name] = a
            write_json("01-ant/%s.json" % name[:-4], a)
            report["ok"] += 1
        except Exception as ex:
            report["fail"] += 1
            report["errors"].append("%s: %s: %s" % (name, type(ex).__name__, ex))
    nstate = sum(len(a["states"]) for a in ants.values())
    print("   %d 个 ANT / %d 个命名状态 → 01-ant/" % (len(ants), nstate))
    manifest["groups"]["ant"] = {
        "dir": "01-ant/", "files": len(ants),
        "named_states": nstate,
        "total_clips": sum(len(a["clips"]) for a in ants.values()),
        "total_layers": sum(len(a["layers"]) for a in ants.values()),
        "status": "100% (字节级校验通过)" if not report["fail"] else "有失败"}

    # ============================================================ MAP
    print("== MAP 场景 ==")
    maps = {}
    gamecfg = F_str.load(os.path.join(TREE, "str", "config_game.str"))
    fallback_ant = gamecfg.get("初始场景元素动画", "mishi.ant")
    fallback_bin = gamecfg.get("初始场景地砖资源", "ms.bin")

    for p in sorted(glob.glob(os.path.join(TREE, "map", "*.map"))):
        name = os.path.basename(p)
        try:
            m = F_map.load(p)
            m["file"] = name
            m["sha256"] = sha(open(p, "rb").read())
            m["scriptAst"] = F_script.parse(m["script"])
            m["exits"] = []
            texts = [m["script"]]
            # 对象 / 区域 / 触发器 自带的脚本同样要解析成 AST。
            # ★ element.addToNpc 等 NPC 定义就在对象级脚本里
            #   （实测 69 张地图共 257 处），只解析地图级脚本会整段丢失。
            for l in m["layers"]:
                for o in l["objects"]:
                    if o["script"]:
                        o["scriptAst"] = F_script.parse(o["script"])
                    if o["script"]:
                        texts.append(o["script"])
                for rg in l["regions"]:
                    if rg.get("script"):
                        rg["scriptAst"] = F_script.parse(rg["script"])
                        texts.append(rg["script"])
                for t in l["triggers"]:
                    if t.get("script"):
                        t["scriptAst"] = F_script.parse(t["script"])
                        texts.append(t["script"])
            for t in texts:
                for ch in F_script.find_changes(t):
                    ch["from"] = name
                    m["exits"].append(ch)
            m["elementAnt"] = None
            m["tileBin"] = None
            maps[name] = m
            report["ok"] += 1
        except Exception as ex:
            report["fail"] += 1
            report["errors"].append("%s: %s: %s" % (name, type(ex).__name__, ex))

    # world.change 携带目标地图的 ANT → 地图↔ANT 是多对多
    amap = {}
    for m in maps.values():
        for ch in m["exits"]:
            tgt = maps.get(ch["targetMap"])
            if not tgt:
                continue
            tgt.setdefault("ants", {})
            tgt["ants"][ch["elementAnt"]] = {
                "tileBin": ch["tileBin"], "elementBin": ch["elementBin"],
                "via": m["file"]}
    for name, m in maps.items():
        ants_of = m.get("ants") or {}
        m["elementAnt"] = next(iter(ants_of)) if ants_of else fallback_ant
        m["tileBin"] = next(iter(v["tileBin"] for v in ants_of.values())) \
            if ants_of else fallback_bin
        m["elementAnts"] = sorted(ants_of)
        write_json("02-map/%s.json" % name[:-4], m)

    nobj = sum(len(l["objects"]) for m in maps.values() for l in m["layers"])
    nreg = sum(len(l["regions"]) for m in maps.values() for l in m["layers"])
    print("   %d 张地图 / %d 个元素对象 / %d 个区域 / %d 个出口 → 02-map/"
          % (len(maps), nobj, nreg, sum(len(m["exits"]) for m in maps.values())))
    manifest["groups"]["map"] = {
        "dir": "02-map/", "files": len(maps),
        "objects": nobj, "regions": nreg,
        "exits": sum(len(m["exits"]) for m in maps.values()),
        "status": "100% (字节级校验通过)" if len(maps) == 69 else "不完整"}

    # ============================================================ NPC 定义 str
    print("== NPC 定义 (数字命名 str) ==")
    npcdefs = {}
    for p in sorted(glob.glob(os.path.join(TREE, "str", "*.str"))):
        name = os.path.basename(p)
        if not re.match(r"^\d+\.str$", name):
            continue
        try:
            cfg = F_str.load(p)
            d = F_str.parse_npc_def(cfg)
            d["file"] = name
            d["raw"] = cfg
            npcdefs[name[:-4]] = d
        except Exception as ex:
            report["errors"].append("%s: %s" % (name, ex))
    write_json("08-npc/npc_定义.json", npcdefs)
    print("   %d 个 NPC 定义 → 08-npc/npc_定义.json" % len(npcdefs))
    manifest["groups"]["npc_def"] = {
        "dir": "08-npc/npc_定义.json", "files": len(npcdefs),
        "status": "来自 39 个数字命名 str"}

    # ============================================================ 标题/杂项 (corp/logo)
    # jar 里 ant/bin/map/str/mid 主目录之外的资源：
    #   corp/logo.ant + logo.png + logo.mid ＝ 标题画面（h.java：黑底 LOGO 动画 + 音乐，播完进游戏）
    #   logo/sp.png ＝ 启动 splash（Startup.java）；icon.png ＝ 图标
    #   dcn.bin ＝ 短信计费配置（bb.java，非游戏内容，存档备查）
    print("== 标题/杂项 (corp/logo) ==")
    try:
        lp = os.path.join(TREE, "corp", "logo.ant")
        a = F_ant.load(lp)
        a["file"] = "corp/logo.ant"
        # ★ sheet 0 就是 logo.png 本身（h.java 直接加载 /corp/logo.png 做图源），不归属任何 BIN
        a["bin"] = "logo"
        a["binCount"] = 1
        a["sha256"] = sha(open(lp, "rb").read())
        write_json("01-ant/logo.json", a)
        ldir = os.path.join(WEB_SPRITES, "logo")
        os.makedirs(ldir, exist_ok=True)
        with open(os.path.join(TREE, "corp", "logo.png"), "rb") as f:
            png = f.read()
        with open(os.path.join(ldir, "000.png"), "wb") as f:
            f.write(png)
        write_json("03-bin/logo.json",
                   {"count": 1, "entries": [{"index": 0, "entry": "logo.png",
                                             "kind": "png", "resolved": "logo.png",
                                             "png": "5-复刻引擎/web/data/sprites/logo/000.png",
                                             "sha256": sha(png)}]})
        import shutil
        webmid = os.path.join(ROOT, "5-复刻引擎", "web", "mid")
        os.makedirs(webmid, exist_ok=True)
        shutil.copy(os.path.join(TREE, "corp", "logo.mid"),
                    os.path.join(webmid, "logo.mid"))
        imgdir = os.path.join(ROOT, "5-复刻引擎", "web", "data", "img")
        os.makedirs(imgdir, exist_ok=True)
        shutil.copy(os.path.join(TREE, "logo", "sp.png"), os.path.join(imgdir, "sp.png"))
        with open(os.path.join(TREE, "icon.png"), "rb") as f:
            icon = f.read()
        with open(os.path.join(imgdir, "icon.png"), "wb") as f:
            f.write(icon)
        report["ok"] += 1
        print("   logo.ant(%d 状态) + logo.png + logo.mid + sp.png + icon.png" % len(a["states"]))
    except Exception as ex:
        report["fail"] += 1
        report["errors"].append("corp/logo: %s: %s" % (type(ex).__name__, ex))
    try:
        dcn = open(os.path.join(TREE, "dcn.bin"), "rb").read().decode("gbk", errors="replace")
        sms = {}
        for line in dcn.splitlines():
            line = line.strip()
            if line and ":" in line:
                k, v = line.split(":", 1)
                sms[k.strip()] = v.strip()
        write_json("09-其他/dcn_sms.json",
                   {"note": "短信计费配置（bb.java，非游戏内容；复刻版商城为免费激活）",
                    "entries": sms})
        print("   dcn.bin 短信配置 %d 项 → 09-其他/dcn_sms.json" % len(sms))
    except Exception as ex:
        report["fail"] += 1
        report["errors"].append("dcn.bin: %s: %s" % (type(ex).__name__, ex))

    # ============================================================ bin→web 索引
    write_json("../5-复刻引擎/web/data/bin_index.json",
               {k: v["count"] for k, v in bin_index.items()})

    # ============================================================ manifest
    manifest["totals"] = {"parsed_ok": report["ok"], "failed": report["fail"]}
    manifest["errors"] = report["errors"]
    os.makedirs(DATA, exist_ok=True)
    with open(os.path.join(DATA, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print("\n成功 %d / 失败 %d" % (report["ok"], report["fail"]))
    for e in report["errors"][:20]:
        print("  !", e)
    return 1 if report["fail"] else 0


if __name__ == "__main__":
    sys.exit(main())