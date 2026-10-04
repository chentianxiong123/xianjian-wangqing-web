# -*- coding: utf-8 -*-
"""MAP 场景格式 `88MAP`

权威来源: 4-文档/反编译源码/w.java → private static w a(InputStream, d, bi, as)
已验证: 69/69 文件字节精确耗尽。

★ 整段地图脚本就是 header 之后的一个 readUTF。
  图层顺序固定: [0]=地砖 [1]=元素 [2]=遮挡
  对象的 animIndex 是**本地图元素 ANT**命名状态数组的下标
  (地图用哪个 ANT 由 world.change 指令携带，见备忘 3.1)
"""
from .binary import Reader, load_raw
from . import FormatError

MAGIC = b"\x88MAP"
VERSION = 5
LAYER_NAMES = ("地砖", "元素", "遮挡")


def parse(data, where="<map>"):
    r = Reader(data)
    r.magic(MAGIC, VERSION, "MAP 版本")

    r.u8()                       # 保留位
    res = r.i32()                # 资源标记，实测 -1 / -16777236，含义未知
    tileW, tileH = r.u16(), r.u16()
    script = r.utf()             # ★ 整段地图脚本
    nl = r.u8()
    cols, rows = r.u16(), r.u16()

    layers = []
    for li in range(nl):
        name = r.utf()
        tiles = None
        if r.u8():
            tiles = [[r.u16() for _ in range(cols)] for _ in range(rows)]
        objects = [{"anim": r.u16(), "x": r.i32(), "y": r.i32(),
                    "script": (r.utf() if r.u8() else None)}
                   for _ in range(r.u16())]
        regions = [{"x": r.i32(), "y": r.i32(), "w": r.i32(), "h": r.i32(),
                    "script": r.utf()} for _ in range(r.u16())]
        triggers = [{"x": r.i32(), "y": r.i32(), "w": r.i32(), "h": r.i32(),
                     "script": (r.utf() if r.u8() else None)}
                    for _ in range(r.u16())]
        layers.append({"index": li, "name": name, "tiles": tiles,
                       "objects": objects, "regions": regions,
                       "triggers": triggers})

    r.done(where)
    return {"res": res, "tileW": tileW, "tileH": tileH,
            "cols": cols, "rows": rows, "script": script, "layers": layers}


def load(path):
    return parse(load_raw(path), where=path)


def world_size(m):
    return m["cols"] * m["tileW"], m["rows"] * m["tileH"]


def layer_of(m, name):
    for l in m["layers"]:
        if l["name"] == name:
            return l
    return None


def ground(m):
    return layer_of(m, LAYER_NAMES[0])


def elements(m):
    return layer_of(m, LAYER_NAMES[1])


def occluders(m):
    return layer_of(m, LAYER_NAMES[2])


def exit_regions(m):
    """带 world.change 的区域 = 地图出口。"""
    out = []
    for l in m["layers"]:
        for rg in l["regions"]:
            if rg["script"] and "world.change" in rg["script"]:
                out.append(rg)
    return out