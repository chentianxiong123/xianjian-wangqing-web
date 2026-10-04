#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""mid.py — 自包含 SMF (Standard MIDI File) 解析器。

用法:
    python3 2-工具/formats/mid.py                      # 解析全部 mid/ + corp/logo.mid 并导出 JSON
    python3 2-工具/formats/mid.py path/to/x.mid        # 只解析一个文件并打印摘要
    python3 2-工具/formats/mid.py --dump x.mid         # 打印全部事件（调试用）

为什么需要它
------------
J2ME 的 `javax.microedition.media.Manager.createPlayer(InputStream, "audio/midi")`
(`4-文档/反编译源码/ah.java:184`) 直接吃 jar 里的裸 SMF 字节流 —— 游戏不解析 MIDI,
所以 jar 里的 `/mid/*.mid` 与 `/corp/logo.mid` 必须本身就是**合法未压缩的 SMF**。
本解析器就是用来把这些字节还原成可读结构, 供复刻引擎重放。

格式权威来源: 《Standard MIDI Files 1.0》MMA 规范 + SMF 1.1 勘误。
本项目内交叉验证:
  ah.java:184   createPlayer(..., "audio/midi")  → 必须是真 SMF
  ah.java:185   setLoopCount(d)                   → 循环语义
  cn/com/etgame/cls/system/d.java:127
                B = stringArray.a("MID资源目录")    → config_game.str 里 = "/mid/"

