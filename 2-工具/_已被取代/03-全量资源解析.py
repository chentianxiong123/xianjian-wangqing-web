#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""03-全量资源解析.py — 从反编译得到的格式规范出发，一次性导出全部资源。

依赖的格式规范全部来自 CFR 反编译 74 个 class 的结果:
  d.java  → ANT 动画   (88ANT)
  w.java  → MAP  场景   (88MAP)
  x.java  → BIN  资源包 (88BIN)
  ba.java → PIX  像素矩阵(88PIX)
  bg.java → STR  配置   (88STR)
  e.java  → 脚本指令集 / world.change() 地图跳转与元素动画绑定

输出 (默认写到 5-复刻引擎/web/data/):
  ants.js        全部 75 个 ANT 的完整结构 (裁剪表 / 图层组 / 命名状态)
  maps.js        全部 69 个 MAP 的完整结构 (瓦片 / 元素 / 遮挡 / 区域 / 触发器 / 脚本)
  npc_config.js  完整 NPC 定义 (ID → ant / 名字 / 对话 / 移动 / 出现位置)
  sprites/<bin>/<idx>.png   每个 BIN 条目一张 PNG (含 .pix 解码与 #跨包引用解析)
"""
import gzip, struct, os, sys, glob, json, re, io

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TREE = os.path.join(ROOT, "1-解包产物", "解包树")
WEB = os.path.join(ROOT, "5-复刻引擎", "web", "data")

# ---------------------------------------------------------------- 基础工具

def load_raw(path):
    d = open(path, "rb").read()
    return gzip.decompress(d) if d[:2] == b"\x1f\x8b" else d


class R:
    __slots__ = ("b", "p")
    def __init__(self, b): self.b, self.p = b, 0
    def u8(self):
        v = self.b[self.p]; self.p += 1; return v
    def i8(self):
        v = struct.unpack_from(">b", self.b, self.p)[0]; self.p += 1; return v
    def i16(self):
        v = struct.unpack_from(">h", self.b, self.p)[0]; self.p += 2; return v
    def u16(self):
        v = struct.unpack_from(">H", self.b, self.p)[0]; self.p += 2; return v
    def i32(self):
        v = struct.unpack_from(">i", self.b, self.p)[0]; self.p += 4; return v
    def i64(self):
        v = struct.unpack_from(">q", self.b, self.p)[0]; self.p += 8; return v
    def utf(self):
        n = self.u16()
        v = self.b[self.p:self.p + n].decode("utf-8", "replace"); self.p += n
        return v

# ---------------------------------------------------------------- BIN / PIX

def parse_bin(path):
    d = load_raw(path)
    r = R(d)
    if bytes([r.u8(), r.u8(), r.u8(), r.u8()]) != b"\x88BIN" or r.u8() != 9:
        raise ValueError("bad BIN magic: %s" % os.path.basename(path))
    n = r.u16()
    out = []
    for _ in range(n):
        name = r.utf()
        ln = r.i32()
        out.append((name, d[r.p:r.p + ln]))
        r.p += ln
    assert r.p == len(d), "%s leftover %d" % (path, len(d) - r.p)
    return out


def parse_pix(data):
    # .pix 负载本身还是 gzip 压缩的
    if data[:2] == b"\x1f\x8b":
        data = gzip.decompress(data)
    r = R(data)
    if bytes([r.u8(), r.u8(), r.u8(), r.u8()]) != b"\x88PIX" or r.u8() != 1:
        raise ValueError("bad PIX magic")
    w, h = r.i32(), r.i32()
    px = list(struct.unpack_from(">%di" % (w * h), data, r.p))
    return w, h, px


def pix_to_png(w, h, argb):
    from PIL import Image
    im = Image.new("RGBA", (w, h))
    im.putdata([((v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF, (v >> 24) & 0xFF)
                for v in argb])
    buf = io.BytesIO(); im.save(buf, "PNG")
    return buf.getvalue()

# ---------------------------------------------------------------- ANT

ANT_BIN = {}          # ant 名 -> bin 名
_BIN_COUNT = {}

def resolve_ant_bin(ant_name, need):
    """ANT 的裁剪表 sheet 下标是所属 BIN 的条目下标。"""
    if ant_name in ANT_BIN:
        return ANT_BIN[ant_name]
    stem = ant_name[:-4] if ant_name.endswith(".ant") else ant_name
    cand = [b for b, c in _BIN_COUNT.items() if c > need]
    if stem in cand:
        ANT_BIN[ant_name] = stem
    elif stem.startswith("npc_") and "renwu" in cand:
        ANT_BIN[ant_name] = "renwu"
    elif cand:
        ANT_BIN[ant_name] = sorted(cand)[0]
    else:
        ANT_BIN[ant_name] = None
    return ANT_BIN[ant_name]


def parse_ant(path):
    d = load_raw(path)
    r = R(d)
    if bytes([r.u8(), r.u8(), r.u8(), r.u8()]) != b"\x88ANT":
        raise ValueError("bad ANT magic")
    ver = r.u8()
    if ver != 2:
        raise ValueError("bad ANT version %d" % ver)
    if r.u8():
        r.u16(); r.u16()
    n = r.u16()
    clips = [[r.u16(), r.i32(), r.i32(), r.i32(), r.i32()] for _ in range(n)]
    m = r.u16()
    layers = [[[r.u16(), r.i32(), r.i32(), r.i8()] for _ in range(r.u16())]
              for _ in range(m)]
    s = r.u16()
    states = []
    for _ in range(s):
        name = r.utf()
        tag = r.utf() if r.u8() else None
        nb = r.u16()
        seq = []
        for _ in range(nb):
            e = r.i16(); ox, oy, dur = r.i32(), r.i32(), r.i64()
            st = r.utf() if r.u8() else None
            fwd = [[r.i32(), r.i32(), r.i32(), r.i32()] +
                   ([r.utf()] if r.u8() else [None]) for _ in range(r.u16())]
            bwd = [[r.i32(), r.i32(), r.i32(), r.i32(), r.utf()]
                   for _ in range(r.u16())]
            seq.append({"layer": e, "ox": ox, "oy": oy, "dur": dur,
                        "tag": st, "fwd": fwd, "bwd": bwd})
        states.append({"name": name, "tag": tag, "seq": seq})
    assert r.p == len(d), "%s leftover %d" % (path, len(d) - r.p)
    return {"ver": ver, "clips": clips, "layers": layers, "states": states}

# ---------------------------------------------------------------- MAP

def parse_map(path):
    d = load_raw(path)
    r = R(d)
    if bytes([r.u8(), r.u8(), r.u8(), r.u8()]) != b"\x88MAP":
        raise ValueError("bad MAP magic")
    if r.u8() != 5:
        raise ValueError("bad MAP version")
    r.u8()
    res = r.i32()
    tw, th = r.u16(), r.u16()
    script = r.utf()
    nl = r.u8()
    cols, rows = r.u16(), r.u16()
    layers = []
    for _ in range(nl):
        name = r.utf()
        tiles = None
        if r.u8():
            tiles = [[r.u16() for _ in range(cols)] for _ in range(rows)]
        objs = [[r.u16(), r.i32(), r.i32()] +
                ([r.utf()] if r.u8() else [None]) for _ in range(r.u16())]
        regs = [[r.i32(), r.i32(), r.i32(), r.i32(), r.utf()] for _ in range(r.u16())]
        trig = [[r.i32(), r.i32(), r.i32(), r.i32()] +
                ([r.utf()] if r.u8() else [None]) for _ in range(r.u16())]
        layers.append({"name": name, "tiles": tiles, "objects": objs,
                       "regions": regs, "triggers": trig})
    assert r.p == len(d), "%s leftover %d" % (path, len(d) - r.p)
    return {"res": res, "tileW": tw, "tileH": th, "cols": cols, "rows": rows,
            "script": script, "layers": layers}

# ---------------------------------------------------------------- STR

def parse_str(path):
    d = load_raw(path)
    r = R(d)
    if bytes([r.u8(), r.u8(), r.u8(), r.u8()]) != b"\x88STR":
        raise ValueError("bad STR magic")
    r.u16()
    txt = d[r.p:].decode("utf-8", "replace")
    out = {}
    for part in re.split(r"[\x00-\x1f]", txt):
        part = part.strip()
        if "=" in part:
            k, v = part.split("=", 1)
            if k.strip() and not k.strip().startswith("#"):
                out[k.strip()] = v.strip()
    return out

# ---------------------------------------------------------------- 脚本解析

CMD_RE = re.compile(r"^([A-Za-z_]+)\.([A-Za-z_]+)\((.*)\)$", re.S)


def split_args(s):
    """按顶层逗号切分，忽略括号/方括号/引号内部。"""
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
        if ch == "," and depth == 0:
            out.append("".join(cur).strip()); cur = []
        else:
            cur.append(ch)
    if cur:
        out.append("".join(cur).strip())
    return out


def strip_cond(s):
    """去掉末尾的条件后缀 [...]; (已先剥掉行尾分号)。"""
    m = re.search(r"\[([^\[\]]*)\]\s*$", s, re.S)
    return (s[:m.start()].strip(), m.group(1)) if m else (s.strip(), None)


def parse_script(text):
    """把地图/对话脚本切成指令序列。"""
    cmds = []
    for raw in text.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        raw = raw.strip()
        while raw.endswith(";"):
            raw = raw[:-1].strip()
        if not raw:
            continue
        raw, cond = strip_cond(raw)
        if not raw:
            continue
        m = CMD_RE.match(raw)
        if m:
            cmds.append({"obj": m.group(1), "cmd": m.group(2),
                         "args": split_args(m.group(3)), "cond": cond})
        else:
            cmds.append({"obj": None, "cmd": None, "args": [raw], "cond": cond,
                         "raw": raw})
    return cmds

# ---------------------------------------------------------------- 主流程

def main():
    bins = {}
    for p in sorted(glob.glob(os.path.join(TREE, "bin", "*.bin"))):
        stem = os.path.basename(p)[:-4]
        bins[stem] = parse_bin(p)
        _BIN_COUNT[stem] = len(bins[stem])

    # ---- 导出精灵图: 每个 BIN 条目一张 PNG (#跨包引用已解析, .pix 已解码)
    spdir = os.path.join(WEB, "sprites")
    os.makedirs(spdir, exist_ok=True)

    def resolve(bin_name, idx, depth=0):
        if depth > 8:
            return None
        name, data = bins[bin_name][idx]
        if name.startswith("#"):
            tgt, ti = name[1:].split(":")
            return resolve(tgt[:-4] if tgt.endswith(".bin") else tgt,
                           int(ti), depth + 1)
        return name, data

    sheet_count = {}
    for stem, ents in bins.items():
        out = os.path.join(spdir, stem)
        os.makedirs(out, exist_ok=True)
        for i in range(len(ents)):
            got = resolve(stem, i)
            dst = os.path.join(out, "%03d.png" % i)
            if got is None:
                continue
            nm, data = got
            if nm.endswith(".pix"):
                w, h, argb = parse_pix(data)
                open(dst, "wb").write(pix_to_png(w, h, argb))
            else:
                open(dst, "wb").write(data)
        sheet_count[stem] = len(ents)
        print("  sprites/%-16s %d 张" % (stem, len(ents)))

    # ---- ANT
    ants = {}
    for p in sorted(glob.glob(os.path.join(TREE, "ant", "*.ant"))):
        name = os.path.basename(p)
        a = parse_ant(p)
        need = max(c[0] for c in a["clips"])
        b = resolve_ant_bin(name, need)
        assert b and _BIN_COUNT[b] > need, "%s 无法归属 BIN (sheet=%d)" % (name, need)
        a["bin"] = b
        ants[name] = a
    print("  ANT: %d 个文件, %d 个命名状态" % (
        len(ants), sum(len(a["states"]) for a in ants.values())))

    # ---- MAP + 地图→元素ANT 绑定 (来自 world.change)
    maps = {}
    for p in sorted(glob.glob(os.path.join(TREE, "map", "*.map"))):
        name = os.path.basename(p)
        m = parse_map(p)
        m["ant"] = None
        m["tileBin"] = None
        maps[name] = m

    # world.change(目标map, 地砖bin, 元素ant, 元素bin, x, y, dir)
    change_re = re.compile(
        r"world\.change\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*"
        r"([^,]+),\s*([^,]+),\s*([^)]+)\)")
    for name, m in maps.items():
        texts = [m["script"]]
        for l in m["layers"]:
            texts += [o[3] for o in l["objects"] if o[3]]
            texts += [r[4] for r in l["regions"] if r[4]]
            texts += [t[4] for t in l["triggers"] if t[4]]
        for t in texts:
            for g in change_re.finditer(t):
                tgt = g.group(1).strip()
                if tgt in maps:
                    maps[tgt]["ant"] = g.group(3).strip()
                    maps[tgt]["tileBin"] = g.group(2).strip()
    # 仍未绑定的用初始场景配置兜底
    gamecfg = parse_str(os.path.join(TREE, "str", "config_game.str"))
    fallback_ant = gamecfg.get("初始场景元素动画", "mishi.ant")
    for m in maps.values():
        if not m["ant"]:
            m["ant"] = fallback_ant
        if not m["tileBin"]:
            m["tileBin"] = gamecfg.get("初始场景地砖资源", "ms.bin")

    # ---- NPC: 来自所有地图脚本的 element.addToNpc
    npcs = {}
    for name, m in maps.items():
        # 地图主脚本 + 元素层每个对象/区域/触发器自带的脚本
        texts = [m["script"]]
        for l in m["layers"]:
            texts += [o[3] for o in l["objects"] if len(o) > 3 and o[3]]
            texts += [r[4] for r in l["regions"] if r[4]]
            texts += [t[4] for t in l["triggers"] if len(t) > 4 and t[4]]
        for t in texts:
            cur = None
            for c in parse_script(t):
                if c["obj"] == "element" and c["cmd"] == "addToNpc":
                    try:
                        nid = int(c["args"][0])
                    except (ValueError, IndexError):
                        continue
                    src = c["args"][1].strip()
                    cur = nid
                    e = npcs.setdefault(nid, {"id": nid, "src": src, "maps": [],
                                              "positions": []})
                    e["src"] = src
                    if name not in e["maps"]:
                        e["maps"].append(name)
                elif c["obj"] == "npc" and cur is not None:
                    e = npcs[cur]
                    if c["cmd"] == "setPosition" and len(c["args"]) >= 3:
                        e["positions"].append({
                            "map": name,
                            "x": int(c["args"][1]), "y": int(c["args"][2]),
                            "cond": c["cond"]})
                    elif c["cmd"] in ("setState", "setDirection", "setVelocity",
                                      "addActivityRegion", "addNode"):
                        e.setdefault("opts", []).append(
                            {"map": name, "cmd": c["cmd"], "args": c["args"],
                             "cond": c["cond"]})

    # 合并进 .str 配置
    for nid, e in npcs.items():
        e["name"] = None; e["ant"] = None; e["talk"] = None
        e["nameH"] = 0; e["moveLR"] = False; e["moveUD"] = False
        e["dialog"] = None
        src = e["src"]
        if src.endswith(".str"):
            sp = os.path.join(TREE, "str", src)
            if os.path.exists(sp):
                cfg = parse_str(sp)
                e["name"] = cfg.get("名字")
                e["nameH"] = int(cfg.get("名字高度", 0) or 0)
                e["ant"] = cfg.get("动画文件")
                e["talk"] = cfg.get("对话文件")
                e["moveLR"] = cfg.get("左右移动") == "是"
                e["moveUD"] = cfg.get("上下移动") == "是"
                for k, v in cfg.items():
                    if k.endswith("对话区域"):
                        e["dialog"] = v
        else:
            e["ant"] = src

    # ---- 校验: 每个 NPC 的 ant 都要能归属
    missing = []
    for nid, e in sorted(npcs.items()):
        if e["ant"] and e["ant"] in ants:
            pass
        elif e["ant"]:
            missing.append((nid, e["ant"]))
    print("  NPC: %d 个定义, %d 个引用了缺失的 ant %s" % (
        len(npcs), len(missing), missing[:5]))

    # ---- 输出 JS
    def dump(path, varname, obj, banner):
        with open(path, "w", encoding="utf-8") as f:
            f.write("// %s\n// 由 2-工具/03-全量资源解析.py 自动生成, 请勿手改\n" % banner)
            f.write("window.%s = " % varname)
            json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))
            f.write(";\n")
        print("  %-18s %8.1f KB" % (os.path.basename(path),
                                    os.path.getsize(path) / 1024))

    # ants.js: 压成数组以减小体积
    dump(os.path.join(WEB, "ants.js"), "XJ_ANT", {
        k: {"bin": v["bin"],
            "c": v["clips"],
            "l": v["layers"],
            "s": [[st["name"],
                   [[c["layer"], c["ox"], c["oy"], c["dur"]] for c in st["seq"]]]
                  for st in v["states"]]}
        for k, v in ants.items()},
        "ANT 动画: c=裁剪表[sheet,x,y,w,h] l=图层组[[clip,x,y,flags]] "
        "s=命名状态[name,[[layer,ox,oy,durMs]]]")

    dump(os.path.join(WEB, "maps.js"), "XJ_MAP", maps,
        "MAP 场景: layers[0]=地砖(瓦片) [1]=元素 [2]=遮挡; "
        "objects=[animStateIndex,x,y,script]; regions=[x,y,w,h,script]; "
        "triggers=[x,y,w,h,script]; world.change() 绑定 ant/tileBin")

    dump(os.path.join(WEB, "npc_config.js"), "XJ_NPC", {
        str(k): v for k, v in sorted(npcs.items())},
        "NPC 定义: 来自全部 69 张地图脚本的 element.addToNpc()")

    # sheet 索引表 (给渲染器用)
    dump(os.path.join(WEB, "bin_index.js"), "XJ_BIN", sheet_count,
        "每个 BIN 的条目数 = 其 ANT 裁剪表 sheet 下标的上界")

    print("\n完成。")


if __name__ == "__main__":
    main()