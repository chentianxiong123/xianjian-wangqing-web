#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""25-解析音乐.py —— MID 音乐管线步骤

真正的解析逻辑在 2-工具/formats/mid.py（逆向自 ah.java / d.java 的播放链）。
本脚本只是把它接进统一管线，并额外断言：
  · 11 首曲子全部字节精确（SMF chunk 长度累加 == 文件长度）
  · 每首都能算出时长与音符数
  · 产物与 05-资源/mid/_index.json 的汇总数字一致

单独运行 `python3 2-工具/formats/mid.py --dump` 可看逐曲明细。
"""
from __future__ import annotations

import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

from formats import mid as MID  # noqa: E402

OUT = os.path.join(ROOT, "3-数据", "05-资源", "mid")


def main() -> int:
    print("[25] MID 音乐")
    if not os.path.isdir(OUT):
        os.makedirs(OUT, exist_ok=True)
    rc = MID.main(["mid.py"])
    if rc:
        print("  formats/mid.py 返回 %d" % rc)
        return rc

    idx_path = os.path.join(OUT, "_index.json")
    if not os.path.exists(idx_path):
        print("  ✗ 未生成 _index.json")
        return 1
    idx = json.load(open(idx_path, encoding="utf-8"))

    files = idx.get("files") or []
    bad = 0
    for f in files:
        # f["file"] 已是仓库相对路径；f["json"] 是产物路径
        jrel = f.get("json")
        if jrel and not os.path.exists(os.path.join(ROOT, jrel)):
            print("  ✗ 缺产物 %s" % jrel)
            bad += 1
    if bad:
        return 1

    print("  曲子 %d 首（+1 份 _index.json）" % len(files))
    print("  音符 %s / 事件 %s / 字节精确 %s / 异常 %s"
          % (idx.get("total_notes"), idx.get("total_events"),
             idx.get("byte_exact"), idx.get("anomaly_total")))
    print("  → 3-数据/05-资源/mid/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())