质量标准（见 4-文档/格式规范/00-逆向备忘.md §8）
------------------------------------------------
每个文件解析后 `assert` 字节**正好耗尽**; 有残留立即进 `anomalies` 并在 strict 下报错。
"""

import hashlib
import json
import os
import struct
import sys
from collections import deque

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TREE = os.path.join(ROOT, "1-解包产物", "解包树")
OUT = os.path.join(ROOT, "3-数据", "05-资源", "mid")

# ---------------------------------------------------------------------------
# 常量表
# ---------------------------------------------------------------------------

META = {
    0x00: "sequence_number",
    0x01: "text",
    0x02: "copyright",
    0x03: "track_name",
    0x04: "instrument_name",
    0x05: "lyric",
    0x06: "marker",
    0x07: "cue_point",
    0x08: "program_name",
    0x09: "port",
    0x0A: "channel_prefix",
    0x0B: "midi_port",
    0x20: "midi_channel_prefix",
    0x21: "midi_port2",
    0x2F: "end_of_track",
    0x51: "set_tempo",
    0x54: "smpte_offset",
    0x58: "time_signature",
    0x59: "key_signature",
    0x7F: "sequencer_specific",
}

CHAN_EV = {
    0x8: "note_off",
    0x9: "note_on",
    0xA: "poly_aftertouch",
    0xB: "control_change",
    0xC: "program_change",
    0xD: "channel_aftertouch",
    0xE: "pitch_bend",
}

# 值得单独命名的高频 controller
CC_NAME = {
    0: "bank_select_msb", 1: "modulation", 2: "breath", 4: "foot",
    5: "portamento_time", 6: "data_entry_msb", 7: "channel_volume",
    8: "balance", 10: "pan", 11: "expression", 12: "effect_1",
    13: "effect_2", 16: "general_purpose_1", 17: "general_purpose_2",
    18: "general_purpose_3", 19: "general_purpose_4", 32: "bank_select_lsb",
    64: "sustain", 65: "portamento", 66: "sostenuto", 67: "soft_pedal",
    98: "nrpn_lsb", 99: "nrpn_msb", 100: "nprn_lsb_rpn", 101: "rpn_lsb",
    120: "all_sound_off", 121: "reset_all_controllers", 122: "local_control",
    123: "all_notes_off", 124: "omni_off", 125: "omni_on",
    126: "mono", 127: "poly",
}

# GM 音色名（仅用于人读，缺失就是 GM 标准表之外）
GM_PROGRAM = [
    "Acoustic Grand Piano", "Bright Acoustic Piano", "Electric Grand Piano",
    "Honky-tonk Piano", "Electric Piano 1", "Electric Piano 2", "Harpsichord",
    "Clavinet", "Celesta", "Glockenspiel", "Music Box", "Vibraphone",
    "Marimba", "Xylophone", "Tubular Bells", "Dulcimer", "Drawbar Organ",
    "Percussive Organ", "Rock Organ", "Church Organ", "Reed Organ",
    "Accordion", "Harmonica", "Tango Accordion", "Nylon String Guitar",
    "Steel String Guitar", "Jazz Electric Guitar", "Clean Guitar", "Muted Guitar",
    "Overdrive Guitar", "Distortion Guitar", "Guitar Harmonics", "Acoustic Bass",
    "Electric Bass (finger)", "Electric Bass (pick)", "Fretless Bass",
    "Slap Bass 1", "Slap Bass 2", "Synth Bass 1", "Synth Bass 2", "Violin",
    "Viola", "Cello", "Contrabass", "Tremolo Strings", "Pizzicato Strings",
    "Orchestral Harp", "Timpani", "String Ensemble 1", "String Ensemble 2",
    "Synth Strings 1", "Synth Strings 2", "Choir Aahs", "Voice Oohs",
    "Synth Voice", "Orchestra Hit", "Trumpet", "Trombone", "Tuba", "Muted Trumpet",
    "French Horn", "Brass Section", "Synth Brass 1", "Synth Brass 2", "Soprano Sax",
    "Alto Sax", "Tenor Sax", "Baritone Sax", "Oboe", "English Horn", "Bassoon",
    "Clarinet", "Piccolo", "Flute", "Recorder", "Pan Flute", "Bottle Blow",
    "Shakuhachi", "Whistle", "Tinkle Bell", "Steel Drums", "Woodblock",
    "Taiko Drum", "Melodic Tom", "Synth Drum", "Reverse Cymbal", "Guitar Fret Noise",
    "Breath Noise", "Sea Shore", "Bird Tweet", "Telephone Ring", "Helicopter",
    "Applause", "Gunshot",
]

PERCUSSION = {
    35: "Acoustic Bass Drum", 36: "Bass Drum 1", 37: "Side Stick",
    38: "Acoustic Snare", 39: "Hand Clap", 40: "Electric Snare",
    41: "Low Floor Tom", 42: "Closed Hi-Hat", 43: "High Floor Tom",
    44: "Pedal Hi-Hat", 45: "Low Tom", 46: "Open Hi-Hat", 47: "Low-Mid Tom",
    48: "Hi-Mid Tom", 49: "Crash Cymbal 1", 50: "High Tom", 51: "Ride Cymbal 1",
    52: "Chinese Cymbal", 53: "Ride Bell", 54: "Tambourine", 55: "Splash Cymbal",
    56: "Cowbell", 57: "Crash Cymbal 2", 58: "Vibraslap", 59: "Ride Cymbal 2",
    60: "Hi Bongo", 61: "Low Bongo", 62: "Mute Hi Conga", 63: "Open Hi Conga",
    64: "Low Conga", 65: "High Timbale", 66: "Low Timbale", 67: "High Agogo",
    68: "Low Agogo", 69: "Cabasa", 70: "Maracas", 71: "Short Whistle",
    72: "Long Whistle", 73: "Short Guiro", 74: "Long Guiro", 75: "Claves",
    76: "Hi Wood Block", 77: "Low Wood Block", 78: "Mute Cuica", 79: "Open Cuica",
    80: "Mute Triangle", 81: "Open Triangle", 82: "Shaker", 83: "Jingle Bell",
    84: "Bell Tree", 85: "Tambourine", 86: "Low Wood Block",
}


class SmfError(Exception):
    """SMF 结构错误。strict 模式下任何残留/越界都走这里。"""


class R:
    """大端字节游标。所有读操作都做边界检查。"""
    __slots__ = ("b", "p", "n")

    def __init__(self, b, p=0):
        self.b, self.p, self.n = b, p, len(b)

    def _need(self, k):
        if self.p + k > self.n:
            raise SmfError("越界读取: 偏移 %d 需要 %d 字节, 只剩 %d"
                           % (self.p, k, self.n - self.p))

    def u8(self):
        self._need(1)
        v = self.b[self.p]
        self.p += 1
        return v

    def u16(self):
        self._need(2)
        v = struct.unpack_from(">H", self.b, self.p)[0]
        self.p += 2
        return v

    def u24(self):
        self._need(3)
        v = (self.b[self.p] << 16) | (self.b[self.p + 1] << 8) | self.b[self.p + 2]
        self.p += 3
        return v

    def u32(self):
        self._need(4)
        v = struct.unpack_from(">I", self.b, self.p)[0]
        self.p += 4
        return v

    def raw(self, k):
        self._need(k)
        v = self.b[self.p:self.p + k]
        self.p += k
        return v

    def vlq(self):
        """变长量: 7 bit/字节, 高位为续位。最多 4 字节 (规范上限)。"""
        v = 0
        for i in range(4):
            c = self.u8()
            v = (v << 7) | (c & 0x7F)
            if not (c & 0x80):
                return v
        raise SmfError("vlq 超过 4 字节 (偏移 %d)" % (self.p - 4))


# ---------------------------------------------------------------------------
# 头 / chunk
# ---------------------------------------------------------------------------

def _read_chunk(r):
    """读一个 chunk: 返回 (id4, length, data_start)。length 可能是 '>' 表示延伸到文件尾。"""
    off = r.p
    cid = r.raw(4)
    ln = r.u32()
    if cid == b"MThd" or cid == b"MTrk":
        r._need(ln)
        return cid, ln, off
    # 未知 chunk: 跳过（SMF 允许厂商私有 chunk）
    if ln > r.n - r.p:
        ln = r.n - r.p          # 声明长度溢出 → 只能吃到文件尾
        r.p = r.n
        return cid, ln, off
    r.p += ln
    return None, ln, off


def parse_header(r):
    off = r.p
    if r.raw(4) != b"MThd":
        raise SmfError("缺少 MThd magic (偏移 %d): %r" % (off, r.b[off:off + 4]))
    hlen = r.u32()
    if hlen < 6:
        raise SmfError("MThd 长度 %d < 6" % hlen)
    fmt = r.u16()
    ntrks = r.u16()
    division = r.u16()
    extra = r.raw(hlen - 6)      # 规范允许头更长, 保留但不解释
    return {
        "format": fmt,
        "ntrks": ntrks,
        "division_raw": division,
        "smpte": division >= 0x8000,
        "ticks_per_beat": None if division >= 0x8000 else division,
        "smpte_fps": -((division >> 8) & 0xFF) if division >= 0x8000 else None,
        "smpte_tpf": (division & 0xFF) if division >= 0x8000 else None,
        "header_bytes": hlen,
        "header_extra_hex": extra.hex() if extra else None,
    }


# ---------------------------------------------------------------------------
# 轨道事件
# ---------------------------------------------------------------------------

def _decode_text(data):
    """meta 文本负载编码探测。

    本项目实测: 同一个 jar 里的曲子 track name 混了三种编码 ——
      * ASCII        : b"pal2 (composing)" / b"logo" / b"untitled"
      * GB2312/GBK   : b"\\xcf\\xc1\\xbd\\xa6\\xc6\\xb4\\xd2\\xf4\\xce\\xf6" → "战斗背景音乐"
                        (97/98/2002 年国产 MIDI 音源软件的默认系统locale 编码)
      * 坏字节       : syc/sz/yw 的 track name 混了 GBK 高位字节与孤立 \\x80-\\xff
                        → 这些字节**不是**合法 GBK 也不��合法 UTF-8, 无法还原原文, 只能原样输出
    返回 (文本, 编码标签)。文本一律不猜: 解不出就 latin-1 原样, 并标 encoding="raw-latin1"。
    """
    if not data:
        return "", "empty"
    for enc in ("utf-8", "gbk", "big5", "shift_jis"):
        try:
            return data.decode(enc), enc
        except UnicodeDecodeError:
            continue
    return data.decode("latin-1"), "raw-latin1"


def _ctrl_name(num):
    return CC_NAME.get(num, "cc_%d" % num)


def _inst_name(ch, num):
    if ch == 9:
        return PERCUSSION.get(num, "perc_%d" % num)
    return GM_PROGRAM[num] if 0 <= num < len(GM_PROGRAM) else "prog_%d" % num


def parse_track(r, length, index, division, anomalies):
    """解析一个 MTrk 的 length 字节, 返回 (events, end_tick, saw_eot, real_len)。"""
    start = r.p
    end = start + length
    if end > r.n:
        anomalies.append({
            "kind": "track_overrun",
            "track": index,
            "detail": "MTrk 声明长度 %d 超出文件尾, 实际只有 %d" % (length, r.n - start),
        })
        end = r.n
    tr = R(r.b[:end], start)          # 子游标: 保证不会读到本轨之外
    events = []
    tick = 0
    running = None
    saw_eot = False
    last_status = None

    while tr.p < end:
        ev_off = tr.p
        delta = tr.vlq()
        tick += delta
        if tr.p >= end:
            anomalies.append({
                "kind": "track_truncated",
                "track": index,
                "offset": ev_off,
                "detail": "轨尾 delta 之后没有事件字节",
            })
            break
        b = tr.b[tr.p]

        if b == 0xFF:                  # ---- meta ----
            tr.p += 1
            mtype = tr.u8()
            mlen = tr.vlq()
            payload = tr.raw(mlen)
            ev = {
                "tick": tick, "abs_tick": tick, "offset": ev_off,
                "delta": delta, "type": "meta",
                "meta_type": mtype, "meta_name": META.get(mtype, "unknown_0x%02X" % mtype),
                "length": mlen,
            }
            mt = mtype
            if mt == 0x2F:
                ev["value"] = None
                saw_eot = True
            elif mt == 0x51:
                upb = (payload[0] << 16) | (payload[1] << 8) | payload[2] if len(payload) == 3 else None
                ev["us_per_beat"] = upb
                ev["bpm"] = round(60000000.0 / upb, 4) if upb else None
            elif mt == 0x58:
                if len(payload) >= 2:
                    ev["numerator"] = payload[0]
                    ev["denominator"] = payload[1]          # 原始字段: 是 2 的幂 (2=¼, 3=⅛)
                    ev["denominator_real"] = 1 << payload[1]  # 实际分母: 4 / 8
                    ev["beats_per_bar"] = payload[0] / float(1 << payload[1])
                    ev["cc"] = "%d*%d,%d" % (payload[0], payload[1], payload[1])
                    ev["midi_clocks_per_click"] = payload[2] if len(payload) > 2 else None
            elif mt == 0x59:
                if len(payload) >= 2:
                    sf = payload[0] if payload[0] < 128 else payload[0] - 256
                    mi = payload[1] if payload[1] < 128 else payload[1] - 256
                    ev["sf"] = sf
                    ev["mi"] = mi
                    ev["major"] = (mi == 0)
                    ev["circle_of_fifths"] = sf
                    ev["key"] = _key_name(sf, mi)
                    ev["key_tonic"] = _tonic(sf)                # 不带 major/minor 后缀
            elif mt == 0x54:
                ev["smpte_offset_raw_hex"] = payload.hex()
            elif mt == 0x00:
                ev["sequence_number"] = (payload[0] << 8) | payload[1] if len(payload) == 2 else None
            elif mt == 0x20:
                ev["midi_channel_prefix"] = payload[0] if payload else None
            elif mt == 0x09 or mt == 0x0B:
                ev["port"] = payload[0] if payload else None
            if mtype in (0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08):
                txt, enc = _decode_text(payload)
                ev["text"] = txt
                ev["text_encoding"] = enc
            if mtype == 0x7F:
                ev["data_hex"] = payload.hex()
            events.append(ev)
            last_status = None       # meta 不清除 running status
            if mt == 0x2F:
                if tr.p < end:
                    anomalies.append({
                        "kind": "data_after_eot",
                        "track": index,
                        "offset": ev_off,
                        "detail": "EOT 之后还有 %d 字节未解析" % (end - tr.p),
                    })
                break

        elif b in (0xF0, 0xF7):       # ---- sysex ----
            st = b
            tr.p += 1
            slen = tr.vlq()
            payload = tr.raw(slen)
            events.append({
                "tick": tick, "abs_tick": tick, "offset": ev_off, "delta": delta,
                "type": "sysex",
                # F0 形式按规范负载**不含**结尾 F7; F7 (escape) 形式则**含**。
                # logo.mid 用的是 F7 形式且负载真的以 F7 结尾 —— 原样保留, 不替调用方做删除。
                "kind": "f0" if st == 0xF0 else "f7",
                "length": slen,
                "trailing_f7": bool(payload) and payload[-1] == 0xF7,
                "data_hex": payload.hex(),
            })
            last_status = None

        else:                          # ---- 通道事件 (含 running status) ----
            if b & 0x80:
                status = b
                tr.p += 1
                if status < 0xF0:
                    running = status
                last_status = status
            else:
                if running is None:
                    anomalies.append({
                        "kind": "running_status_without_status",
                        "track": index, "offset": ev_off,
                        "detail": "首字节 0x%02X 不是状态字节且无 running status" % b,
                    })
                    raise SmfError("轨 %d 偏移 %d: 无 running status 的数据字节 0x%02X"
                                   % (index, ev_off, b))
                status = running
            if status >= 0xF0:
                raise SmfError("轨 %d 偏移 %d: 非法状态字节 0x%02X" % (index, ev_off, status))

            hi = status >> 4
            ch = status & 0x0F
            name = CHAN_EV[hi]
            nd = 1 if hi == 0xC or hi == 0xD else 2
            d1 = tr.u8()
            d2 = tr.u8() if nd == 2 else None
            ev = {
                "tick": tick, "abs_tick": tick, "offset": ev_off, "delta": delta,
                "type": name, "status": status, "channel": ch,
                "running": status == last_status and not (b & 0x80),
            }
            if hi == 0x9:
                ev["note"] = d1
                ev["velocity"] = d2
                ev["note_name"] = _note_name(d1)
            elif hi == 0x8:
                ev["note"] = d1
                ev["velocity"] = d2
                ev["note_name"] = _note_name(d1)
            elif hi == 0xB:
                ev["controller"] = d1
                ev["controller_name"] = _ctrl_name(d1)
                ev["value"] = d2
                if d1 == 64:
                    ev["sustain"] = bool(d2 >= 64)
            elif hi == 0xC:
                ev["program"] = d1
                ev["instrument"] = _inst_name(ch, d1)
            elif hi == 0xE:
                ev["lsb"] = d1
                ev["msb"] = d2
                ev["bend"] = (d2 << 7) | d1
                ev["semitones"] = round((((d2 << 7) | d1) - 8192) / 8192.0, 4)
            elif hi == 0xA:
                ev["note"] = d1
                ev["pressure"] = d2
            elif hi == 0xD:
                ev["pressure"] = d1
            events.append(ev)

    if not saw_eot:
        anomalies.append({
            "kind": "missing_eot",
            "track": index,
            "detail": "轨结束但没有 0x2F end of track",
        })
    return events, tick, saw_eot, tr.p - start


_KEYS = ["Cb", "Gb", "Db", "Ab", "Eb", "Bb", "F", "C", "G", "D", "A", "E",
         "B", "F#", "C#", "G#", "D#", "A#", "E#", "B#"]


def _tonic(sf):
    """调号升降数 sf(-7..7) → 主音名。直接 sf+7 索引, **不能取模**。

    (sf+7)%12 是错的: sf=7 (C# 大调) 会算成 14%12=2 → 误报 "Db"。
    """
    i = sf + 7
    return _KEYS[i] if 0 <= i < len(_KEYS) else "?sf%d" % sf


def _key_name(sf, mi):
    """sf = 升降号数(-7..7); mi = 0 大调 / 1 小调 (SMF 里是 1 字节)。"""
    return "%s %s" % (_tonic(sf), "major" if mi == 0 else "minor")


_NOTE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]


def _note_name(n):
    return "%s%d" % (_NOTE[n % 12], n // 12 - 1)


# ---------------------------------------------------------------------------
# 时间轴
# ---------------------------------------------------------------------------

def build_tempo_map(tempo_events, default_uspb=500000):
    """tempo_events: [(abs_tick, us_per_beat)] → 排序去重后的 tempo_map。"""
    seen = {}
    for t, u in tempo_events:
        if u and u > 0:
            seen[t] = u
    out = [{"tick": 0, "us_per_beat": default_uspb}]
    for t in sorted(seen):
        if t == 0:
            out[0]["us_per_beat"] = seen[0]
        else:
            out.append({"tick": t, "us_per_beat": seen[t]})
    return out


def tick_to_us(ticks, tempo_map, division):
    """分段线性积分。返回该 tick 的微秒偏移。"""
    if division >= 0x8000:
        return None                    # SMPTE: 直接是绝对时间, 不做换算
    uspb = tempo_map[0]["us_per_beat"]
    us = 0.0
    cur = 0
    for seg in tempo_map:
        if seg["tick"] > ticks:
            break
        if seg["tick"] > cur:
            dt = (seg["tick"] - cur) / float(division)
            us += dt * uspb
            cur = seg["tick"]
        uspb = seg["us_per_beat"]
    us += (ticks - cur) / float(division) * uspb
    return int(round(us))


def merge_notes(tracks):
    """跨轨合并 note on/off → 可直接演奏的音符表。

    ★ 关键: 同一 (轨, 通道, 音高) 允许**重叠的多个 note on** —— 实测 syg.mid 轨 2
      在 tick 1152 与 1160 连续两个 `note_on note=76` 而中间没有 note off,
      tick 1164 才连发两个 note off。所以每个 key 必须是 **FIFO 队列**而不是单槽,
      否则后一个 on 会覆盖前一个, 多出来的 note off 就成了孤儿 (syg.mid 15 处 / ssm 2 处 / syc 2 处)。

    匹配规则 (按优先级):
      1. 同 track + 同 channel + 同 note 队列内最早的一个 (FIFO)
      2. 兜底: 同 channel + 同 note 跨轨队列
      3. 悬空 note on → 用同轨最后一个事件的 tick 当长度, 记 anomaly
    note on 且 velocity==0 按标准视为 note off。
    """
    ons = {}                 # uid -> (tidx, ch, note, tick, vel)
    by_track = {}            # (tidx, ch, note) -> deque(uid)
    by_chan = {}             # (ch, note)       -> deque(uid)
    consumed = set()
    notes = []
    anomalies = []
    uid = 0

    for t in tracks:
        ti = t["index"]
        for ev in t["events"]:
            ty = ev["type"]
            if ty not in ("note_on", "note_off"):
                continue
            ch, note = ev["channel"], ev["note"]
            if ty == "note_on" and ev["velocity"] > 0:
                ons[uid] = (ti, ch, note, ev["tick"], ev["velocity"])
                by_track.setdefault((ti, ch, note), deque()).append(uid)
                by_chan.setdefault((ch, note), deque()).append(uid)
                uid += 1
                continue
            # ---- note off: 取同轨同音高队列里最早的一个 ----
            dq = by_track.get((ti, ch, note))
            src = "same_track"
            if not dq:
                dq = by_chan.get((ch, note))
                src = "cross_track"
            if not dq:
                anomalies.append({
                    "kind": "orphan_note_off",
                    "track": ti,
                    "detail": "通道 %d 音符 %d 的 note off 没有任何 note on 可配" % (ch, note),
                })
                continue
            u = dq.popleft()
            consumed.add(u)
            src_ti, _, _, start, vel = ons[u]
            if src == "cross_track":
                anomalies.append({
                    "kind": "cross_track_note_pair",
                    "detail": "轨 %d 通道 %d 音符 %d 的 note off 无同轨配对, 用轨 %d 的 note on 兜底"
                              % (ti, ch, note, src_ti),
                })
            notes.append({
                "tick": start,
                "dur_ticks": max(0, ev["tick"] - start),
                "channel": ch,
                "note": note,
                "velocity": vel,
                "track": src_ti,
                "off_velocity": ev.get("velocity"),
                "off_tick": ev["tick"],
                "paired": src,
            })

    # ---- 悬空 note on (没有 note off) ----
    for u, (ti, ch, note, start, vel) in sorted(ons.items()):
        if u in consumed:
            continue
        last = tracks[ti]["events"][-1]["tick"] if tracks[ti]["events"] else 0
        notes.append({
            "tick": start,
            "dur_ticks": max(0, last - start),
            "channel": ch,
            "note": note,
            "velocity": vel,
            "track": ti,
            "off_velocity": None,
            "off_tick": None,
            "paired": "unterminated",
            "unterminated": True,
        })
        anomalies.append({
            "kind": "unterminated_note_on",
            "track": ti,
            "detail": "通道 %d 音符 %d 从 tick %d 起没有 note off, 时长按轨尾 %d 截断"
                      % (ch, note, start, last),
        })

    notes.sort(key=lambda n: (n["tick"], n["channel"], n["note"], n["track"]))
    return notes, anomalies


# ---------------------------------------------------------------------------
# 主入口
# ---------------------------------------------------------------------------

def parse_smf(data, name="<bytes>", strict=True):
    """解析 SMF 字节流。strict=True 时任何残留立即抛 SmfError。"""
    anomalies = []
    r = R(data)
    header = parse_header(r)
    division = header["division_raw"]
    tracks = []
    tempo_events = []

    while r.p < r.n:
        if r.n - r.p < 8:
            # 不足一个 chunk 头 → 只能是残留, 留给下面的 trailing_bytes 检查
            break
        chunk_off = r.p
        cid, ln, _ = _read_chunk(r)
        if cid is None:
            anomalies.append({
                "kind": "unknown_chunk",
                "offset": chunk_off,
                "detail": "跳过非 MThd/MTrk chunk (4 字节 id 未知)",
            })
            continue
        if cid != b"MTrk":
            anomalies.append({
                "kind": "unexpected_chunk",
                "offset": chunk_off,
                "detail": "MThd 之后出现额外 MThd",
            })
            continue
        idx = len(tracks)
        data_start = r.p
        events, end_tick, saw_eot, real_len = parse_track(r, ln, idx, division, anomalies)
        r.p = max(r.p, data_start + real_len)     # 无论轨内解析到哪, 游标必须跳过整轨
        if real_len != ln:
            anomalies.append({
                "kind": "track_length_mismatch",
                "track": idx,
                "detail": "声明长度 %d, 实际解析 %d" % (ln, real_len),
            })
        nm = next((e["text"] for e in events
                   if e["type"] == "meta" and e["meta_type"] == 0x03), None)
        trk = {
            "index": idx,
            "name": nm,
            "offset": chunk_off,
            "declared_length": ln,
            "parsed_length": real_len,
            "has_eot": saw_eot,
            "end_tick": end_tick,
            "event_count": len(events),
            "events": events,
        }
        tracks.append(trk)
        for e in events:
            if e["type"] == "meta" and e["meta_type"] == 0x51 and e.get("us_per_beat"):
                tempo_events.append((e["abs_tick"], e["us_per_beat"]))

    if len(tracks) != header["ntrks"]:
        anomalies.append({
            "kind": "ntrks_mismatch",
            "detail": "头声明 %d 轨, 实际 %d 轨" % (header["ntrks"], len(tracks)),
        })

    trailing = data[r.p:]
    if trailing:
        anomalies.append({
            "kind": "trailing_bytes",
            "offset": r.p,
            "length": len(trailing),
            "detail": "所有 chunk 之后还剩 %d 字节: %s"
                      % (len(trailing), trailing[:16].hex()),
        })
        if strict:
            raise SmfError("%s: %d 字节残留 (偏移 %d) = %s"
                           % (name, len(trailing), r.p, trailing[:16].hex()))

    tempo_map = build_tempo_map(tempo_events)
    merged, note_anoms = merge_notes(tracks)
    anomalies.extend(note_anoms)

    dur_ticks = max([t["end_tick"] for t in tracks], default=0)
    div = header["ticks_per_beat"] or 96
    for n in merged:
        n["note_name"] = _note_name(n["note"])
        n["us"] = tick_to_us(n["tick"], tempo_map, division) if division < 0x8000 else None
        d = tick_to_us(n["tick"] + n["dur_ticks"], tempo_map, division) if division < 0x8000 else None
        n["dur_us"] = (d - n["us"]) if (d is not None and n["us"] is not None) else None

    if division >= 0x8000:
        fps = header["smpte_fps"] or 25
        dur_us = int(round(dur_ticks * 1000000.0 / (fps * header["smpte_tpf"])))
    else:
        dur_us = tick_to_us(dur_ticks, tempo_map, division)

    return {
        "source": {
            "file": name,
            "size": len(data),
            "sha256": hashlib.sha256(data).hexdigest(),
            "container": "SMF (未压缩裸 MIDI, 无 gzip 头)",
        },
        "header": header,
        "tracks": tracks,
        "merged": merged,
        "tempo_map": tempo_map,
        "duration_ticks": dur_ticks,
        "duration_seconds": round(dur_us / 1e6, 4),
        "duration_us": dur_us,
        "anomalies": anomalies,
        "_stats": _stats(tracks, merged, tempo_map),
    }


def _stats(tracks, merged, tempo_map):
    chans = {}
    progs = {}
    ccs = {}
    for t in tracks:
        for e in t["events"]:
            ty = e["type"]
            if "channel" in e:
                chans.setdefault(e["channel"], 0)
                chans[e["channel"]] += 1
            if ty == "program_change":
                progs.setdefault(e["instrument"], []).append(e["program"])
            if ty == "control_change":
                ccs.setdefault(e["controller_name"], 0)
                ccs[e["controller_name"]] += 1
    per_track = []
    for t in tracks:
        n = sum(1 for e in t["events"]
                if e["type"] == "note_on" and e.get("velocity", 0) > 0)
        tc = sorted({e["channel"] for e in t["events"] if "channel" in e})
        pr = [e["program"] for e in t["events"] if e["type"] == "program_change"]
        nm = [e["meta_name"] for e in t["events"] if e["type"] == "meta"]
        per_track.append({
            "index": t["index"],
            "name": t["name"],
            "events": t["event_count"],
            "note_ons": n,
            "channels": tc,
            "programs": pr,
            "end_tick": t["end_tick"],
            "meta_kinds": sorted(set(nm)),
        })
    return {
        "tracks": len(tracks),
        "events": sum(t["event_count"] for t in tracks),
        "notes_merged": len(merged),
        "note_on_total": sum(1 for t in tracks for e in t["events"]
                             if e["type"] == "note_on" and e.get("velocity", 0) > 0),
        "note_off_total": sum(1 for t in tracks for e in t["events"] if e["type"] == "note_off"),
        "channels_used": sorted(chans),
        "drum_channel_used": 9 in chans,
        "programs": {k: sorted(set(v)) for k, v in sorted(progs.items())},
        "controllers": dict(sorted(ccs.items())),
        "tempo_changes": len(tempo_map),
        "per_track": per_track,
    }


def analyze(path):
    with open(path, "rb") as fh:
        data = fh.read()
    if data[:2] == b"\x1f\x8b":
        raise SmfError("%s 是 gzip 包裹的, 本工具只处理裸 SMF" % path)
    res = parse_smf(data, name=os.path.basename(path), strict=False)
    res["source"]["path"] = os.path.relpath(path, ROOT)
    return res


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

FILES = [
    ("1-解包产物/解包树/mid/%s.mid", ["boss", "menu", "ss", "ssm", "syc",
                                     "syg", "syt", "sz", "xg", "yw"]),
    ("1-解包产物/解包树/corp/%s.mid", ["logo"]),
]


def _collect():
    out = []
    for rel, names in FILES:
        for nm in names:
            out.append((nm, os.path.join(ROOT, rel % nm)))
    return out


def _dump(res):
    print("%s  fmt=%d ntrks=%d div=%d  %.2fs  notes=%d  anomalies=%d"
          % (res["source"]["file"], res["header"]["format"], res["header"]["ntrks"],
             res["header"]["division_raw"], res["duration_seconds"],
             len(res["merged"]), len(res["anomalies"])))
    for t in res["tracks"]:
        print("  track %-2d %-14s events=%-5d note_ons=%-4d end_tick=%-6d ch=%s"
              % (t["index"], (t["name"] or "-")[:14], t["event_count"],
                 sum(1 for e in t["events"]
                     if e["type"] == "note_on" and e.get("velocity", 0) > 0),
                 t["end_tick"],
                 sorted({e["channel"] for e in t["events"] if "channel" in e})))
    for n in res["merged"][:20]:
        print("    tick=%-6d dur=%-5d ch=%-2d %-4s vel=%-3d us=%s"
              % (n["tick"], n["dur_ticks"], n["channel"], n["note_name"],
                 n["velocity"], n["us"]))
    for a in res["anomalies"]:
        print("  ! %s: %s" % (a["kind"], a.get("detail", "")))


def main(argv):
    if len(argv) > 1 and argv[1] in ("-h", "--help"):
        print(__doc__)
        return 0
    if len(argv) > 1 and argv[1] not in ("--dump",):
        res = analyze(argv[1])
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0

    os.makedirs(OUT, exist_ok=True)
    index = {
        "format": "SMF (Standard MIDI File)",
        "spec": "MMA Standard MIDI Files 1.0 / 1.1",
        "player": {
            "api": "javax.microedition.media.Manager.createPlayer(InputStream, \"audio/midi\")",
            "source": "4-文档/反编译源码/ah.java:184",
            "loop_api": "javax.microedition.media.Player.setLoopCount(int)",
            "loop_source": "4-文档/反编译源码/ah.java:185",
            "mid_dir_key": "MID资源目录",
            "mid_dir_value": "/mid/",
            "mid_dir_source": "cn/com/etgame/cls/system/d.java:127 (config_game.str)",
            "script_api": "midi.play(<name>, <loopCount>)",
            "script_source": "4-文档/反编译源码/e.java:3074-3082 (地图脚本) / f.java:1377-1383 (战斗脚本)",
            "loop_count_meaning": "J2ME Player.setLoopCount(int): -1 = 无限循环, 0 = 不重播, n>0 = 总共播 n 遍",
            "loop_count_source": "4-文档/反编译源码/ah.java:126-128 (a(int) 存 d) → ah.java:185 (setLoopCount(d))",
            "observed_loop_counts": {
                "地图脚本 midi.play(x,-1)": -1,
                "战斗脚本 midi.play(x,-1)": -1,
                "enemy.str 第5列 BGM (f.java:473-477)": -1,
                "menu.mid 主菜单 (b.java:79-82)": -1,
                "corp/logo.mid 片头 (h.java:37-38)": 1
            },
        },
        "count": 0,
        "total_notes": 0,
        "total_events": 0,
        "files": [],
    }
    allfiles = _collect()
    for nm, path in allfiles:
        res = analyze(path)
        fn = os.path.join(OUT, nm + ".json")
        with open(fn, "w", encoding="utf-8") as fh:
            json.dump(res, fh, ensure_ascii=False, indent=1)
        s = res["_stats"]
        print("%-8s fmt=%d trk=%-3d div=%-4d %8.2fs notes=%-5d tempo_changes=%d anom=%d"
              % (nm, res["header"]["format"], s["tracks"], res["header"]["division_raw"],
                 res["duration_seconds"], len(res["merged"]), s["tempo_changes"],
                 len(res["anomalies"])))
        index["count"] += 1
        index["total_notes"] += len(res["merged"])
        index["total_events"] += s["events"]
        index["byte_exact"] = index.get("byte_exact", True) and not any(
            a["kind"] == "trailing_bytes" for a in res["anomalies"])
        tsig = next((e.get("cc") for t in res["tracks"] for e in t["events"]
                     if e["type"] == "meta" and e["meta_type"] == 0x58), None)
        index["files"].append({
            "name": nm,
            "file": res["source"]["path"],
            "size": res["source"]["size"],
            "sha256": res["source"]["sha256"],
            "json": "3-数据/05-资源/mid/%s.json" % nm,
            "smf_format": res["header"]["format"],
            "ntrks": res["header"]["ntrks"],
            "division": res["header"]["division_raw"],
            "smpte": res["header"]["smpte"],
            "ticks_per_beat": res["header"]["ticks_per_beat"],
            "tracks": s["tracks"],
            "track_names": [t["name"] for t in res["tracks"]],
            "events": s["events"],
            "notes": len(res["merged"]),
            "duration_ticks": res["duration_ticks"],
            "duration_seconds": res["duration_seconds"],
            "bpm": res["tempo_map"][0]["us_per_beat"] and
                   round(60000000.0 / res["tempo_map"][0]["us_per_beat"], 4),
            "tempo_changes": s["tempo_changes"],
            "time_signature": tsig,
            "channels_used": s["channels_used"],
            "drum_channel_used": s["drum_channel_used"],
            "programs": sorted(s["programs"]),
            "controllers": s["controllers"],
            "meta_kinds": sorted({e["meta_name"] for t in res["tracks"]
                                  for e in t["events"] if e["type"] == "meta"}),
            "byte_exact": not any(a["kind"] == "trailing_bytes" for a in res["anomalies"]),
            "anomalies": res["anomalies"],
        })
    index["files"].sort(key=lambda x: x["file"])
    index["anomaly_total"] = sum(len(f["anomalies"]) for f in index["files"])
    with open(os.path.join(OUT, "_index.json"), "w", encoding="utf-8") as fh:
        json.dump(index, fh, ensure_ascii=False, indent=1)
    print("\n写出 %d 个 JSON + _index.json → %s" % (index["count"], os.path.relpath(OUT, ROOT)))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))