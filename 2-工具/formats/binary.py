# -*- coding: utf-8 -*-
"""二进制读取基元。

出处: 4-文档/反编译源码/d.java, w.java, x.java, ba.java
      —— 原实现全部用 java.io.DataInputStream，因此一律大端。
"""
import gzip
import struct

from . import FormatError

GZIP_MAGIC = b"\x1f\x8b"


def load_raw(path):
    """读取文件并脱去 gzip 外壳。

    备忘第 1 节: .ant/.map/.str 是 gzip 包裹的 raw DEFLATE;
    .bin 有的压有的不压; .pix 条目负载还多压一层。
    这里统一处理最外层。
    """
    with open(path, "rb") as f:
        d = f.read()
    if d[:2] == GZIP_MAGIC:
        d = gzip.decompress(d)
    return d


def maybe_gunzip(d):
    return gzip.decompress(d) if d[:2] == GZIP_MAGIC else d


class Reader:
    """大端游标读取器。offset 保留供溯源使用。"""

    __slots__ = ("b", "p", "n")

    def __init__(self, b, offset=0):
        self.b = b
        self.p = offset
        self.n = len(b)

    # ---- 原始 ----
    def raw(self, n):
        v = self.b[self.p:self.p + n]
        if len(v) != n:
            raise FormatError("越界读取 %d 字节 (offset=%d, 剩 %d)"
                              % (n, self.p, self.n - self.p))
        self.p += n
        return v

    def magic(self, expect, ver=None, vername="版本"):
        got = self.raw(4)
        if got != expect:
            raise FormatError("magic 不符: 期望 %r 实得 %r @%d"
                              % (expect, got, self.p - 4))
        if ver is not None:
            v = self.u8()
            if v != ver:
                raise FormatError("%s不符: 期望 %d 实得 %d" % (vername, ver, v))

    # ---- 整型 ----
    def u8(self):
        v = self.b[self.p]
        self.p += 1
        return v

    def i8(self):
        v = struct.unpack_from(">b", self.b, self.p)[0]
        self.p += 1
        return v

    def i16(self):
        v = struct.unpack_from(">h", self.b, self.p)[0]
        self.p += 2
        return v

    def u16(self):
        v = struct.unpack_from(">H", self.b, self.p)[0]
        self.p += 2
        return v

    def i32(self):
        v = struct.unpack_from(">i", self.b, self.p)[0]
        self.p += 4
        return v

    def u32(self):
        v = struct.unpack_from(">I", self.b, self.p)[0]
        self.p += 4
        return v

    def i64(self):
        v = struct.unpack_from(">q", self.b, self.p)[0]
        self.p += 8
        return v

    def utf(self):
        """DataInputStream.readUTF: 2 字节长度 + 改良 UTF-8。"""
        n = self.u16()
        return self.raw(n).decode("utf-8", "replace")

    # ---- 校验 ----
    @property
    def left(self):
        return self.n - self.p

    def done(self, where):
        if self.left:
            raise FormatError("%s: 残留 %d 字节未消费 (offset=%d/%d)"
                              % (where, self.left, self.p, self.n))
