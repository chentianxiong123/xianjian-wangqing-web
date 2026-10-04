# -*- coding: utf-8 -*-
"""ANT 动画格式 `88ANT`

权威来源: 4-文档/反编译源码/d.java → private static d a(InputStream, as)
已验证: 75/75 文件字节精确耗尽。

三层结构:
    clips   裁剪表   —— 每条 = {sheet, srcX, srcY, w, h}，18 字节
    layers  图层组   —— 每组 = [{clipIndex, x, y, flags}]，绘制时从后往前叠
    states  命名状态 —— 每个 = 帧序列 [{layer, offX, offY, duration}]

★ 关键: 裁剪表条目是 18 字节(short + 4×int32)，不是 10 字节 5×uint16。
  前人按 10 字节解析导致整体错位，这是"角色渲染成碎纹理"的根因。
  详见 4-文档/格式规范/00-逆向备忘.md 第 2 节。
"""
from .binary import Reader, load_raw
from . import FormatError

MAGIC = b"\x88ANT"
VERSION = 2


def parse(data, where="<ant>"):
    r = Reader(data)
    r.magic(MAGIC, VERSION, "ANT 版本")

    # 扩展头: 本作 75 个文件全为 0
    ext = None
    if r.u8():
        ext = [r.u16(), r.u16()]

    # ---- 裁剪表 ----
    n = r.u16()
    clips = []
    for i in range(n):
        clips.append({
            "sheet": r.u16(), "srcX": r.i32(), "srcY": r.i32(),
            "w": r.i32(), "h": r.i32(), "src": {"offset": r.p - 18},
        })

    # ---- 图层组 ----
    m = r.u16()
    layers = []
    for _ in range(m):
        cnt = r.u16()
        parts = []
        for _ in range(cnt):
            parts.append({"clip": r.u16(), "x": r.i32(), "y": r.i32(),
                          "flags": r.i8(), "src": {"offset": r.p - 11}})
        layers.append(parts)

    # ---- 命名状态 ----
    s = r.u16()
    states = []
    for _ in range(s):
        name = r.utf()
        tag = r.utf() if r.u8() else None
        nb = r.u16()
        seq = []
        for _ in range(nb):
            layer = r.i16()
            offX, offY, dur = r.i32(), r.i32(), r.i64()
            stag = r.utf() if r.u8() else None
            fwd = [{"x": r.i32(), "y": r.i32(), "w": r.i32(), "h": r.i32(),
                    "tag": (r.utf() if r.u8() else None)} for _ in range(r.u16())]
            bwd = [{"x": r.i32(), "y": r.i32(), "w": r.i32(), "h": r.i32(),
                    "tag": r.utf()} for _ in range(r.u16())]
            seq.append({"layer": layer, "offX": offX, "offY": offY,
                        "duration": dur, "tag": stag, "fwd": fwd, "bwd": bwd})
        states.append({"name": name, "tag": tag, "seq": seq})

    r.done(where)
    return {"version": VERSION, "ext": ext, "clips": clips,
            "layers": layers, "states": states}


def load(path):
    return parse(load_raw(path), where=path)


# ---------------------------------------------------------------- 归属

#: 显式归属表 (备忘 2.3)。其余按"条目数 > 最大 sheet 下标"自动筛。
EXPLICIT_BIN = {
    "guaiwu": "renwu", "jiujianxian": "renwu", "damen": "yewai",
    "fight_cl": "fight", "fight_lyr": "fight", "fight_mishi": "fight",
    "fight_ssm": "fight", "fight_zx": "fight",
    "fight_ui": "fight_ui", "fight_skill": "fight_skill",
}


def resolve_bin(ant_name, need, bin_counts):
    """ANT 的裁剪表 sheet 下标是所属 BIN 的条目下标。"""
    stem = ant_name[:-4] if ant_name.endswith(".ant") else ant_name
    if stem.startswith("npc_"):
        return "renwu"
    if stem in EXPLICIT_BIN:
        return EXPLICIT_BIN[stem]
    if stem in bin_counts and bin_counts[stem] > need:
        return stem
    cand = [b for b, c in bin_counts.items() if c > need]
    return sorted(cand)[0] if cand else None


# ---------------------------------------------------------------- 渲染

#: flags 位含义。从 y.java 的 switch 与 (flags & 4)|(flags & 0x10) 反编译得出。
#: 备忘 2.1: flags&4 或 flags&0x10 时绘制尺寸要交换 w/h。
FLAG_TRANSFORM = {
    0: "none", 1: "flipV", 2: "flipH", 3: "rot180", 4: "swapWH",
    5: "rot90cw", 6: "rot90ccw", 8: "rot180", 9: "flipH", 10: "flipV",
    16: "transpose", 17: "rot90ccw", 18: "rot90cw",
}


def swapped(flags):
    return bool((flags & 4) or (flags & 0x10))


def layer_bbox(ant, layer_idx):
    """复现 y.java 构造函数的包围盒计算，用于摆放 NPC / 玩家。"""
    parts = ant["layers"][layer_idx]
    if not parts:
        return 0, 0, 0, 0
    minx = miny = 1 << 30
    maxx = maxy = -(1 << 30)
    for p in parts:
        c = ant["clips"][p["clip"]]
        x, y = p["x"], p["y"]
        if swapped(p["flags"]):
            right, bottom = x + c["h"], y + c["w"]
        else:
            right, bottom = x + c["w"], y + c["h"]
        if x < minx:
            minx = x
        if y < miny:
            miny = y
        if right > maxx:
            maxx = right
        if bottom > maxy:
            maxy = bottom
    return minx, miny, maxx - minx, maxy - miny


def find_state(ant, name):
    for st in ant["states"]:
        if st["name"] == name:
            return st
    return None


def state_names(ant):
    return [s["name"] for s in ant["states"]]