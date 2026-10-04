#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""01-全量解包:把 jar 内所有资源提取为可用产物。
产物:
  1-解包产物/剧本-解码/<名>.txt    STR 条目流(utf-8)
  1-解包产物/剧本-条目/<名>.json   STR 条目数组
  1-解包产物/图片/<bin名>/<标签>.png
  1-解包产物/原始格式/ant/*.bin  map/*.bin  (gzip 解压后的原始二进制)
  1-解包产物/音乐/*.mid
  1-解包产物/类文件/*.class
  3-数据/清单.json 3-数据/配置-*.json 3-数据/配置-*.txt
运行: python3 01-全量解包.py [jar路径]
"""
import zipfile, gzip, json, os, re, zlib, struct, sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JAR = sys.argv[1] if len(sys.argv) > 1 else os.path.join(BASE, "0-原始素材", "仙剑奇侠传-忘情篇.jar")
OUT = os.path.join(BASE, "1-解包产物")
DAT = os.path.join(BASE, "3-数据")
os.makedirs(OUT, exist_ok=True)
os.makedirs(DAT, exist_ok=True)

def m(*p):
    d = os.path.join(OUT, *p)
    os.makedirs(d, exist_ok=True)
    return d

def parse_str_payload(dec):
    if dec[:4] != b"\x88STR":
        return None, None
    version = struct.unpack_from("<H", dec, 4)[0]
    count = struct.unpack_from("<H", dec, 6)[0] if len(dec) >= 8 else 0
    pos = 8
    entries = []
    ok = True
    for _ in range(count):
        if pos >= len(dec):
            ok = False
            break
        ln = dec[pos]; pos += 1
        if pos + ln > len(dec):
            ok = False
            break
        t = dec[pos:pos + ln].decode("utf-8", "replace")
        pos += ln
        if pos < len(dec) and dec[pos] == 0:
            pos += 1
        entries.append(t)
    return {"版本": version, "声名条目数": count, "实际条目数": len(entries), "解析完整": ok,
            "文本": "\n".join(entries), "条目": entries}, dict(版本=version, 计数=count, 完整=ok)

def png_boundaries(raw):
    res = []
    pos = 0
    while True:
        s = raw.find(b"\x89PNG\r\n\x1a\n", pos)
        if s < 0:
            break
        p = s + 8
        end = s + 8
        crc_ok = True
        while p + 8 <= len(raw):
            ln = struct.unpack(">I", raw[p:p + 4])[0]
            typ = raw[p + 4:p + 8]
            if typ == b"IEND":
                if p + 8 + ln > len(raw) or struct.unpack(">I", raw[p + 8 + ln:p + 12 + ln])[0] != zlib.crc32(typ) & 0xFFFFFFFF:
                    crc_ok = False
                end = p + 12 + ln
                break
            p += 12 + ln
        res.append((s, end, crc_ok))
        pos = end
    return res

def label_before(raw, png_start):
    head = raw[:png_start]
    m0 = re.findall(rb"([\x20-\x7e\x80-\xff]+\.png)", head)
    if m0:
        try:
            lab = m0[-1].decode("utf-8")
            lab = re.sub(r"[\r\n\t ]+", "", lab)
            if lab.count(".") > 3:
                lab = "img"
            return lab
        except Exception:
            return "img"
    return "img"

def safe(name):
    name = re.sub(r"[^\w\u4e00-\u9fff.-]", "_", name)
    return name or "_"

def extract_strs(z):
    d = m("剧本-解码")
    dj = m("剧本-条目")
    files = sorted(n for n in z.namelist() if n.startswith("str/"))
    stats = []
    for n in files:
        raw = z.read(n)
        dec = gzip.decompress(raw) if raw[:2] == b"\x1f\x8b" else raw
        info, _ = parse_str_payload(dec)
        base = os.path.basename(n)[:-4]
        if info:
            with open(os.path.join(d, base + ".txt"), "wb") as f:
                f.write(info["文本"].encode("utf-8"))
            with open(os.path.join(dj, base + ".json"), "w", encoding="utf-8") as f:
                json.dump(info["条目"], f, ensure_ascii=False, indent=1)
            stats.append({"文件": n, "条目": info["实际条目数"], "字符": len(info["文本"]), "完整": info["解析完整"]})
        else:
            stats.append({"文件": n, "条目": 0, "字符": len(dec), "完整": False})
    return stats

def extract_images(z):
    d = m("图片")
    files = sorted(n for n in z.namelist() if n.startswith("bin/"))
    total = 0
    per = {}
    bad = 0
    for n in files:
        raw = z.read(n)
        pngs = png_boundaries(raw)
        if not pngs:
            continue
        sub = m("图片", os.path.basename(n))
        ids = {}
        for idx, (s, e, crc_ok) in enumerate(pngs):
            data = raw[s:e]
            lab = label_before(raw, s) if s > 0 else "img"
            cnt = ids.get(lab, 0) + 1
            ids[lab] = cnt
            fn = os.path.join(sub, safe(lab) + (".png" if cnt == 1 else "_%d.png" % cnt))
            with open(fn, "wb") as f:
                f.write(data)
            if not crc_ok:
                bad += 1
        total += len(pngs)
        per[os.path.basename(n)] = len(pngs)
    return total, per, bad

def extract_raw_bin(z):
    for group in ("ant", "map"):
        d = m("原始格式", group)
        files = sorted(n for n in z.namelist() if n.startswith(group + "/"))
        for n in files:
            raw = z.read(n)
            dec = gzip.decompress(raw) if raw[:2] == b"\x1f\x8b" else raw
            with open(os.path.join(d, os.path.basename(n) + ".bin"), "wb") as f:
                f.write(dec)

def extract_misc(z):
    d = m("音乐")
    for n in sorted(n for n in z.namelist() if n.startswith("mid/")):
        with open(os.path.join(d, os.path.basename(n)), "wb") as f:
            f.write(z.read(n))
    dc = m("类文件")
    for n in sorted(n for n in z.namelist() if n.endswith(".class")):
        with open(os.path.join(dc, os.path.basename(n)), "wb") as f:
            f.write(z.read(n))
    for n in ("icon.png", "logo/sp.png", "corp/logo.png"):
        if n in z.namelist():
            with open(os.path.join(d, os.path.basename(n)), "wb") as f:
                f.write(z.read(n))

def extract_configs(z):
    want = {"config_skill": "技能", "config_item": "物品", "enemy": "敌人", "task": "任务",
            "config_game": "游戏配置", "config_chonglou": "主角配置", "config_liyiru": "配角1配置",
            "config_zixuan": "配角2配置", "config_fight": "战斗配置", "config_instruction": "操作说明",
            "config_make": "合成配置"}
    names = [n for n in z.namelist() if n.startswith("str/")]
    by_reduce = {}
    for n in names:
        b = os.path.basename(n)[:-4]
        if b in want.keys():
            raw = z.read(n)
            dec = gzip.decompress(raw) if raw[:2] == b"\x1f\x8b" else raw
            info, _ = parse_str_payload(dec)
            if info:
                by_reduce[b] = info["条目"]
    for key, cn in want.items():
        if key in by_reduce:
            with open(os.path.join(DAT, "配置-%s.json" % cn), "w", encoding="utf-8") as f:
                json.dump(by_reduce[key], f, ensure_ascii=False, indent=1)
            with open(os.path.join(DAT, "配置-%s.txt" % cn), "w", encoding="utf-8") as f:
                f.write("\n".join(by_reduce[key]))
    return [c for c in want if c in by_reduce]

def main():
    z = zipfile.ZipFile(JAR)
    manifest = z.read("META-INF/MANIFEST.MF").decode("utf-8", "replace")
    str_stats = extract_strs(z)
    total_png, per, bad = extract_images(z)
    extract_raw_bin(z)
    extract_misc(z)
    cfgs = extract_configs(z)
    summary = {
        "jar": os.path.basename(JAR),
        "条目总数": len(z.namelist()),
        "str文件": len([s for s in str_stats if s["完整"]]),
        "str总条目": sum(s["条目"] for s in str_stats),
        "str总字符": sum(s["字符"] for s in str_stats),
        "图片总数": total_png,
        "图片损坏": bad,
        "每bin图片数": per,
        "配置表": [c for c in want if c in cfgs],
        "MANIFEST": manifest.strip(),
    }
    with open(os.path.join(DAT, "清单.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=1)
    with open(os.path.join(BASE, "1-解包产物", "解包统计.txt"), "w", encoding="utf-8") as f:
        for k, v in summary.items():
            f.write("%s: %s\n" % (k, v))
    print(json.dumps({k: v for k, v in summary.items() if k != "每bin图片数"}, ensure_ascii=False, indent=1))
    print("每bin图片数:", per)

want = {"config_skill", "config_item", "enemy", "task", "config_game", "config_chonglou",
        "config_liyiru", "config_zixuan", "config_fight", "config_instruction", "config_make"}
if __name__ == "__main__":
    main()