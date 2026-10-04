# -*- coding: utf-8 -*-
"""BIN 资源包 `88BIN` 与 PIX 像素矩阵 `88PIX`

权威来源: 4-文档/反编译源码/x.java (BIN) / ba.java (PIX)
已验证: 18/18 BIN 字节精确耗尽。

★ 条目名决定内容:
    *.png          直接就是 PNG 字节
    *.pix          PIX 格式，且**负载本身还是 gzip 的** (需再解一层)
    #其他.bin:下标  跨包引用，本条目无数据(len=0)，要去另一个 BIN 取

⚠️ 前人的 bin_index.js 只数了 .png 个数，漏掉 .pix 与 #引用，
   导致所有 ANT 裁剪表的 sheet 下标错位。
"""
import hashlib
import struct

from .binary import Reader, load_raw, maybe_gunzip
from . import FormatError

BIN_MAGIC = b"\x88BIN"
BIN_VERSION = 9
PIX_MAGIC = b"\x88PIX"
PIX_VERSION = 1


def parse_bin(data, where="<bin>"):
    r = Reader(data)
    r.magic(BIN_MAGIC, BIN_VERSION, "BIN 版本")
    n = r.u16()
    entries = []
    for i in range(n):
        name = r.utf()
        ln = r.i32()
        entries.append({"index": i, "name": name, "data": r.raw(ln),
                        "offset": r.p - ln})
    r.done(where)
    return entries


def load_bin(path):
    return parse_bin(load_raw(path), where=path)


def entry_kind(name):
    if name.startswith("#"):
        return "ref"
    if name.endswith(".pix"):
        return "pix"
    if name.endswith(".png"):
        return "png"
    return "raw"


def parse_pix(data, where="<pix>"):
    """88PIX: magic + w + h + w*h 个 int32 ARGB。负载可能还压了一层 gzip。"""
    data = maybe_gunzip(data)
    r = Reader(data)
    r.magic(PIX_MAGIC, PIX_VERSION, "PIX 版本")
    w, h = r.i32(), r.i32()
    argb = list(struct.unpack_from(">%di" % (w * h), data, r.p))
    r.p += w * h * 4
    r.done(where)
    return w, h, argb


def pix_to_png_bytes(w, h, argb):
    from PIL import Image
    im = Image.new("RGBA", (w, h))
    im.putdata([((v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF, (v >> 24) & 0xFF)
                for v in argb])
    import io
    buf = io.BytesIO()
    im.save(buf, "PNG")
    return buf.getvalue()


class BinResolver:
    """解析 #跨包引用，把每个条目都变成可直接用的图片字节。"""

    def __init__(self, bins):
        self.bins = bins                    # {stem: entries}
        self._cache = {}

    def count(self, stem):
        return len(self.bins.get(stem, ()))

    def resolve(self, stem, idx, depth=0):
        if depth > 8:
            raise FormatError("跨包引用嵌套过深: %s[%d]" % (stem, idx))
        key = (stem, idx)
        if key in self._cache:
            return self._cache[key]
        ents = self.bins.get(stem)
        if not ents or idx >= len(ents):
            raise FormatError("条目不存在: %s[%d]" % (stem, idx))
        e = ents[idx]
        kind = entry_kind(e["name"])
        if kind == "ref":
            tgt, ti = e["name"][1:].split(":")
            tgt = tgt[:-4] if tgt.endswith(".bin") else tgt
            out = self.resolve(tgt, int(ti), depth + 1)
        elif kind == "pix":
            w, h, argb = parse_pix(e["data"])
            out = (e["name"], pix_to_png_bytes(w, h, argb), w, h)
        else:
            out = (e["name"], e["data"], None, None)
        self._cache[key] = out
        return out


def sha256(data):
    return hashlib.sha256(data).hexdigest()